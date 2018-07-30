using System;

namespace GlimpseCore.Internal
{
    public interface IContextData<T>
    {
        T Value { get; set; }
    }
}