using Azure.Messaging.ServiceBus;
using Commerce.Application.Interfaces.In;
using Commerce.Infrastructure.Options;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
namespace Commerce.Infrastructure.Messaging;

public abstract class ServiceBusConsumerHostedService : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly ILogger<ServiceBusConsumerHostedService> _logger;
    private readonly ServiceBusClient _client;
    private readonly IOptionsMonitor<ServiceBusOptions> _optionsMonitor;

    private ServiceBusProcessor? _processor;

    public ServiceBusConsumerHostedService(
        IServiceProvider services,
        ILogger<ServiceBusConsumerHostedService> logger,
        ServiceBusClient client,
        IOptionsMonitor<ServiceBusOptions> optionsMonitor
        )
    {
        _services = services;
        _logger = logger;
        _client = client;
        _optionsMonitor = optionsMonitor;
    }
    
    protected abstract string OptionsName { get; }  

    public override async Task StartAsync(CancellationToken cancellationToken)
    {
        var options = _optionsMonitor.Get(OptionsName);

        _logger.LogInformation(
            "Starting {OptionsName}HostedService. Topic={Topic} Subscription={Subscription}",
            OptionsName,
            options.OrdersTopic,
            options.Subscription);

        _processor = _client.CreateProcessor(
            options.OrdersTopic,
            options.Subscription,
            new ServiceBusProcessorOptions
            {
                AutoCompleteMessages = false,   
                MaxConcurrentCalls = 1,         
                PrefetchCount = 0              
            });

        _processor.ProcessMessageAsync += ProcessMessageAsync;
        _processor.ProcessErrorAsync += ProcessErrorAsync;

        await _processor.StartProcessingAsync(cancellationToken);

        await base.StartAsync(cancellationToken);
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Keep ExecuteAsync alive until shutdown
        return Task.Delay(Timeout.InfiniteTimeSpan, stoppingToken);
    }

    private async Task ProcessMessageAsync(ProcessMessageEventArgs args)
    {
        var ct = args.CancellationToken;

        var messageId = args.Message.MessageId;
        var type = args.Message.Subject;              
        var payload = args.Message.Body.ToString();    
        
        if (string.IsNullOrWhiteSpace(type))
        {
            _logger.LogWarning("Received message with empty Subject. MessageId={MessageId}", messageId);
            await DeadLetterAsync(args, "MissingType", "Message Subject was empty.");
            return;
        }

        try
        {
            _logger.LogInformation("Received message. MessageId={MessageId} Type={Type}", messageId, type);

            using var scope = _services.CreateScope();
            var handlers = scope.ServiceProvider.GetRequiredService<IEnumerable<IIntegrationEventHandler>>();

            foreach (var handler in handlers.Where(h => h.CanHandle(type)))
            {
                await handler.HandleAsync(type, payload, ct);
            }
            
            await args.CompleteMessageAsync(args.Message, ct);

            _logger.LogInformation("Completed message. MessageId={MessageId} Type={Type}", messageId, type);
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            // cancellation
        }
        catch (Azure.RequestFailedException ex) when (ex.Status == 429)
        {
            _logger.LogWarning(ex, "Email throttled (429). Abandoning message for retry. MessageId={MessageId}", messageId);

            await Task.Delay(TimeSpan.FromSeconds(5), ct);

            await args.AbandonMessageAsync(args.Message, cancellationToken: ct);
            return;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed processing message. MessageId={MessageId} Type={Type}", messageId, type);       
            await DeadLetterAsync(args, "ProcessingFailed", ex.Message);
        }
    }

    private Task ProcessErrorAsync(ProcessErrorEventArgs args)
    {
        _logger.LogError(
            args.Exception,
            "Service Bus processor error. Entity={EntityPath} ErrorSource={ErrorSource} FullyQualifiedNamespace={Fqn}",
            args.EntityPath,
            args.ErrorSource,
            args.FullyQualifiedNamespace);

        return Task.CompletedTask;
    }

    private static Task DeadLetterAsync(ProcessMessageEventArgs args, string reason, string description)
        => args.DeadLetterMessageAsync(
            args.Message,
            deadLetterReason: reason,
            deadLetterErrorDescription: description,
            cancellationToken: args.CancellationToken);

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Stopping OrdersConsumerHostedService...");

        if (_processor is not null)
        {
            await _processor.StopProcessingAsync(cancellationToken);
            await _processor.DisposeAsync();
        }

        await base.StopAsync(cancellationToken);
    }
}


