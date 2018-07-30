using System;
using GlimpseCore.Server;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace GlimpseCore.Server.Configuration
{
    public class AllowAgentAccessOptions : IAllowAgentAccess
    {
        private readonly Func<HttpContext, bool> _allowAgentAccess;

        public AllowAgentAccessOptions(IOptions<GlimpseCoreServerOptions> optionsAccessor)
        {
            _allowAgentAccess = optionsAccessor.Value.AllowAgentAccess;
        }

        public bool AllowAgent(HttpContext context)
        {
            return _allowAgentAccess != null ? _allowAgentAccess(context) : true;
        }
    }
}
