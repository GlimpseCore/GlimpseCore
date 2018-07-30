using Microsoft.Extensions.DependencyInjection;

namespace GlimpseCore
{
    public class GlimpseCoreAgentServiceCollectionBuilder : GlimpseCoreServiceCollectionBuilder
    {
        public GlimpseCoreAgentServiceCollectionBuilder(IServiceCollection innerCollection)
            : base(innerCollection)
        {
        }
    }
}