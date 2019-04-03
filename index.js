const TcpClient = require('./TcpClient');
const client = new TcpClient();
client.connect("192.168.1.235", "2500");