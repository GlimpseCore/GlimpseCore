using System.Collections.Generic;
using System.Threading.Tasks;
using GlimpseCore.Initialization;
using GlimpseCore.Server.Resources;
using Microsoft.AspNetCore.Http;

namespace GlimpseCore.Server.Internal.Resources
{
    public class ExportConfigurationResource : IResource
    {
        private readonly IResourceOptionsProvider _resourceOptionsProvider;

        public ExportConfigurationResource(IResourceOptionsProvider resourceOptionsProvider)
        {
            _resourceOptionsProvider = resourceOptionsProvider;
        }

        public async Task Invoke(HttpContext context, IDictionary<string, string> parameters)
        {
            var resourceOptions = _resourceOptionsProvider.BuildInstance();
            var json = $@"{{
""resources"":
    {{
        ""browserAgentScriptTemplate"" : ""{resourceOptions.BrowserAgentScriptTemplate}"",
        ""hudScriptTemplate"" : ""{resourceOptions.HudScriptTemplate}"",
        ""messageIngressTemplate"" : ""{resourceOptions.MessageIngressTemplate}"",
        ""metadataTemplate"" : ""{resourceOptions.MetadataTemplate}"",
        ""contextTemplate"" : ""{resourceOptions.ContextTemplate}"",
        ""clientScriptTemplate"" : ""{resourceOptions.ClientScriptTemplate}""
    }}
}}";

            await context.RespondWith(
                new RawJson(json)
                .AsFile("glimpsecore.json"));
        }

        public string Name => "export-config";
        public IEnumerable<ResourceParameter> Parameters => new [] { ResourceParameter.Hash };
        public ResourceType Type => ResourceType.Client;
    }
}
