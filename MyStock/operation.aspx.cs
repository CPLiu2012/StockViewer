using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.IO;
using System.Xml.Linq;

public partial class _Default : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        try
        {
            XDocument xmlDoc = XDocument.Load(Request.InputStream);
            string path = Context.Server.MapPath("operation.aspx");
            xmlDoc.Save(path.Replace("operation.aspx", "recordData.xml"));
        }
        catch (Exception ex)
        {

        }
    }
}