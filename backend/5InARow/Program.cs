using _5InARow.Hubs;
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR().AddNewtonsoftJsonProtocol();

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(); 
    app.UseCors(x => x
        .AllowAnyMethod()
        .AllowAnyHeader()
        .SetIsOriginAllowed(origin => true)
        .AllowCredentials());
}
app.UseCors(x => x
        .WithOrigins("http://localhost:80")
        .WithOrigins("http://49.13.164.181")
        .WithOrigins("http://game.trungtran.de")
        .WithMethods("POST", "GET")
        .AllowAnyHeader()
        .AllowCredentials());

app.UseAuthorization();

app.MapControllers();

app.MapHub<GameHub>("/hub");

app.Run();
