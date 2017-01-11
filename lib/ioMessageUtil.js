'use strict';

/*
 * ioTracks: ioTracks node.js SDK
 *
 * Utility lib to create and transform ioMessage from Object to Buffer array and vice versa.
 */

var byteUtils = require('./byteUtils');

const IO_MESSAGE_VERSION = 4;

/**
 * Utility function to <Buffer> to ioMessage object.
 *
 * @param <Buffer> data - buffer of ioMessage data
 * @returns <Object> ioMessage - ioMessage object
 */
exports.ioMessageFromBuffer = function(data) {
    var ioMessage = {};

    if(!(data instanceof Buffer)) {
        console.error('ioMessageFromBuffer: Data is not instance of Buffer.');
        return ioMessage;
    }

    var pos = 33;

    var version = data.readUIntBE(0, 2);
    if (version != IO_MESSAGE_VERSION) {
        console.warn('ioMessage version not valid: ', IO_MESSAGE_VERSION);
        return ioMessage;
    }

    var size = data[2];
    if (size) {
        ioMessage.id = data.slice(pos, pos + size).toString();
        pos += size;
    }

    size = data.readUIntBE(3, 2);
    if (size) {
        ioMessage.tag = data.slice(pos, pos + size).toString();
        pos += size;
    }

    size = data[5];
    if (size) {
        ioMessage.groupid = data.slice(pos, pos + size).toString();
        pos += size;
    }

    size = data[6];
    if (size) {
        ioMessage.sequencenumber = data.readUIntBE(pos, size);
        pos += size;
    }

    size = data[7];
    if (size) {
        ioMessage.sequencetotal = data.readUIntBE(pos, size);
        pos += size;
    }

    size = data[8];
    if (size) {
        ioMessage.priority = data[pos];
        pos += size;
    }

    size = data[9];
    if (size) {
        ioMessage.timestamp = data.readUIntBE(pos, size);
        pos += size;
    }

    size = data[10];
    if (size) {
        ioMessage.publisher = data.slice(pos, pos + size).toString();
        pos += size;
    }

    size = data.readUIntBE(11, 2);
    if (size) {
        ioMessage.authid = data.slice(pos, pos + size).toString();
        pos += size;
    }

    size = data.readUIntBE(13, 2);
    if (size) {
        ioMessage.authgroup = data.slice(pos, pos + size).toString();
        pos += size;
    }

    size = data[15];
    if (size) {
        ioMessage.chainposition = data.readUIntBE(pos, size);
        pos += size;
    }

    size = data.readUIntBE(16, 2);
    if (size) {
        ioMessage.hash = data.slice(pos, pos + size).toString();
        pos += size;
    }

    size = data.readUIntBE(18, 2);
    if (size) {
        ioMessage.previoushash = data.slice(pos, pos + size).toString();
        pos += size;
    }

    size = data.readUIntBE(20, 2);
    if (size) {
        ioMessage.nonce = data.slice(pos, pos + size).toString();
        pos += size;
    }

    size = data[22];
    if (size) {
        ioMessage.difficultytarget = data.readUIntBE(pos, size);
        pos += size;
    }

    size = data[23];
    if (size) {
        ioMessage.infotype = data.slice(pos, pos + size).toString();
        pos += size;
    }

    size = data[24];
    if (size) {
        ioMessage.infoformat = data.slice(pos, pos + size).toString();
        pos += size;
    }

    size = data.readUIntBE(25, 4);
    if (size) {
        ioMessage.contextdata = data.slice(pos, pos + size);
        pos += size;
    }

    size = data.readUIntBE(29, 4);
    if (size) {
        ioMessage.contentdata = data.slice(pos, pos + size);
    }

    return ioMessage;
};

/**
 * Utility function to transform ioMessage object to <Buffer> array
 *
 * @param <Object> ioMessage - ioMessage object to transform
 * @returns <Buffer> resultBuffer - <Buffer> with ioMessage data
 */
