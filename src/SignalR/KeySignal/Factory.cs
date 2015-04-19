using King.Service;
using System;
using System.Collections.Generic;

namespace KeySignal
{
    public class Factory : ITaskFactory<object>
    {
        public IEnumerable<IRunnable> Tasks(object passthrough)
        {
            throw new NotImplementedException();
        }
    }
}