using System;
using System.Threading.Tasks;
using GlimpseCore.Server.Resources;
using Microsoft.AspNetCore.Http;

namespace GlimpseCore.Server.Internal.Resources
{
    public class ResponseDecorator : IResponse
    {
        private readonly IResponse _response;
        private readonly Action<HttpContext> _decoration;
        public ResponseDecorator(IResponse response, Action<HttpContext> decoration)
        {
            _response = response;
            _decoration = decoration;
        }

        public async Task Respond(HttpContext context)
        {
            _decoration(context);
            await _response.Respond(context);
        }
    }
}