exports.ioMsgBuffer = function(ioMessage) {
    var headerBuffer = Buffer(0);
    var dataBuffer = Buffer(0);

    headerBuffer = writeBytes(headerBuffer, byteUtils.shortToBytes(IO_MESSAGE_VERSION));

    var length = getLength(ioMessage.id);
    headerBuffer = writeBytes(headerBuffer, [ (length & 0xff) ]);
    if (length) {
        dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.id));
    }

    length = getLength(ioMessage.tag);
    headerBuffer = writeBytes(headerBuffer, byteUtils.shortToBytes( (length & 0xffff) ));
    if (length) {
        dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.tag));
    }

    length = getLength(ioMessage.groupid);
    headerBuffer = writeBytes(headerBuffer, [ (length & 0xff) ]);
    if (length) {
        dataBuffer =  writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.groupid));
    }

    if (ioMessage.sequencenumber === 0) {
        headerBuffer = writeBytes(headerBuffer, [0]);
    } else {
        dataBuffer = writeBytes(dataBuffer, byteUtils.intToBytes(ioMessage.sequencenumber));
        headerBuffer = writeBytes(headerBuffer, [4]);
    }

    if (ioMessage.sequencetotal === 0) {
        headerBuffer = writeBytes(headerBuffer, [0]);
    } else {
        dataBuffer = writeBytes(dataBuffer, byteUtils.intToBytes(ioMessage.sequencetotal));
        headerBuffer = writeBytes(headerBuffer, [4]);
    }

    if (ioMessage.priority === 0) {
        headerBuffer = writeBytes(headerBuffer, [0]);
    } else {
        headerBuffer = writeBytes(headerBuffer, [1]);
        dataBuffer = writeBytes(dataBuffer, [ioMessage.priority]);
    }

    if (ioMessage.timestamp === 0) {
        headerBuffer = writeBytes(headerBuffer, [0]);
    } else {
        headerBuffer = writeBytes(headerBuffer, [8]);
        dataBuffer = writeBytes(dataBuffer, byteUtils.longToBytes(ioMessage.timestamp));
    }

    length = getLength(ioMessage.publisher);
    headerBuffer = writeBytes(headerBuffer, [ (length & 0xff) ]) ;
    if (length) {
        dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.publisher));
    }

    length = getLength(ioMessage.authid);
    headerBuffer = writeBytes(headerBuffer, byteUtils.shortToBytes( (length & 0xffff) ));
    if (length) {
        dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.authid));
    }

    length = getLength(ioMessage.authgroup);
    headerBuffer = writeBytes(headerBuffer, byteUtils.shortToBytes( (length & 0xffff) ));
    if (length) {
        dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.authgroup));
    }

    if (ioMessage.chainposition === 0) {
        headerBuffer = writeBytes(headerBuffer, [0]);
    } else {
        headerBuffer = writeBytes(headerBuffer, [8]);
        dataBuffer = writeBytes(dataBuffer, byteUtils.longToBytes(ioMessage.chainposition));
    }

    length = getLength(ioMessage.hash);
    headerBuffer = writeBytes(headerBuffer, byteUtils.shortToBytes( (length & 0xffff) ));
    if (length) {
        dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.hash));
    }

    length = getLength(ioMessage.previoushash);
    headerBuffer = writeBytes(headerBuffer, byteUtils.shortToBytes( (length & 0xffff) ));
    if (length) {
        dataBuffer = writeBytes(dataBuffer,byteUtils.stringToBytes(ioMessage.previoushash));
    }

    length = getLength(ioMessage.nonce);
    headerBuffer = writeBytes(headerBuffer, byteUtils.shortToBytes( (length & 0xffff) ));
    if (length) {
        dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.nonce));
    }

    if (ioMessage.difficultytarget === 0) {
        headerBuffer = writeBytes(headerBuffer, [0]);
    } else {
        headerBuffer = writeBytes(headerBuffer, [4]);
        dataBuffer = writeBytes(dataBuffer, byteUtils.intToBytes(ioMessage.difficultytarget));
    }

    length = getLength(ioMessage.infotype);
    headerBuffer = writeBytes(headerBuffer, [ (length & 0xff) ]);
    if (length) {
        dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.infotype));
    }

    length = getLength(ioMessage.infoformat);
    headerBuffer = writeBytes(headerBuffer, [ (length & 0xff) ]);
    if (length) {
        dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.infoformat));
    }

    if (ioMessage.contextdata === null) {
        headerBuffer = writeBytes(headerBuffer, [0]);
    } else {
        headerBuffer = writeBytes(headerBuffer, byteUtils.intToBytes(ioMessage.contextdata.length));
        dataBuffer = writeBytes(dataBuffer, ioMessage.contextdata);
    }

    if (ioMessage.contentdata === null) {
        headerBuffer = writeBytes(headerBuffer, [0]);
    } else {
        headerBuffer = writeBytes(headerBuffer, byteUtils.intToBytes(ioMessage.contentdata.length));
        dataBuffer = writeBytes(dataBuffer, ioMessage.contentdata);
    }

    var resultBuffer = Buffer.concat([headerBuffer, dataBuffer], headerBuffer.length + dataBuffer.length);

    return resultBuffer;
};

