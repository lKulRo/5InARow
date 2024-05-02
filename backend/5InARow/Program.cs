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
        .AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader()
        //.WithOrigins("http://localhost:8080")
        //.SetIsOriginAllowed(origin => true)
        .AllowCredentials());
}

app.UseAuthorization();

app.MapControllers();

app.MapHub<GameHub>("/hub");

app.Run();
