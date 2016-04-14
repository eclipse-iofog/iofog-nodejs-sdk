'use strict';

/*
 * ioTracks: ioTracks node.js SDK
 *
 * Utility lib to create and transform ioMessage from Object to Buffer array and vice versa.
 */

var crypto = require('crypto');
var byteUtils = require('./byteUtils.js');

const IO_MESSAGE_VERSION = 4;

/**
 * Utility function to {Buffer} to ioMessage object.
 *
 * @param data {Buffer} - buffer of ioMessage data
 * @returns {Object} - ioMessage object
 */
exports.ioMessageFromBuffer = function(data){
    if(!(data instanceof Buffer)) { throw new Error('Data is not instanceof Buffer.'); }
    var ioMessage = {};

    var pos = 33;
    var version = data.readUIntBE(0, 2);

    if (version != IO_MESSAGE_VERSION) { return; }

    var size = data[2];
    if (size > 0) { ioMessage.id = data.slice(pos, pos + size).toString(); pos += size;}

    size = data.readUIntBE(3, 2);
    if (size > 0) { ioMessage.tag = data.slice(pos, pos + size).toString(); pos += size; }

    size = data[5];
    if (size > 0) { ioMessage.groupid = data.slice(pos, pos + size).toString(); pos += size; }

    size = data[6];
    if (size > 0) { ioMessage.sequencenumber = data.readUIntBE(pos, size); pos += size; }

    size = data[7];
    if (size > 0) { ioMessage.sequencetotal = data.readUIntBE(pos, size); pos += size; }

    size = data[8];
    if (size > 0) { ioMessage.priority = data[pos]; pos += size; }

    size = data[9];
    if (size > 0) { ioMessage.timestamp = data.readUIntBE(pos, size); pos += size; }

    size = data[10];
    if (size > 0) { ioMessage.publisher = data.slice(pos, pos + size).toString(); pos += size; }

    size = data.readUIntBE(11, 2);
    if (size > 0) { ioMessage.authid = data.slice(pos, pos + size).toString(); pos += size; }

    size = data.readUIntBE(13, 2);
    if (size > 0) { ioMessage.authgroup = data.slice(pos, pos + size).toString(); pos += size; }

    size = data[15];
    if (size > 0) { ioMessage.chainposition = data.readUIntBE(pos, size); pos += size; }

    size = data.readUIntBE(16, 2);
    if (size > 0) { ioMessage.hash = data.slice(pos, pos + size).toString(); pos += size; }

    size = data.readUIntBE(18, 2);
    if (size > 0) { ioMessage.previoushash = data.slice(pos, pos + size).toString(); pos += size; }

    size = data.readUIntBE(20, 2);
    if (size > 0) { ioMessage.nonce = data.slice(pos, pos + size).toString(); pos += size; }

    size = data[22];
    if (size > 0) { ioMessage.difficultytarget = data.readUIntBE(pos, size); pos += size; }

    size = data[23];
    if (size > 0) { ioMessage.infotype = data.slice(pos, pos + size).toString(); pos += size; }

    size = data[24];
    if (size > 0) { ioMessage.infoformat = data.slice(pos, pos + size).toString(); pos += size; }

    size = data.readUIntBE(25, 4);
    if (size > 0) { ioMessage.contextdata = data.slice(pos, pos + size); pos += size; }

    size = data.readUIntBE(29, 4);
    if (size > 0) { ioMessage.contentdata = data.slice(pos, pos + size); }

    return ioMessage;
}

/**
 * Utility function to transform ioMessage object to {Buffer} array
 *
 * @param ioMessage {Object} - ioMessage object to transform
 * @returns {Buffer} - Buffer with ioMessage data
 */
