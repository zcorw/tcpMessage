var util = require('util');
var MessagePack = require("./MessagePack.js");
var events = require('events');
/*
* 构造方法
* @param bufferLength 缓存区长度，默认512 byte
*/
var ExBuffer = function (bufferLength = 512) {
    var self = this;
    events.EventEmitter.call(this);//继承事件类
    var _headArray = new Array();
    var HEAD_LEN = 20;
    var _buffer = new Buffer(bufferLength);//Buffer大于8kb 会使用slowBuffer，效率低
    var _startOffset = 0;
    var _dataLength = 0;

    this.put = function (buffer) {
        if (buffer.length > _buffer.length - _dataLength) {
            //当前缓冲区已经不能满足次数数据了
            var ex = Math.ceil((buffer.length + _dataLength) / (1024));//每次扩展1kb
            var tmp = new Buffer(ex * 1024);
            _buffer.copy(tmp, 0, _startOffset, _startOffset + _dataLength);
            _startOffset = 0;
            _buffer = tmp;
        }
        else {
            //数据对齐到头部
            _buffer.copy(_buffer, 0, _startOffset, _startOffset + _dataLength);
            _startOffset = 0;
        }

        buffer.copy(_buffer, _dataLength, 0, buffer.length);
        _dataLength += buffer.length;
        proc();
    };

    this.clearBuffer = function () {
        _startOffset = 0;
        _dataLength = 0;
        _buffer = new Buffer(bufferLength);//Buffer大于8kb 会使用slowBuffer，效率低
    }

    function proc() {
        var count = 0;
        while (true) {
            if (count++ > 1000) break;//1000次还没读完??
            if (_dataLength < HEAD_LEN) {
                break;//连包头都读不了
            }

            var msg = MessagePack();
            var hBuf = new Buffer(HEAD_LEN);
            _buffer.copy(hBuf, 0, _startOffset, _startOffset + HEAD_LEN);
            msg.readHeadData(hBuf);
            if (msg.getHead('length') <= _dataLength - HEAD_LEN) {
                _startOffset += HEAD_LEN;
                _dataLength -= HEAD_LEN;
                //new msg;

                var bBuf = null;
                if (msg.getHead('length') > 0) {
                    bBuf = new Buffer(msg.getHead('length'));
                    _buffer.copy(bBuf, 0, _startOffset, _startOffset + msg.getHead('length'));
                }

                _startOffset += msg.getHead('length');
                _dataLength -= msg.getHead('length');
                try {
                    msg.setBody(bBuf);
                    self.emit("data", msg);
                    var nbuf = new Buffer()
                } catch (e) {
                    self.emit("error", e);
                }
            } else {
                break;
            }
        }
    }
};

util.inherits(ExBuffer, events.EventEmitter);//继承事件类
module.exports = ExBuffer;