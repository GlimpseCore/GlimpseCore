﻿namespace GlimpseCore.Agent.Internal.Inspectors.EF.Proxies
{
    public interface IDbCommand
    {
        string CommandText { get; }

        object CommandType { get; }

        object Parameters { get; }
    }
}
