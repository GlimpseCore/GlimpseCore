using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace GlimpseCore.Server.Resources
{
    public abstract class Problem : IResponse
    {
        protected Problem()
        {
            Extensions = new Dictionary<string, object>();
        }

        public IDictionary<string, object> Extensions { get; }

        public abstract Uri Type { get; }

        public abstract string Title { get; }

        public abstract string Details { get; }

        public abstract int StatusCode { get; }

        public virtual async Task Respond(HttpContext context)
        {
            context.Response.StatusCode = StatusCode;

            Extensions["Status"] = StatusCode;
            Extensions["Type"] = Type.AbsoluteUri;
            Extensions["Title"] = Title;
            Extensions["Details"] = Details;

            var response = new Json(Extensions, "application/problem+json");
            await response.Respond(context);
        }
    }
}