const MessagePack = () => {
    let head = {
        pid: 0,
        version: 0,
        sessionId: 0,
        encryptFlag: 0,
        cmdId: 0,
        length: 0,
    };
    let body = null;
    const self = {
        readHeadData: (buf) => {
            self.setHead('pid', buf.readUInt16BE(0))
                .setHead('version', buf.readUInt8(2))
                .setHead('sessionId', buf.readUIntBE(3, 12))
                .setHead('encryptFlag', buf.readUInt8(15))
                .setHead('cmdId', buf.readUInt16BE(16))
                .setHead('length', buf.readUInt16BE(18))
        },
        setBody: (buf) => {
            body = buf.toString();
        },
        setHead: (key, buf) => {
            head[key] = buf;
            return {
                setHead: self.setHead
            }
        },
        getHead: (key) => {
            return head[key];
        },
        getBody: () => {
            return body;
        }
    }
    return self;
}

module.exports = MessagePack;