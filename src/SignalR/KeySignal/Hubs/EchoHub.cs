using Microsoft.AspNet.SignalR;

namespace KeySignal.Hubs
{
    public class EchoHub : Hub
    {
        public void Send(string character)
        {
            Clients.All.Send(character);
        }
    }
}