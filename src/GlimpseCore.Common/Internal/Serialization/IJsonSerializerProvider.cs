using Newtonsoft.Json;

namespace GlimpseCore.Common.Internal.Serialization
{
    public interface IJsonSerializerProvider
    {
        JsonSerializer GetJsonSerializer();
    }
}