exports.ioMsgBuffer = function(ioMessage){
    var headerBuffer = new Buffer(0);
    var dataBuffer = new Buffer(0);

    headerBuffer = writeBytes(headerBuffer, byteUtils.shortToBytes(IO_MESSAGE_VERSION));

    var length = ioMessage.id.length;
    headerBuffer = writeBytes(headerBuffer, [(length & 0xff)]);
    if (length > 0) { dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.id)); }

    length = ioMessage.tag.length;
    headerBuffer = writeBytes(headerBuffer, byteUtils.shortToBytes((length & 0xffff)));
    if (length > 0) { dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.tag)); }

    length = ioMessage.groupid.length;
    headerBuffer = writeBytes(headerBuffer, [(length & 0xff)]);
    if (length > 0) { dataBuffer =  writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.groupid)); }

    if (ioMessage.sequencenumber == 0) { headerBuffer = writeBytes(headerBuffer, [0]); }
    else {
        dataBuffer = writeBytes(dataBuffer, byteUtils.intToBytes(ioMessage.sequencenumber));
        headerBuffer = writeBytes(headerBuffer, [4]);
    }

    if (ioMessage.sequencetotal == 0) { headerBuffer = writeBytes(headerBuffer, [0]); }
    else {
        dataBuffer = writeBytes(dataBuffer, byteUtils.intToBytes(ioMessage.sequencetotal));
        headerBuffer = writeBytes(headerBuffer, [4]);
    }

    if (ioMessage.priority == 0) { headerBuffer = writeBytes(headerBuffer, [0]); }
    else { headerBuffer = writeBytes(headerBuffer, [1]); dataBuffer = writeBytes(dataBuffer, [ioMessage.priority]); }

    if (ioMessage.timestamp == 0) { headerBuffer = writeBytes(headerBuffer, [0]); }
    else {
        headerBuffer = writeBytes(headerBuffer, [8]);
        dataBuffer = writeBytes(dataBuffer, byteUtils.longToBytes(ioMessage.timestamp));
    }

    length = ioMessage.publisher.length;
    headerBuffer = writeBytes(headerBuffer, [(length & 0xff)]) ;
    if (length > 0) { dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.publisher)); }

    length = ioMessage.authid.length;
    headerBuffer = writeBytes(headerBuffer, byteUtils.shortToBytes((length & 0xffff)));
    if (length > 0) { dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.authid)); }

    length = ioMessage.authgroup.length;
    headerBuffer = writeBytes(headerBuffer, byteUtils.shortToBytes((length & 0xffff)));
    if (length > 0) { dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.authgroup)); }

    if (ioMessage.chainposition == 0) { headerBuffer = writeBytes(headerBuffer, [0]); }
    else {
        headerBuffer = writeBytes(headerBuffer, [8]);
        dataBuffer = writeBytes(dataBuffer, byteUtils.longToBytes(ioMessage.chainposition));
    }

    length = ioMessage.hash.length;
    headerBuffer = writeBytes(headerBuffer, byteUtils.shortToBytes((length & 0xffff)));
    if (length > 0) { dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.hash)); }

    length = ioMessage.previoushash.length;
    headerBuffer = writeBytes(headerBuffer, byteUtils.shortToBytes((length & 0xffff)));
    if (length > 0) { dataBuffer = writeBytes(dataBuffer,byteUtils.stringToBytes(ioMessage.previoushash)); }

    length = ioMessage.nonce.length;
    headerBuffer = writeBytes(headerBuffer, byteUtils.shortToBytes((length & 0xffff)));
    if (length > 0) { dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.nonce)); }

    if (ioMessage.difficultytarget == 0) { headerBuffer = writeBytes(headerBuffer, [0]); }
    else {
        headerBuffer = writeBytes(headerBuffer, [4]);
        dataBuffer = writeBytes(dataBuffer, byteUtils.intToBytes(ioMessage.difficultytarget));
    }

    length = ioMessage.infotype.length;
    headerBuffer = writeBytes(headerBuffer, [(length & 0xff)]);
    if (length > 0) { dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.infotype)); }

    length = ioMessage.infoformat.length;
    headerBuffer = writeBytes(headerBuffer, [(length & 0xff)]);
    if (length > 0) { dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.infoformat)); }

    if (ioMessage.contextdata == null) { headerBuffer = writeBytes(headerBuffer, [0]); }
    else {
        headerBuffer = writeBytes(headerBuffer, byteUtils.intToBytes(ioMessage.contextdata.length));
        dataBuffer = writeBytes(dataBuffer, ioMessage.contextdata);
    }

    if (ioMessage.contentdata == null) { headerBuffer = writeBytes(headerBuffer, [0]); }
    else {
        headerBuffer = writeBytes(headerBuffer, byteUtils.intToBytes(ioMessage.contentdata.length));
        dataBuffer = writeBytes(dataBuffer, ioMessage.contentdata);
    }

    return Buffer.concat([headerBuffer, dataBuffer], headerBuffer.length + dataBuffer.length);
}

/**
 * Utility function to create ioMessage object.
 *
 * @param tag - string
 * @param groupid - string
 * @param sequencenumber - integer
 * @param sequencetotal - integer
 * @param priority - byte
 * @param publisherId - string
 * @param authid - string
 * @param authgroup - string
 * @param chainposition - long
 * @param hash - string
 * @param previoushash - string
 * @param nonce - string
 * @param difficultytarget - integer
 * @param infotype - string
 * @param infoformat - string
 * @param contextdata - {Buffer} array
 * @param contentdata - {Buffer} array
 * @returns {Object} - ioMessage object
 */
