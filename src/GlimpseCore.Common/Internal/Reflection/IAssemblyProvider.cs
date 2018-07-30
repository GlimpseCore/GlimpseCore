using System;
using System.Collections.Generic;
using System.Reflection;

namespace GlimpseCore.Internal
{
    public interface IAssemblyProvider
    {
        IEnumerable<Assembly> GetCandidateAssemblies(string coreLibrary);
    }
}