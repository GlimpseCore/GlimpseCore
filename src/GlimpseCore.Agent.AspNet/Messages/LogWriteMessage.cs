using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GlimpseCore.Agent.Messages
{
    public class LogWriteMessage
    {
        public string Level { get; set; }

        public string Category { get; set; }

        public object Message { get; set; }
    }
}
