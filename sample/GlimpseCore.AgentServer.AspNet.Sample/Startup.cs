using System;
using GlimpseCore.Agent;
using Microsoft.AspNetCore.Builder;
using GlimpseCore.Server;
using Microsoft.Extensions.DependencyInjection;

namespace GlimpseCore.AgentServer.AspNet.Sample
{
    public class Startup
    {
        public Startup()
        {
            Console.ForegroundColor = ConsoleColor.DarkCyan;
            Console.WriteLine("\nGLIMPSECORE AGENT+SERVER (ASPNET) RUNNING ON PORT 5100");
            Console.WriteLine("==================================================\n");
            Console.ResetColor();
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddGlimpseCore();
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseGlimpseCore();

            app.Use(next => new SamplePage().Invoke);
            /*
            app.Use(async (context, next) => {
                        var response = context.Response;

                        response.Headers.Set("Content-Type", "text/plain");

                        await response.WriteAsync("TEST!");
                    });
            */
            app.UseWelcomePage();

        }
    }
}
