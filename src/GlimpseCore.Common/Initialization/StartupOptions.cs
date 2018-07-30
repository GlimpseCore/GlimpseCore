using System;
using Microsoft.AspNetCore.Builder;

namespace GlimpseCore.Initialization
{
    public class StartupOptions : IStartupOptions
    {
        public StartupOptions(IApplicationBuilder builder)
        {
            Builder = builder;
        }

        private IApplicationBuilder Builder { get; }

        public IServiceProvider ApplicationServices => Builder.ApplicationServices;
    }
}