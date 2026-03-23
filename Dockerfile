FROM node:20-alpine AS css-build
WORKDIR /app
COPY PeaceInternational/package*.json ./
RUN npm ci
COPY PeaceInternational/ ./
RUN npm run build:css

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY PeaceInternational.sln ./
COPY PeaceInternational/PeaceInternational.Web.csproj PeaceInternational/
COPY PeaceInternational.Core/PeaceInternational.Core.csproj PeaceInternational.Core/
COPY PeaceInternational.Infrastructure/PeaceInternational.Infrastructure.csproj PeaceInternational.Infrastructure/
RUN dotnet restore
COPY . .
COPY --from=css-build /app/wwwroot/css/output.css PeaceInternational/wwwroot/css/output.css
RUN dotnet publish PeaceInternational/PeaceInternational.Web.csproj -c Release -o /publish /p:SkipTailwind=true

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /publish .
ENTRYPOINT ["dotnet", "PeaceInternational.Web.dll"]