/**
 * Utility function to create ioMessage object.
 *
 * @param <Object> opts - all needed options for ioMessage:
 * <String> tag
 * <String> groupid
 * <Integer> sequencenumber
 * <Integer> sequencetotal
 * <Byte> priority
 * <String> publisherId
 * <String> authid
 * <String> authgroup
 * <Long> chainposition
 * <String> hash
 * <String> previoushash
 * <String> nonce
 * <Integer> difficultytarget
 * <String> infotype
 * <String> infoformat
 * <Buffer> contextdata
 * <Buffer> contentdata
 *
 * @returns <Object> ioMessage
 */
exports.ioMessage = function(opts) {
    if(opts) {
        return {
            id: '',
            tag: opts.tag,
            groupid: opts.groupid,
            sequencenumber: opts.sequencenumber,
            sequencetotal: opts.sequencetotal,
            priority: opts.priority,
            version: IO_MESSAGE_VERSION,
            timestamp: 0,
            publisher: opts.publisherId,
            authid: opts.authid,
            authgroup: opts.authgroup,
            chainposition: opts.chainposition,
            hash: opts.hash,
            previoushash: opts.previoushash,
            nonce: opts.nonce,
            difficultytarget: opts.difficultytarget,
            infotype: opts.infotype,
            infoformat: opts.infoformat,
            contextdata: opts.contextdata,
            contentdata: opts.contentdata
        };
    } else {
        return {};
    }
};

/**
 * Returns JSON representation for ioMessage (with content and context data encrypted to base64 format)
 *
 * @param <ioMessage> ioMsg - ioMessage to get JSON
 * @param <boolean> encode - flag that indicated if context and content data need to be encoded to base64 format
 * @returns <Object> - ioMessage JSON
 */
exports.toJSON = function(ioMsg, encode) {
    var contextdata, contentdata;
    if(encode) {
        contextdata = module.exports.encodeBase64(ioMsg.contextdata);
        contentdata = module.exports.encodeBase64(ioMsg.contentdata);
    } else {
        contextdata = ioMsg.contextdata;
        contentdata = ioMsg.contentdata;
    }
    return {
        id: ioMsg.id,
        tag: ioMsg.tag,
        groupid: ioMsg.groupid,
        sequencenumber: ioMsg.sequencenumber,
        sequencetotal: ioMsg.sequencetotal,
        priority: ioMsg.priority,
        version: IO_MESSAGE_VERSION,
        timestamp: ioMsg.timestamp,
        publisher: ioMsg.publisher,
        authid: ioMsg.authid,
        authgroup: ioMsg.authgroup,
        chainposition: ioMsg.chainposition,
        hash: ioMsg.hash,
        previoushash: ioMsg.previoushash,
        nonce: ioMsg.nonce,
        difficultytarget: ioMsg.difficultytarget,
        infotype: ioMsg.infotype,
        infoformat: ioMsg.infoformat,
        contextdata: contextdata,
        contentdata: contentdata
    };
};

