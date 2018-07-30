using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace GlimpseCore.Server.AspNet.Sample
{
    public class Startup
    {
        public Startup()
        {
            Console.ForegroundColor = ConsoleColor.DarkCyan;
            Console.WriteLine("\nGLIMPSECORE SERVER RUNNING ON PORT 5210");
            Console.WriteLine("===================================\n");
            Console.ResetColor();
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddGlimpseCore();
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseGlimpseCore();

            app.Run(async context =>
            {
                context.Response.ContentType = "text/html";
                context.Response.StatusCode = 200;
                await context.Response.WriteAsync(
@"
<html>
<head><title>Welcome to GlimpseCore Server!</title></head>
<body>
<h1><img src='http://TODO.com/content/logo100.png' style='vertical-align: middle;'> GlimpseCore Server</h1>
<p><ul><li><a href='/glimpsecore/client/index.html?hash=123&metadataUri=http%3A%2F%2Flocalhost%3A5210%2Fglimpsecore%2Fmetadata%2F%3Fhash%3D7f52ba69'>Launch Client</a></li><li><a href='/glimpsecore/export-config'>Download configuration.</a></li></ul></p>
</body>
</html>
");
            });
        }
    }
}
