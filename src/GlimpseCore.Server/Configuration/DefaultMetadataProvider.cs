using System.Collections.Generic;
using System.Linq;
using GlimpseCore.Internal.Extensions;
using GlimpseCore.Server.Internal;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace GlimpseCore.Server.Configuration
{
    public class DefaultMetadataProvider : IMetadataProvider
    {
        private readonly IResourceManager _resourceManager;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly GlimpseCoreServerOptions _serverOptions;
        private Metadata _metadata;

        public DefaultMetadataProvider(IResourceManager resourceManager, IHttpContextAccessor httpContextAccessor, IOptions<GlimpseCoreServerOptions> serverOptions)
        {
            _resourceManager = resourceManager;
            _httpContextAccessor = httpContextAccessor;
            _serverOptions = serverOptions.Value;
        }

        public Metadata BuildInstance()
        {
            if (_metadata != null)
                return _metadata;

            var request = _httpContextAccessor.HttpContext.Request;
            var baseUrl = $"{request.Scheme}://{request.Host}/{_serverOptions.BasePath}/";
            var resources = _resourceManager.RegisteredUris.ToDictionary(kvp => kvp.Key.KebabCase(), kvp => $"{baseUrl}{kvp.Key}/{kvp.Value}");

            if (_serverOptions.OverrideResources != null)
            {
                _serverOptions.OverrideResources(resources);
            }

            _metadata = new Metadata(resources);

            return _metadata;
        }
    }
}