/**
 * Returns ioMessage object created from it's JSON representation (with content and context data decrypted from base64 format)
 *
 * @param <JSON> jsonMsg -  JSON ioMessage
 * @param <boolean> decode - flag that indicated if context and content data need to be decoded from base64 format
 * @returns <Object> - ioMessage object
 */
exports.fromJSON = function(ioMsgJSON, decode) {
    var contextdata, contentdata;
    if(decode) {
        contentdata = module.exports.decodeBase64(ioMsgJSON.contentdata);
        contextdata = module.exports.decodeBase64(ioMsgJSON.contextdata);
    } else {
        contentdata = ioMsgJSON.contentdata;
        contextdata = ioMsgJSON.contextdata;
    }
    return {
        id: ioMsgJSON.id,
        tag: ioMsgJSON.tag,
        groupid: ioMsgJSON.groupid,
        sequencenumber: ioMsgJSON.sequencenumber,
        sequencetotal: ioMsgJSON.sequencetotal,
        priority: ioMsgJSON.priority,
        version: ioMsgJSON.version,
        timestamp: ioMsgJSON.timestamp,
        publisher: ioMsgJSON.publisher,
        authid: ioMsgJSON.authid,
        authgroup: ioMsgJSON.authgroup,
        chainposition: ioMsgJSON.chainposition,
        hash: ioMsgJSON.hash,
        previoushash: ioMsgJSON.previoushash,
        nonce: ioMsgJSON.nonce,
        difficultytarget: ioMsgJSON.difficultytarget,
        infotype: ioMsgJSON.infotype,
        infoformat: ioMsgJSON.infoformat,
        contextdata: contextdata,
        contentdata: contentdata
    };
};

/**
 * Returns encoded with base64 format String based on specified <Buffer> array
 *
 * @param <Buffer> data -  <Buffer> to encode
 * @returns <String>
 */
exports.encodeBase64 = function(data) {
    if(data) {
        return data.toString('base64');
    } else {
        return '';
    }
};

/**
 * Returns <Buffer> array decoded from base64 format based on specified String
 *
 * @param <Buffer> string -  string to be decoded
 * @returns <Buffer> bytes
 */
exports.decodeBase64 = function(string) {
    var bytes = Buffer(string, 'base64');
    return bytes;
};

/**
 * Returns array of parsed ioMessages from response
 *
 * @param <Array> messages - list of messages to be parsed
 * @returns <Array> messages - list of parsed from JSON messages
 */
exports.parseMessages = function(messages) {
    var decodedMsgs = [];
    if(messages) {
        for (var i = 0, len = messages.length; i < len; i++) {
            decodedMsgs.push(module.exports.fromJSON(messages[i], true));
        }
    }
    return decodedMsgs;
};

/**
 * Utility function to write specified byte array to <Buffer> object.
 *
 * @param <Buffer> resultBuffer - <Buffer> object where to write byte array
 * @param <Array> bytes - byte array to write
 * @returns <Buffer> resultBuffer
 */
function writeBytes(resultBuffer, bytes) {
    var bytesBuffer = Buffer(bytes);
    resultBuffer = Buffer.concat([resultBuffer, bytesBuffer], resultBuffer.length + bytesBuffer.length);
    return resultBuffer;
}

/**
 * Utility function to get length of property.
 *
 * @param property
 * @returns <Number> length
 */
function getLength(property) {
    if(property){
        return property.length;
    } else {
        return 0;
    }
}

