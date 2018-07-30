using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace GlimpseCore.Agent.Inspectors
{
    public interface IInspectorFunctionManager
    {
        RequestDelegate BuildInspectorBranch(RequestDelegate next, IApplicationBuilder app);
    }
}