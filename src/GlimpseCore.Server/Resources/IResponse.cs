using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace GlimpseCore.Server.Resources
{
    public interface IResponse
    {
        Task Respond(HttpContext context);
    }
}