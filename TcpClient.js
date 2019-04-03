var ExBuffer = require('./ExBuffer.js');
var net = require('net');
var MessagePack = require('./MessagePack.js');

var TcpClient = function () {
    var exBuffer = new ExBuffer();
    exBuffer.on('data', function (msg) {
        
    })
}