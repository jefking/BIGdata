using King.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace KeySignal
{
    public class MvcApplication : System.Web.HttpApplication
    {
        private IRoleTaskManager<object> manager = new RoleTaskManager<object>(new Factory());

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);


            this.manager.OnStart();
            this.manager.Run();
        }
        protected void Application_End()
        {
            this.manager.OnStop();
        }
    }
}