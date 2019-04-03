var ExBuffer = require('./ExBuffer.js');
var net = require('net');

var TcpClient = function () {
    var exBuffer = new ExBuffer();
    exBuffer.on('data', function (msg) {
        console.log("data:" + data)
    })
    this.connect = function (ip, port) {
        _client = new net.Socket();
        _client.setKeepAlive(true);
        _client.setNoDelay(true);
        _client.connect(port, ip, function (e1, e2) {
            console.log("server connect");
        });
        _client.on('data', function (data) {
            exBuffer.put(data);
        });
        _client.on('error', function (error) {
            console.log("client error");
        });
        _client.on('close', function (error) {
            console.log("client close");
        });
    }

}

module.exports = TcpClient;