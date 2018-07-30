using System;
using GlimpseCore.Agent;
using GlimpseCore.Initialization;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GlimpseCore.Agent.AspNet.Sample
{
    public class Startup
    {
        public Startup()
        {
            Console.ForegroundColor = ConsoleColor.DarkCyan;
            Console.WriteLine("\nGLIMPSECORE AGENT RUNNING ON PORT 5200");
            Console.WriteLine("==================================\n");
            Console.ResetColor();
        }

        public IConfiguration Configuration { get; set; }

        public void ConfigureServices(IServiceCollection services)
        {
            /* Example of how to use fixed provider

            TODO: This should be cleaned up with help of extension methods

            services.AddSingleton<IIgnoredRequestProvider>(x =>
            {
                var activator = x.GetService<ITypeActivator>();

                var urlPolicy = activator.CreateInstances<IIgnoredRequestPolicy>(new []
                    {
                        typeof(UriIgnoredRequestPolicy).GetTypeInfo(),
                        typeof(ContentTypeIgnoredRequestPolicy).GetTypeInfo()
                    }); 
                 
                var provider = new FixedIgnoredRequestProvider(urlPolicy);

                return provider; 
            });
            */

            services.AddGlimpseCore();
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseGlimpseCore();

            app.UseWelcomePage();
        }
    }
}
