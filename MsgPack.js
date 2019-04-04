const _ = require('lodash');

/**
 * 拆包
 *
 * @param {*} buf 准备拆包的buffer
 * @param {*} start 开始读取的偏移量
 * @param {*} len 数据长度
 * @param {*} type 数据类型
 * @returns
 */
function bufSilce(buf, start, len, type) {
    function readInt() {
        switch (len) {
            case 1:
                return buf.readUInt8(start);
            case 2:
                return buf.readUInt16BE(start);
            case 3:
                return buf.readUInt32BE(start);
            default:
                return buf.readIntBE(start, len);
        }
    }
    return type == "int" ? readInt() : buf.slice(start, start + len).toString('utf8');
}
/**
 * 消息包
 * 
 * @class MessagePack
 * @argument buffer 消息片段，如果消息长度符合协议长度，则返回封装好的messagePack对象，如果不符合则返回false。允许传空，返回初始化的包
 */
class MessagePack {
    constructor(buffer) {
        const config = MessagePack.config;
        this.HEAD_LEN = config[config.length - 1].start + config[config.length - 1].size;
        if (buffer) {
            const lenConfig = config.find((v) => v.dataLen);
            const bodyLen = bufSilce(buffer, lenConfig.start, lenConfig.size, lenConfig.dataType);
            if (buffer.length >= bodyLen + this.HEAD_LEN) {
                this.head = config.reduce((res, c) => {
                    return Object.assign(res, {[c.key]: bufSilce(buffer, c.start, c.size, c.dataType)});
                }, {});
                this.body = JSON.parse(buffer.slice(this.HEAD_LEN, this.HEAD_LEN + bodyLen).toString('utf8'));
            } else {
                return false
            }
        } else {
            this.head = {
                pid: 0,
                version: 0,
                sessionId: 0,
                encryptFlag: 0,
                cmdId: 0,
                length: 0,
            };
            this.body = null;
        }
    }
    readHeadData(buf) {
        this.setHead('pid', buf.toString('utf8', 0, 2))
            .setHead('version', buf.readUInt8(2))
            .setHead('sessionId', buf.slice(3, 15).toString('utf8'))
            .setHead('encryptFlag', buf.readUInt8(15))
            .setHead('cmdId', buf.readUInt16BE(16))
            .setHead('length', buf.readUInt16BE(18));
        return this;
    }
    setBody(data) {
        this.body = data;
        return this;
    }
    setHead(key, data) {
        this.head[key] = data;
        return this;
    }
    getHead(key) {
        return this.head[key];
    }
    getBody() {
        return this.body;
    }
    getBuffer() {
        const bodyBuf = Buffer.from(typeof this.body == "string" ? this.body : JSON.stringify(this.body));
        const bodyLen = bodyBuf.length;
        const sendBuf = Buffer.alloc(this.HEAD_LEN + bodyLen);
        sendBuf.write(this.head.pid, 0, 2);
        sendBuf.writeUInt8(this.head.version, 2);
        sendBuf.write(this.head.sessionId, 3, 12);
        sendBuf.writeUInt8(this.head.encryptFlag, 15);
        sendBuf.writeUInt16BE(this.head.cmdId, 16);
        sendBuf.writeUInt16BE(bodyLen, 18);
        bodyBuf.copy(sendBuf, this.HEAD_LEN);
        return sendBuf;
    }
}

MessagePack.config = [
    { key: "pid", start: 0, size: 2, dataType: "string", dataLen: false },
    { key: "version", start: 2, size: 1, dataType: "int", dataLen: false },
    { key: "sessionId", start: 3, size: 12, dataType: "string", dataLen: false },
    { key: "encryptFlag", start: 15, size: 1, dataType: "int", dataLen: false },
    { key: "cmdId", start: 16, size: 2, dataType: "int", dataLen: false },
    { key: "length", start: 18, size: 2, dataType: "int", dataLen: true }
]

module.exports = MessagePack;