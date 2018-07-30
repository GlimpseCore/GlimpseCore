using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace GlimpseCore.Server.Resources
{
    public class RawJson : IResponse
    {
        private readonly string _json;
        private readonly string _contentType;

        public RawJson(string json) : this(json, "application/json")
        {
        }

        public RawJson(string json, string contentType)
        {
            _json = json;
            _contentType = contentType;
        }

        public async Task Respond(HttpContext context)
        {
            var response = context.Response;
            response.ContentType = _contentType;
            await response.WriteAsync(_json);
        }
    }
}