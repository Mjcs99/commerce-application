using Commerce.Application.Services;
using Commerce.Application.Services.Outbox;
using Commerce.Infrastructure.Persistence;
using Commerce.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using Microsoft.OpenApi;
using Commerce.Application.Interfaces.In.Outbox;
using Commerce.Application.Interfaces.In;
using Commerce.Application.Handlers;
using Commerce.Api.Exceptions;
using Commerce.Application.DependencyInjection;
using Commerce.Infrastructure.Options;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;
using Commerce.Api.Hubs;
using Commerce.Api.Realtime;
using Commerce.Application.Interfaces.Out;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<IOutboxPublisher, OutboxPublisher>();
builder.Services.AddInfrastructureServices(builder.Configuration)
                .AddApplicationServices();
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(
        jwtBearerOptions =>
        {
            var clientId = builder.Configuration["AzureAd:ClientId"];

            jwtBearerOptions.TokenValidationParameters.ValidAudiences = new[]
            {
                clientId,
                $"api://{clientId}"
            };
        },
        microsoftIdentityOptions =>
        {
            builder.Configuration.Bind("AzureAd", microsoftIdentityOptions);
        },
        JwtBearerDefaults.AuthenticationScheme,
        subscribeToJwtBearerMiddlewareDiagnosticsEvents: false
    );
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", p => p.RequireRole("Admin"));
});
builder.Services.AddScoped<IIntegrationEventHandler, OrderPlacedEventHandler>();
builder.Services.AddScoped<IIntegrationEventHandler, OrderProcessedEmailHandler>();
builder.Services.AddScoped<IIntegrationEventHandler, OrderProcessedEventHandler>();
builder.Services.AddScoped<IHubPublisher, SignalROrderRealtimeNotifier>();
builder.Services.AddAuthorization();
builder.Services.AddApiVersioning();
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
});
builder.Services.AddProblemDetails(configure =>
{
    configure.CustomizeProblemDetails = context =>
    {
        context.ProblemDetails.Extensions.TryAdd("requestId", context.HttpContext.TraceIdentifier);
    };
});
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
// CORS

builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173", "https://localhost:5173", "https://orange-dune-09eaade0f.6.azurestaticapps.net")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
// Swagger UI via Swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Commerce API", Version = "v1" });

    c.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.OAuth2,
        Flows = new OpenApiOAuthFlows
        {
            AuthorizationCode = new OpenApiOAuthFlow
            {
                AuthorizationUrl = new Uri($"https://commercecustomers.ciamlogin.com/009fb04d-a59f-4035-9375-4448a9b6c727/oauth2/v2.0/authorize"),
                TokenUrl         = new Uri($"https://commercecustomers.ciamlogin.com/009fb04d-a59f-4035-9375-4448a9b6c727/oauth2/v2.0/token"),
                Scopes = new Dictionary<string, string>
                {
                    { $"api://c4879e2e-8e97-4001-bd8d-4e7fea53c27a/access_as_user", "Access Commerce API as user" }
                }
            }
        },
       
    });

    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("oauth2", document)] =
            new List<string>
            {
                "api://c4879e2e-8e97-4001-bd8d-4e7fea53c27a/access_as_user"
            }
    });

});

builder.Services.AddScoped<SeedData>();
builder.Services.AddSignalR();


var app = builder.Build();
app.MapHub<OrdersHub>("/orderHub");
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<CommerceDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Commerce API v1");

        c.OAuthClientId(builder.Configuration["Swagger:ClientId"]);
        c.OAuthAppName("Commerce Swagger UI");
        c.OAuthUsePkce();

        c.OAuthScopes("api://c4879e2e-8e97-4001-bd8d-4e7fea53c27a/access_as_user");

        c.OAuthScopeSeparator(" ");
    });

    using var scope = app.Services.CreateScope();
    var blobStorage = scope.ServiceProvider.GetRequiredService<IOptions<BlobStorageOptions>>();
    var seeder = scope.ServiceProvider.GetRequiredService<SeedData>();
    await seeder.SeedProductsAsync(count: 10);   
}
app.UseRouting(); 
app.UseCors("DevCors");
app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();