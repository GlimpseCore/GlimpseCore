using Microsoft.Extensions.DependencyInjection;

namespace GlimpseCore
{
    public class GlimpseCoreServerServiceCollectionBuilder : GlimpseCoreServiceCollectionBuilder
    {
        public GlimpseCoreServerServiceCollectionBuilder(IServiceCollection innerCollection)
            : base(innerCollection)
        {
        }
    }
}