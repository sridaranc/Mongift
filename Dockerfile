FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /src

COPY backend/GiftDelivery.Api.csproj ./backend/
RUN dotnet restore backend/GiftDelivery.Api.csproj

COPY backend/ ./backend/
RUN dotnet publish backend/GiftDelivery.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5119
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5119

ENTRYPOINT ["dotnet", "GiftDelivery.Api.dll"]
