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