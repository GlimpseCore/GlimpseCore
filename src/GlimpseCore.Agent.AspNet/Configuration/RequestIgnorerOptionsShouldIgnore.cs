using System;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace GlimpseCore.Agent.Configuration
{
    public class RequestIgnorerOptionsShouldIgnore : IRequestIgnorer
    {
        private readonly Func<HttpContext, bool> _shouldIgnore;

        public RequestIgnorerOptionsShouldIgnore(IOptions<GlimpseCoreAgentOptions> optionsAccessor)
        {
            _shouldIgnore = optionsAccessor.Value.ShouldIgnore;
        }
        
        public bool ShouldIgnore(HttpContext context)
        {
            return _shouldIgnore != null ? _shouldIgnore(context) : false;
        }
    }
}
