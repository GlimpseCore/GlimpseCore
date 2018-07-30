using GlimpseCore.Internal;
using Microsoft.Extensions.DependencyInjection;

namespace GlimpseCore
{
    public class GlimpseCoreServiceCollectionBuilder : ServiceCollectionWrapper
    {
        public GlimpseCoreServiceCollectionBuilder(IServiceCollection innerCollection) 
            : base(innerCollection)
        {
        }
    }
}