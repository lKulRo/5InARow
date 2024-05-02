FROM mcr.microsoft.com/dotnet/sdk:9.0-preview-alpine AS build

WORKDIR /app

COPY . .

WORKDIR /app/5InARow
RUN dotnet restore
RUN dotnet publish -c Release -o out



FROM mcr.microsoft.com/dotnet/aspnet:9.0-preview-alpine AS final

WORKDIR /app
COPY --from=build /app/5InARow/out .

ENTRYPOINT ["dotnet", "5InARow.dll"]
