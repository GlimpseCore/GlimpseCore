using System;
using System.Collections.Generic;
using System.Reflection;

namespace GlimpseCore.Internal
{
    public interface ITypeSelector
    {
        IEnumerable<TypeInfo> FindTypes(IEnumerable<Assembly> targetAssmblies, TypeInfo targetTypeInfo);
    }
}