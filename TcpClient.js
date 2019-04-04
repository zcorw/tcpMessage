var ExBuffer = require('./ExBuffer.js');
var MessagePack = require('./MsgPack.js');
var net = require('net');

var TcpClient = function () {
    var exBuffer = new ExBuffer(20);
    var _client = null;
    exBuffer.on('data', function (msg) {
        console.log(`data:\n pid:${msg.getHead('pid')}\n version:${msg.getHead('version')}\n sessionId:${msg.getHead('sessionId')}\n encryptFlag:${msg.getHead('encryptFlag')}\n cmdId:${msg.getHead('cmdId')}\n length:${msg.getHead('length')}\n body:${msg.getBody()}`)
    })
    this.connect = function (ip, port, cb) {
        _client = new net.Socket();
        _client.setKeepAlive(true);
        _client.setNoDelay(true);
        _client.connect(port, ip, function (e1, e2) {
            console.log("server connect");
            cb();
        });
        _client.on('data', function (data) {
            exBuffer.put(data);
        });
        _client.on('error', function (error) {
            console.log("client error", error);
        });
        _client.on('close', function (error) {
            console.log("client close");
        });
    }
    this.send = (head, body) => {
        var msg = new MessagePack();
        for(var key of head) {
            msg.setHead(key, head[key]);
        }
        msg.setBody(body);
        var buffer = msg.getBuffer();
        console.log("TCL: this.send -> buffer", buffer.length);
        msg.readHeadData(buffer);
        console.log(`data:\n pid:${msg.getHead('pid')}\n version:${msg.getHead('version')}\n sessionId:${msg.getHead('sessionId')}\n encryptFlag:${msg.getHead('encryptFlag')}\n cmdId:${msg.getHead('cmdId')}\n length:${msg.getHead('length')}\n body:${msg.getBody()}`)
        
        _client.write(buffer, () => {
            console.log("send success")
        })
    }
}

module.exports = TcpClient;