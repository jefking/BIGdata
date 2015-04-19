function sendData() {
 	var sas = "SharedAccessSignature sr=https%3a%2f%2fkeysaasy.servicebus.windows.net%2fkeyspls%2fpublishers%2fkeypub%2fmessages&sig=cBY8IdXUh%2bjv8o5EQ2lyBtYdXWciLWzPIuIIaPUisLU%3d&se=1429408841&skn=JSSender";

    var serviceNamespace = "keysaasy";
    var hubName = "keyspls";
    var deviceName = "keypub";
    var Content = "Test no xml 2";
 
    var HttpRequest = new XMLHttpRequest();
    HttpRequest.open("POST", "https://" +serviceNamespace + ".servicebus.windows.net/" + hubName + "/publishers/" + deviceName + "/messages", true);
    HttpRequest.setRequestHeader('Content-Type',"application/json;type=entry;charset=utf-8");
    HttpRequest.setRequestHeader("Authorization", sas);
    HttpRequest.send(Content);
 }
