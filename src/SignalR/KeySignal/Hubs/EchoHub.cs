using Microsoft.AspNet.SignalR;
using Microsoft.ServiceBus.Messaging;
using System.Configuration;
using System.Threading.Tasks;
using System.Linq;

namespace KeySignal.Hubs
{
    public class EchoHub : Hub
    {
        const string name = "keyspls";

        private readonly string connectionString = ConfigurationManager.AppSettings["Microsoft.ServiceBus.ConnectionString"];

        public void Send(string character)
        {
            Clients.All.Send(character);
        }

        public async Task SendStroke(Stroke s)
        {
            var eventHubClient = EventHubClient.CreateFromConnectionString(connectionString, name);
            
            var json = Newtonsoft.Json.JsonConvert.SerializeObject(s);
            var data = JsonStringToByteArray(json);
            var msg = new EventData(data);
            await eventHubClient.SendAsync(msg);
        }
        public async Task SendExample(Example e)
        {
            var eventHubClient = EventHubClient.CreateFromConnectionString(connectionString, name);

            var flats = from s in e.strokes
                        select Convert(this.Context.ConnectionId, e, s);

            await eventHubClient.SendBatchAsync(flats);
          
        }

        private static EventData Convert(string id, Example e, Stroke s)
        {
            var flat = new FlatStroke()
            {
                time = s.time,
                order = s.order,
                action = s.action,
                guid = s.guid,
                value = s.value,
                interval = s.interval,
                pressinterval = s.pressinterval,
                email = e.email,
                name = e.name,
                uniqueId = e.uniqueId,
            };
            var json = Newtonsoft.Json.JsonConvert.SerializeObject(flat);
            var data = JsonStringToByteArray(json);
            return new EventData(data);
        }

        public static byte[] JsonStringToByteArray(string jsonByteString)
        {
            jsonByteString = jsonByteString.Substring(1, jsonByteString.Length - 2);
            string[] arr = jsonByteString.Split(',');
            byte[] bResult = new byte[arr.Length];
            for (int i = 0; i < arr.Length; i++)
            {
                bResult[i] = byte.Parse(arr[i]);
            }
            return bResult;
        }
    }
}