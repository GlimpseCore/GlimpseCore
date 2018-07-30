using System.Collections.Generic;
using Microsoft.Extensions.DependencyInjection;
using GlimpseCore.Common;
using GlimpseCore.Common.Initialization;
using GlimpseCore.Common.Internal.Serialization;
using GlimpseCore.Initialization;
using GlimpseCore.Internal;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace GlimpseCore
{
    public class GlimpseCoreServices
    {
        public static IEnumerable<ServiceDescriptor> GetDefaultServices()
        {
            var services = new ServiceCollection();

            //
            // System
            //
            services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            //
            // Discovery & Reflection.
            //
            services.AddTransient<ITypeActivator, DefaultTypeActivator>();
            services.AddTransient<ITypeSelector, DefaultTypeSelector>();
            services.AddTransient<IAssemblyProvider, DefaultAssemblyProvider>();
            services.AddTransient<ITypeService, DefaultTypeService>();
            // TODO: consider making above singleton 

            services.AddSingleton<IExtensionProvider<IRegisterServices>, DefaultExtensionProvider<IRegisterServices>>();
            services.AddSingleton<IExtensionProvider<IRegisterMiddleware>, DefaultExtensionProvider<IRegisterMiddleware>>();

            //
            // Context.
            //
            services.AddSingleton(typeof(IContextData<>), typeof(ContextData<>)); 
            services.AddSingleton<IGlimpseCoreContextAccessor, DefaultGlimpseCoreContextAccessor>(); 

            //
            // JSON.Net.
            //
            services.AddTransient<JsonSerializer, JsonSerializer>();
            services.AddSingleton<IJsonSerializerProvider, DefaultJsonSerializerProvider>();

            return services;
        }
    }
}