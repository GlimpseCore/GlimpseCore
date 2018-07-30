using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GlimpseCore.Agent.Inspectors;
using GlimpseCore.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;

namespace GlimpseCore.Agent.Internal.Inspectors
{
    public class AjaxInspector : Inspector
    {
        private readonly IGlimpseCoreContextAccessor _context;

        public AjaxInspector(IGlimpseCoreContextAccessor context)
        {
            _context = context;
        }

        public override void Before(HttpContext context)
        {
            var isAjax = StringValues.Empty;
            if (context.Request.Headers.TryGetValue("__glimpse-isAjax", out isAjax) && isAjax == "true")
            {
                context.Response.Headers.Add("__glimpse-id", _context.RequestId.ToString("N"));
            }
        }
    }
}
