using Microsoft.AspNetCore.Http;

namespace GlimpseCore.Agent.Inspectors
{
    public class Inspector : IInspector
    {
        public virtual void Before(HttpContext context)
        {
        }

        public virtual void After(HttpContext context)
        {
        }
    }
}
