const TcpClient = require('./TcpClient');
const client = new TcpClient();
client.connect("192.168.1.235", "2500", () => {
    setInterval(() => client.send({pid: 'US', cmdId: 0x3333}, {"token": "abcde123456", "id":"aaaaaaaaaaaa", "extend":"unknow" }), 5000);
});