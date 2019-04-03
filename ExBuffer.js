var util = require('util');
var MessagePack = require("./MsgPack.js");
var events = require('events');
/*
* 构造方法
* @param HEAD_LEN 消息头部长度
*/
var ExBuffer = function (HEAD_LEN = 20) {
    var self = this;
    const bufferLength = 512;
    events.EventEmitter.call(this);//继承事件类
    var _buffer = null, _startOffset = 0, _dataLength = 0;

    /**
     * 缓存区初始化
     */
    function bufferInit() {
        /**
         * 数据缓存区
         * Buffer大于8kb 会使用slowBuffer，效率低
         * Buffer.allocUnsafe() 内存分配速度快，但未被初始化，里面值不为0
         */
        _buffer = Buffer.allocUnsafe(bufferLength);
        _startOffset = 0;  //开始指针
        _dataLength = 0;   //未处理数据长度
    }
    
    function bufferUpdate(tmp) {
        _buffer.copy(tmp, 0, _startOffset, _startOffset + _dataLength);
        _startOffset = 0; 
        _buffer = temp;
    }

    bufferInit();


    this.put = function (buffer) {
        if (buffer.length > _buffer.length - _dataLength) {
            //当前缓冲区已经不能满足次数数据了
            var ex = Math.ceil((buffer.length + _dataLength) / (1024));//每次扩展1kb
            var tmp = Buffer.allocUnsafe(ex * 1024);
            bufferUpdate(tmp);
        }
        else {
            bufferUpdate(_buffer);
        }

        buffer.copy(_buffer, _dataLength, 0, buffer.length);
        _dataLength += buffer.length;
        proc();
    };

    this.clearBuffer = bufferInit;

    function proc() {
        var count = 0;
        while (true) {
            if (count++ > 1000) break;//1000次还没读完，防止死循环
            if (_dataLength < HEAD_LEN) {
                break;//连包头都读不了
            }

            var msg = MessagePack();
            var hBuf = Buffer.allocUnsafe(HEAD_LEN);
            _buffer.copy(hBuf, 0, _startOffset, _startOffset + HEAD_LEN);
            msg.readHeadData(hBuf);
            if (msg.getHead('length') <= _dataLength - HEAD_LEN) {
                _startOffset += HEAD_LEN;
                _dataLength -= HEAD_LEN;
                //new msg;

                var bBuf = null;
                if (msg.getHead('length') > 0) {
                    bBuf = Buffer.allocUnsafe(msg.getHead('length'));
                    _buffer.copy(bBuf, 0, _startOffset, _startOffset + msg.getHead('length'));
                }

                _startOffset += msg.getHead('length');
                _dataLength -= msg.getHead('length');
                try {
                    msg.setBody(bBuf);
                    self.emit("data", msg);
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