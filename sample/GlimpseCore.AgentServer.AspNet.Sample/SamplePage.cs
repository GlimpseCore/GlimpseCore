using System.Threading.Tasks;
using GlimpseCore.Internal;
using Microsoft.AspNetCore.Http;
using Microsoft.Net.Http.Headers;

namespace GlimpseCore.AgentServer.AspNet.Sample
{
    public class SamplePage
    {
        private readonly ContextData<MessageContext> _context;

        public SamplePage()
        {
            _context = new ContextData<MessageContext>();
        }

        public async Task Invoke(HttpContext context)
        {
            var response = context.Response;

            response.Headers[HeaderNames.ContentType] = "text/html";

            await response.WriteAsync($"<html><body><h1>Agent Test</h1><script src='/glimpsecore/agent/agent.js?hash=213' id='glimpsecore' data-glimpsecore-id='{_context?.Value?.Id}'></script></body></html>");
        }
    }
}