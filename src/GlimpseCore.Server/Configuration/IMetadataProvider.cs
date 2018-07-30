namespace GlimpseCore.Server.Configuration
{
    public interface IMetadataProvider
    {
        Metadata BuildInstance();
    }
}