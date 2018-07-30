using System;

namespace GlimpseCore.Initialization
{
    public interface IStartupOptions
    {
        IServiceProvider ApplicationServices { get; }
    }
}
