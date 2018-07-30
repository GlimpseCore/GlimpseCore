using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Options;

namespace GlimpseCore.Agent.Configuration
{
    public class DefaultRequestIgnorerUriProvider : IRequestIgnorerUriProvider
    { 
        public DefaultRequestIgnorerUriProvider(IOptions<GlimpseCoreAgentOptions> optionsAccessor)
        {
            var ignoredUris = optionsAccessor.Value.IgnoredUris;
            IgnoredUris = ignoredUris.ToList(); 
        }

        public IReadOnlyList<Regex> IgnoredUris { get; }
    }
}