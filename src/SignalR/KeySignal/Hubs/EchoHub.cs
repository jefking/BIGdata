using Microsoft.AspNet.SignalR;
using Microsoft.ServiceBus.Messaging;
using System.Configuration;
using System.Threading.Tasks;

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

            var json = Newtonsoft.Json.JsonConvert.SerializeObject(e);
            var data = JsonStringToByteArray(json);
            var msg = new EventData(data);
            await eventHubClient.SendAsync(msg);
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