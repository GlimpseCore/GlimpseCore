using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace GlimpseCore.Agent.Inspectors
{
    public interface IInspectorFunctionBuilder
    {
        IApplicationBuilder AppBuilder { get; }

        IInspectorFunctionBuilder Use(Func<HttpContext, Func<Task>, Task> middleware);
    }
}