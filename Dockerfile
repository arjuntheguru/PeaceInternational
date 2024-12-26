# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:2.1 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443


# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:2.1 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["PeaceInternational/PeaceInternational.Web.csproj", "PeaceInternational/"]
COPY ["PeaceInternational.Core/PeaceInternational.Core.csproj", "PeaceInternational.Core/"]
COPY ["PeaceInternational.Infrastructure/PeaceInternational.Infrastructure.csproj", "PeaceInternational.Infrastructure/"]
RUN dotnet restore "./PeaceInternational/PeaceInternational.Web.csproj"
COPY . .
WORKDIR "/src/PeaceInternational"
RUN dotnet build "./PeaceInternational.Web.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./PeaceInternational.Web.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PeaceInternational.Web.dll"]