exports.ioMessage = function(tag, groupid, sequencenumber, sequencetotal, priority, publisherId, authid, authgroup, chainposition,
                             hash, previoushash, nonce, difficultytarget, infotype, infoformat, contextdata, contentdata) {
    return {
        id: generateUUID(),
        tag: tag,
        groupid: groupid,
        sequencenumber: sequencenumber,
        sequencetotal: sequencetotal,
        priority: priority,
        version: IO_MESSAGE_VERSION,
        timestamp: Date.now(),
        publisher: publisherId,
        authid: authid,
        authgroup: authgroup,
        chainposition: chainposition,
        hash: hash,
        previoushash: previoushash,
        nonce: nonce,
        difficultytarget: difficultytarget,
        infotype: infotype,
        infoformat: infoformat,
        contextdata: contextdata,
        contentdata: contentdata
    };
}

/**
 * Returns JSON representation for ioMessage (with content and context data encrypted to base64 format)
 *
 * @param ioMsg - ioMessage to get JSON
 * @returns {Object} - ioMessage JSON
 */
exports.toJSON = function(ioMsg) {
    return {
        id: ioMsg.id,
        tag: ioMsg.tag,
        groupid: ioMsg.groupid,
        sequencenumber: ioMsg.sequencenumber,
        sequencetotal: ioMsg.sequencetotal,
        priority: ioMsg.priority,
        version: IO_MESSAGE_VERSION,
        timestamp: ioMsg.timeStamp,
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
        contextdata: module.exports.encodeBase64(ioMsg.contextdata),
        contentdata: module.exports.encodeBase64(ioMsg.contentdata)
    };
}

/**
 * Returns ioMessage object created from it's JSON representation (with content and context data decrypted from base64 format)
 *
 * @param jsonMsg -  JSON ioMessage
 * @returns {Object} - ioMessage object
 */
exports.fromJSON = function(ioMsgJSON) {
    return {
        id: ioMsgJSON.id,
        tag: ioMsgJSON.tag,
        groupid: ioMsgJSON.groupid,
        sequencenumber: ioMsgJSON.sequencenumber,
        sequencetotal: ioMsgJSON.sequencetotal,
        priority: ioMsgJSON.priority,
        version: ioMsgJSON.version,
        timestamp: ioMsgJSON.timeStamp,
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
        contextdata: module.exports.decodeBase64(ioMsgJSON.contextdata),
        contentdata: module.exports.decodeBase64(ioMsgJSON.contentdata)
    };
}

/**
 * Returns encoded with base64 format String based on specified Buffer array
 *
 * @param data -  Buffer to encode
 * @returns string
 */
exports.encodeBase64 = function(data) {
    return data.toString('base64');
}

/**
 * Returns Buffer array decoded from base64 format based on specified String
 *
 * @param string -  string to be decoded
 * @returns Buffer
 */
exports.decodeBase64 = function(string) {
    return new Buffer(string, 'base64');
}

/**
 * Returns array of decoded ioMessages from response
 *
 * @param messages - list of messages to be decoded
 * @returns messages
 */
exports.decodeMessages = function(messages) {
    var decodedMsgs = [];
    for (var i = 0, len = messages.length; i < len; i++) {
        decodedMsgs.push(module.exports.fromJSON(messages[i]));
    }
    return decodedMsgs;
}

/**
 * Creates random substring of specified length based on provided string.
 *
 * @param length - desired length of substring
 * @param chars - original string
 * @returns string
 */
function randomString(length, chars) {
    if(!chars) { throw new Error('Argument \'chars\' is undefined');}

    var charsLength = chars.length;
    var randomBytes = crypto.randomBytes(length);
    var result = new Array(length);
    var cursor = 0;
    for (var i = 0; i < length; i++){
        cursor += randomBytes[i];
        result[i] = chars[cursor % charsLength];
    }

    return result.join('');
}

/**
 * Creates random string of specified length (ASCII format).
 *
 * @param length - desired length of substring
 * @returns string
 */
function randomAsciiString(length) { return randomString(length, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'); }

/**
 * Creates random UUID with 32 characters length.
 *
 * @returns string (UUID)
 */
function generateUUID() { return randomAsciiString(32); }

/**
 * Utility function to write specified byte array to Buffer object.
 *
 * @param resultBuffer {Buffer} - buffer object where to write byte array
 * @param bytes {Array} - byte array to write
 * @returns {Buffer} - result Buffer
 */
function writeBytes(resultBuffer, bytes){
    var bytesBuffer = new Buffer(bytes);
    resultBuffer = Buffer.concat([resultBuffer, bytesBuffer], resultBuffer.length + bytesBuffer.length);
    return resultBuffer;
}

