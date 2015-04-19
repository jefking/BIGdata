using KeySignal.Hubs;
using King.Azure.Data;
using System.Configuration;
using System.Threading.Tasks;
using System.Web.Http;

namespace KeySignal.Controllers
{
    public class DataController : ApiController
    {
        private Container keystats = new Container("keystats", ConfigurationManager.AppSettings["blobstorage"]);

        public async Task<Stats> Get()
        {
            return await keystats.Get<Stats>("something.json");
        }
    }
}