using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Options;

namespace GlimpseCore.Agent.Configuration
{ 
    public class DefaultRequestIgnorerContentTypeProvider : IRequestIgnorerContentTypeProvider
    {
        public DefaultRequestIgnorerContentTypeProvider(IOptions<GlimpseCoreAgentOptions> optionsAccessor)
        {
            var contentTypes = optionsAccessor.Value.IgnoredContentTypes;
            ContentTypes = contentTypes.ToList();
        }

        public IReadOnlyList<string> ContentTypes { get; }
    }
}