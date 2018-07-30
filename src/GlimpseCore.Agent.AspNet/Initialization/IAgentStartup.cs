using GlimpseCore.Initialization;

namespace GlimpseCore.Initialization
{
    public interface IAgentStartup
    {
        void Run(IStartupOptions options);
    }
}
