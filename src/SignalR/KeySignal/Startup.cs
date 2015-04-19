using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Owin;
using System.Configuration;

[assembly: OwinStartupAttribute(typeof(KeySignal.Startup))]
namespace KeySignal
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            var connectionString = ConfigurationManager.AppSettings["Microsoft.ServiceBus.ConnectionString"];
            GlobalHost.DependencyResolver.UseServiceBus(connectionString, "Keysassy");

            app.MapSignalR();
        }
    }
}