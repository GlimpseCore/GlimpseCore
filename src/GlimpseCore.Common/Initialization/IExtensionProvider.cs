using System.Collections.Generic;

namespace GlimpseCore.Initialization
{
    public interface IExtensionProvider<T>
        where T : class
    {
        IEnumerable<T> Instances { get; }
    }
}
