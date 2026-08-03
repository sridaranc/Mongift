FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["GiftDelivery.Api.csproj", "./"]
RUN dotnet restore "GiftDelivery.Api.csproj"

COPY . .
RUN dotnet build "GiftDelivery.Api.csproj" -c Release -o /app/build
RUN dotnet publish "GiftDelivery.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5119
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5119

ENTRYPOINT ["dotnet", "GiftDelivery.Api.dll"]
