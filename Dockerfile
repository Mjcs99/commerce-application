FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY *.sln ./
COPY src/Commerce.Api/Commerce.Api.csproj src/Commerce.Api/
COPY src/Commerce.Application/Commerce.Application.csproj src/Commerce.Application/
COPY src/Commerce.Infrastructure/Commerce.Infrastructure.csproj src/Commerce.Infrastructure/
COPY src/Commerce.Contracts/Commerce.Contracts.csproj src/Commerce.Contracts/

RUN dotnet restore src/Commerce.Api/Commerce.Api.csproj

COPY . .
RUN dotnet publish src/Commerce.Api/Commerce.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Commerce.Api.dll"]
