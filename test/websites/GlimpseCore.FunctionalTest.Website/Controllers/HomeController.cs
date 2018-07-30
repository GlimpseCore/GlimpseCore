using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GlimpseCore.FunctionalTest.Website.Controllers
{
    public class HomeController : Controller
    {
        public async Task Index()
        {
            await Response.WriteAsync("Hello, world!");
        }
    }
}
