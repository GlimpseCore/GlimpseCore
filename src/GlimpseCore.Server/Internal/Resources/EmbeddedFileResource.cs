 // ReSharper disable RedundantUsingDirective
using System;
// ReSharper restore RedundantUsingDirective
using System.Collections.Generic;
using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.StaticFiles;
using GlimpseCore.Server.Internal.Middleware;
using GlimpseCore.Server.Resources;
using Microsoft.AspNetCore.StaticFiles.Infrastructure;

namespace GlimpseCore.Server.Internal.Resources
{
    public abstract class EmbeddedFileResource : IResourceStartup
    {
        public void Configure(IResourceBuilder resourceBuilder)
        {
            var appBuilder = resourceBuilder.AppBuilder;

            appBuilder.ModifyResponseWith(response => response.EnableCaching());

            appBuilder.ModifyResponseWith(res => res.EnableCors());

            //appBuilder.UseFileServer(new FileServerOptions
            //{
            //    RequestPath = "",
            //    EnableDefaultFiles = true,
            //    FileProvider =
            //        new EmbeddedFileProvider(typeof(EmbeddedFileResource).GetTypeInfo().Assembly, BaseNamespace)
            //});

            var fileProvider = new EmbeddedFileProvider(typeof(EmbeddedFileResource).GetTypeInfo().Assembly, BaseNamespace);

            appBuilder.UseDefaultEmbeddedFiles(new DefaultFilesOptions() { FileProvider = fileProvider });

            appBuilder.UseStaticFiles(new StaticFileOptions() { FileProvider = fileProvider });

            foreach (var registration in Register)
            {
                resourceBuilder.RegisterResource(registration.Key, registration.Value);
            }
        }

        public abstract ResourceType Type { get; }

        public abstract string BaseNamespace { get; }

        public abstract IDictionary<string, string> Register { get; }
    }

    public class ClientEmbeddedFileResource : EmbeddedFileResource
    {
        public static string BaseUrl = "/glimpsecore/client";

        public override ResourceType Type => ResourceType.Client;

        public override string BaseNamespace => "GlimpseCore.Server.Internal.Resources.Embedded.Client";

        public override IDictionary<string, string> Register => new Dictionary<string, string>
        {
            { "client", "?baseUrl=" + BaseUrl + "&hash={hash}{&requestId,follow,metadataUri}" },
            { "hud", "main.js?hash={hash}" }
        };
    }

    public class AgentEmbeddedFileResource : EmbeddedFileResource
    {
        public override ResourceType Type => ResourceType.Agent;

        public override string BaseNamespace => "GlimpseCore.Server.Internal.Resources.Embedded.Agent";

        public override IDictionary<string, string> Register => new Dictionary<string, string>
        {
            { "agent", "agent.js?hash={hash}"}
        };
    }
}