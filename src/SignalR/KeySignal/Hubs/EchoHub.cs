using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace KeySignal.Hubs
{
    public class EchoHub : Hub
    {
        public void Hello()
        {
            Clients.All.hello();
        }
    }
}