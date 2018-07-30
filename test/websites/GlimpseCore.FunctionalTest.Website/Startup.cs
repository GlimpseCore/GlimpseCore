using System.Diagnostics.Tracing;
using GlimpseCore.Agent;
using GlimpseCore.Server;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace GlimpseCore.FunctionalTest.Website
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddGlimpseCore();

            services.AddMvc();
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseGlimpseCore();

            app.UseMvcWithDefaultRoute();
        }
    }
}
