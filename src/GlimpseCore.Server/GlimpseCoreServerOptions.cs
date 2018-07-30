using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace GlimpseCore.Server
{
    public class GlimpseCoreServerOptions
    {
        public bool AllowRemote { get; set; }

        public string BasePath { get; set; }

        public Action<IDictionary<string, string>> OverrideResources { get; set; }

        public Func<HttpContext, bool> AllowClientAccess { get; set; }

        public Func<HttpContext, bool> AllowAgentAccess { get; set; }
    }
}