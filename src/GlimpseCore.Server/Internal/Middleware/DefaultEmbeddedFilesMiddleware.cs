﻿using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;

namespace GlimpseCore.Server.Internal.Middleware
{
    /// <summary>
    /// This examines a directory path and determines if there is a default file present.
    /// If so the file name is appended to the path and execution continues.
    /// Note we don't just serve the file because it may require interpretation.
    /// </summary>
    public class DefaultEmbeddedFilesMiddleware
    {
        private readonly DefaultFilesOptions _options;
        private readonly PathString _matchUrl;
        private readonly RequestDelegate _next;
        private readonly IFileProvider _fileProvider;

        /// <summary>
        /// Creates a new instance of the DefaultFilesMiddleware.
        /// </summary>
        /// <param name="next">The next middleware in the pipeline.</param>
        /// <param name="hostingEnv">The <see cref="IHostingEnvironment"/> used by this middleware.</param>
        /// <param name="options">The configuration options for this middleware.</param>
        public DefaultEmbeddedFilesMiddleware(RequestDelegate next, IHostingEnvironment hostingEnv, IOptions<DefaultFilesOptions> options)
        {
            if (next == null)
            {
                throw new ArgumentNullException(nameof(next));
            }

            if (hostingEnv == null)
            {
                throw new ArgumentNullException(nameof(hostingEnv));
            }

            if (options == null)
            {
                throw new ArgumentNullException(nameof(options));
            }

            _next = next;
            _options = options.Value;
            _fileProvider = _options.FileProvider ?? Helpers.ResolveFileProvider(hostingEnv);
            _matchUrl = _options.RequestPath;
        }

        /// <summary>
        /// This examines the request to see if it matches a configured directory, and if there are any files with the
        /// configured default names in that directory.  If so this will append the corresponding file name to the request
        /// path for a later middleware to handle.
        /// </summary>
        /// <param name="context"></param>
        /// <returns></returns>
        public Task Invoke(HttpContext context)
        {
            PathString subpath;
            if (Helpers.IsGetOrHeadMethod(context.Request.Method)
                && Helpers.TryMatchPath(context, _matchUrl, forDirectory: true, subpath: out subpath))
            {
                var dirContents = _fileProvider.GetDirectoryContents("");
                if (dirContents.Exists)
                {
                    string embeddedSubpath = ConvertPathToNamespace(subpath);

                    // Check if any of our default files exist.
                    for (int matchIndex = 0; matchIndex < _options.DefaultFileNames.Count; matchIndex++)
                    {
                        string defaultFile = _options.DefaultFileNames[matchIndex];
                        var file = _fileProvider.GetFileInfo(embeddedSubpath + "." + defaultFile);
                        // TryMatchPath will make sure subpath always ends with a "/" by adding it if needed.
                        if (file.Exists)
                        {
                            // If the path matches a directory but does not end in a slash, redirect to add the slash.
                            // This prevents relative links from breaking.
                            if (!Helpers.PathEndsInSlash(context.Request.Path))
                            {
                                context.Response.StatusCode = 301;
                                context.Response.Headers[HeaderNames.Location] = context.Request.PathBase + context.Request.Path + "/" + context.Request.QueryString;
                                return Helpers.CompletedTask;
                            }

                            // Match found, re-write the url. A later middleware will actually serve the file.
                            context.Request.Path = new PathString(context.Request.Path.Value + defaultFile);
                            break;
                        }
                    }
                }
            }

            return _next(context);
        }

        private string ConvertPathToNamespace(PathString path)
        {
            string result = "";
            if (path != null && path.HasValue)
            {
                result = path.Value;

                // Relative paths starting with a leading slash okay
                if (result.StartsWith("/", StringComparison.Ordinal))
                {
                    result = result.Substring(1);
                }
                if (result.EndsWith("/", StringComparison.Ordinal))
                {
                    result = result.TrimEnd('/');
                }

                result = result.Replace('/', '.');
            }

            return result;
        }

        internal static class Helpers
        {
            internal static readonly Task CompletedTask = CreateCompletedTask();

            private static Task CreateCompletedTask()
            {
                var tcs = new TaskCompletionSource<object>();
                tcs.SetResult(null);
                return tcs.Task;
            }

            internal static IFileProvider ResolveFileProvider(IHostingEnvironment hostingEnv)
            {
                if (hostingEnv.WebRootFileProvider == null)
                {
                    throw new InvalidOperationException("Missing FileProvider.");
                }
                return hostingEnv.WebRootFileProvider;
            }


            internal static bool IsGetOrHeadMethod(string method)
            {
                return IsGetMethod(method) || IsHeadMethod(method);
            }

            internal static bool IsGetMethod(string method)
            {
                return string.Equals("GET", method, StringComparison.OrdinalIgnoreCase);
            }

            internal static bool IsHeadMethod(string method)
            {
                return string.Equals("HEAD", method, StringComparison.OrdinalIgnoreCase);
            }

            internal static bool PathEndsInSlash(PathString path)
            {
                return path.Value.EndsWith("/", StringComparison.Ordinal);
            }

            internal static bool TryMatchPath(HttpContext context, PathString matchUrl, bool forDirectory, out PathString subpath)
            {
                var path = context.Request.Path;

                if (forDirectory && !PathEndsInSlash(path))
                {
                    path += new PathString("/");
                }

                if (path.StartsWithSegments(matchUrl, out subpath))
                {
                    return true;
                }
                return false;
            }
        }
    }
}
