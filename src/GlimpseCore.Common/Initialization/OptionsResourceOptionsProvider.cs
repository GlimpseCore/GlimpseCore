using Microsoft.Extensions.Options;

namespace GlimpseCore.Initialization
{
    public class OptionsResourceOptionsProvider : IResourceOptionsProvider
    {
        private readonly ResourceOptions _resourceOptions;

        public OptionsResourceOptionsProvider(IOptions<ResourceOptions> optionsAccessor)
        {
            _resourceOptions = optionsAccessor.Value;
        }

        public ResourceOptions BuildInstance()
        {
            return _resourceOptions;
        }
    }
}
