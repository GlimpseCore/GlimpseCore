using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Net.Http.Headers;

namespace GlimpseCore.Server.Resources
{
    public class InvalidMethodProblem : Problem
    {
        private readonly IEnumerable<string> _allowedMethods;
        private readonly string _attemptedMethod;
        public InvalidMethodProblem(string attemptedMethod, params string[] allowedMethods)
        {
            if (allowedMethods.Length == 0)
                throw new ArgumentException("At least one method must be allowed.", nameof(allowedMethods));

            _allowedMethods = allowedMethods.Select(m => m.ToUpper());
            _attemptedMethod = attemptedMethod;

            Extensions["AllowedMethods"] = _allowedMethods;
        }

        public override Task Respond(HttpContext context)
        {
            context.Response.Headers[HeaderNames.Allow] = string.Join(", ", _allowedMethods);
            return base.Respond(context);
        }

        // TODO: Correct URI
        public override Uri Type => new Uri("http://TODO.com/Docs/Troubleshooting/InvalidMethod");
        public override string Title => "Method Not Allowed";
        public override string Details => $"The method '{_attemptedMethod}' is not allowed on this resource.";
        public override int StatusCode => (int) HttpStatusCode.MethodNotAllowed;
    }
}