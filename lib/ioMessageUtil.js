/*
 * *******************************************************************************
 *   Copyright (c) 2018 Edgeworx, Inc.
 *
 *   This program and the accompanying materials are made available under the
 *   terms of the Eclipse Public License v. 2.0 which is available at
 *   http://www.eclipse.org/legal/epl-2.0
 *
 *   SPDX-License-Identifier: EPL-2.0
 * *******************************************************************************
 */

'use strict'

/*
 * Eclipse ioFog: Node.js SDK
 *
 * Utility lib to create and transform ioMessage from Object to Buffer array and vice versa.
 */

const byteUtils = require('./byteUtils')

const IO_MESSAGE_VERSION = 4

/**
 * Utility function to <Buffer> to ioMessage object.
 *
 * @param <Buffer> data - buffer of ioMessage data
 * @returns <Object> ioMessage - ioMessage object
 */
exports.ioMessageFromBuffer = function (data) {
  var ioMessage = {}

  if (!(data instanceof Buffer)) {
    console.error('ioMessageFromBuffer: Data is not instance of Buffer.')
    return ioMessage
  }

  var pos = 33

  var version = data.readUIntBE(0, 2)
  if (version !== IO_MESSAGE_VERSION) {
    console.warn('ioMessage version not valid: ', IO_MESSAGE_VERSION)
    return ioMessage
  }

  var size = data[2]
  if (size) {
    ioMessage.id = data.slice(pos, pos + size).toString()
    pos += size
  }

  size = data.readUIntBE(3, 2)
  if (size) {
    ioMessage.tag = data.slice(pos, pos + size).toString()
    pos += size
  }

  size = data[5]
  if (size) {
    ioMessage.groupid = data.slice(pos, pos + size).toString()
    pos += size
  }

  size = data[6]
  if (size) {
    ioMessage.sequencenumber = data.readUIntBE(pos, size)
    pos += size
  }

  size = data[7]
  if (size) {
    ioMessage.sequencetotal = data.readUIntBE(pos, size)
    pos += size
  }

  size = data[8]
  if (size) {
    ioMessage.priority = data[pos]
    pos += size
  }

  size = data[9]
  if (size) {
    ioMessage.timestamp = byteUtils.readNumberFromBytes(data, pos, size)
    pos += size
  }

  size = data[10]
  if (size) {
    ioMessage.publisher = data.slice(pos, pos + size).toString()
    pos += size
  }

  size = data.readUIntBE(11, 2)
  if (size) {
    ioMessage.authid = data.slice(pos, pos + size).toString()
    pos += size
  }

  size = data.readUIntBE(13, 2)
  if (size) {
    ioMessage.authgroup = data.slice(pos, pos + size).toString()
    pos += size
  }

  size = data[15]
  if (size) {
    ioMessage.chainposition = byteUtils.readNumberFromBytes(data, pos, size)
    pos += size
  }

  size = data.readUIntBE(16, 2)
  if (size) {
    ioMessage.hash = data.slice(pos, pos + size).toString()
    pos += size
  }

  size = data.readUIntBE(18, 2)
  if (size) {
    ioMessage.previoushash = data.slice(pos, pos + size).toString()
    pos += size
  }

  size = data.readUIntBE(20, 2)
  if (size) {
    ioMessage.nonce = data.slice(pos, pos + size).toString()
    pos += size
  }

  size = data[22]
  if (size) {
    ioMessage.difficultytarget = data.readUIntBE(pos, size)
    pos += size
  }

  size = data[23]
  if (size) {
    ioMessage.infotype = data.slice(pos, pos + size).toString()
    pos += size
  }

  size = data[24]
  if (size) {
    ioMessage.infoformat = data.slice(pos, pos + size).toString()
    pos += size
  }

  size = data.readUIntBE(25, 4)
  if (size) {
    ioMessage.contextdata = data.slice(pos, pos + size)
    pos += size
  }

  size = data.readUIntBE(29, 4)
  if (size) {
    ioMessage.contentdata = data.slice(pos, pos + size)
  }

  return ioMessage
}

/**
 * Utility function to transform ioMessage object to <Buffer> array
 *
 * @param <Object> ioMessage - ioMessage object to transform
 * @returns <Buffer> resultBuffer - <Buffer> with ioMessage data
 */
exports.ioMsgBuffer = function (ioMessage) {
  let headerBuffer = Buffer.alloc(0)
  let dataBuffer = Buffer.alloc(0)

  headerBuffer = writeBytes(headerBuffer, byteUtils.shortToBytes(IO_MESSAGE_VERSION))

  let length = getLength(ioMessage.id)
  headerBuffer = writeBytes(headerBuffer, [(length & 0xff)])
  if (length) {
    dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.id))
  }

  length = getLength(ioMessage.tag)
  headerBuffer = writeBytes(headerBuffer, byteUtils.shortToBytes((length & 0xffff)))
  if (length) {
    dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.tag))
  }

  length = getLength(ioMessage.groupid)
  headerBuffer = writeBytes(headerBuffer, [(length & 0xff)])
  if (length) {
    dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.groupid))
  }

  if (ioMessage.sequencenumber === 0) {
    headerBuffer = writeBytes(headerBuffer, [0])
  } else {
    dataBuffer = writeBytes(dataBuffer, byteUtils.intToBytes(ioMessage.sequencenumber))
    headerBuffer = writeBytes(headerBuffer, [4])
  }

  if (ioMessage.sequencetotal === 0) {
    headerBuffer = writeBytes(headerBuffer, [0])
  } else {
    dataBuffer = writeBytes(dataBuffer, byteUtils.intToBytes(ioMessage.sequencetotal))
    headerBuffer = writeBytes(headerBuffer, [4])
  }

  if (ioMessage.priority === 0) {
    headerBuffer = writeBytes(headerBuffer, [0])
  } else {
    headerBuffer = writeBytes(headerBuffer, [1])
    dataBuffer = writeBytes(dataBuffer, [ioMessage.priority])
  }

  if (ioMessage.timestamp === 0 || (typeof ioMessage.timestamp === 'bigint' && ioMessage.timestamp === BigInt(0))) {
    headerBuffer = writeBytes(headerBuffer, [0])
  } else {
    headerBuffer = writeBytes(headerBuffer, [8])
    dataBuffer = writeBytes(dataBuffer, byteUtils.longToBytes(ioMessage.timestamp))
  }

  length = getLength(ioMessage.publisher)
  headerBuffer = writeBytes(headerBuffer, [(length & 0xff)])
  if (length) {
    dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.publisher))
  }

  length = getLength(ioMessage.authid)
  headerBuffer = writeBytes(headerBuffer, byteUtils.shortToBytes((length & 0xffff)))
  if (length) {
    dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.authid))
  }

  length = getLength(ioMessage.authgroup)
  headerBuffer = writeBytes(headerBuffer, byteUtils.shortToBytes((length & 0xffff)))
  if (length) {
    dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.authgroup))
  }

  if (ioMessage.chainposition === 0 ||
    (typeof ioMessage.chainposition === 'bigint' && ioMessage.chainposition === BigInt(0))) {
    headerBuffer = writeBytes(headerBuffer, [0])
  } else {
    headerBuffer = writeBytes(headerBuffer, [8])
    dataBuffer = writeBytes(dataBuffer, byteUtils.longToBytes(ioMessage.chainposition))
  }

  length = getLength(ioMessage.hash)
  headerBuffer = writeBytes(headerBuffer, byteUtils.shortToBytes((length & 0xffff)))
  if (length) {
    dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.hash))
  }

  length = getLength(ioMessage.previoushash)
  headerBuffer = writeBytes(headerBuffer, byteUtils.shortToBytes((length & 0xffff)))
  if (length) {
    dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.previoushash))
  }

  length = getLength(ioMessage.nonce)
  headerBuffer = writeBytes(headerBuffer, byteUtils.shortToBytes((length & 0xffff)))
  if (length) {
    dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.nonce))
  }

  if (ioMessage.difficultytarget === 0) {
    headerBuffer = writeBytes(headerBuffer, [0])
  } else {
    headerBuffer = writeBytes(headerBuffer, [4])
    dataBuffer = writeBytes(dataBuffer, byteUtils.intToBytes(ioMessage.difficultytarget))
  }

  length = getLength(ioMessage.infotype)
  headerBuffer = writeBytes(headerBuffer, [(length & 0xff)])
  if (length) {
    dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.infotype))
  }

  length = getLength(ioMessage.infoformat)
  headerBuffer = writeBytes(headerBuffer, [(length & 0xff)])
  if (length) {
    dataBuffer = writeBytes(dataBuffer, byteUtils.stringToBytes(ioMessage.infoformat))
  }

  if (ioMessage.contextdata) {
    const data = checkData(ioMessage.contextdata)
    headerBuffer = writeBytes(headerBuffer, byteUtils.intToBytes(data.length))
    dataBuffer = writeBytes(dataBuffer, data)
  } else {
    headerBuffer = writeBytes(headerBuffer, [0])
  }

  if (ioMessage.contentdata) {
    const data = checkData(ioMessage.contentdata)
    headerBuffer = writeBytes(headerBuffer, byteUtils.intToBytes(data.length))
    dataBuffer = writeBytes(dataBuffer, data)
  } else {
    headerBuffer = writeBytes(headerBuffer, [0])
  }

  var resultBuffer = Buffer.concat([headerBuffer, dataBuffer], headerBuffer.length + dataBuffer.length)

  return resultBuffer
}

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
exports.ioMessage = function (opts) {
  if (opts) {
    return {
      id: '',
      tag: initStringValue(opts.tag),
      groupid: initStringValue(opts.groupid),
      sequencenumber: initNumberValue(opts.sequencenumber),
      sequencetotal: initNumberValue(opts.sequencetotal),
      priority: initNumberValue(opts.priority),
      version: IO_MESSAGE_VERSION,
      timestamp: 0,
      publisher: initStringValue(opts.publisherId),
      authid: initStringValue(opts.authid),
      authgroup: initStringValue(opts.authgroup),
      chainposition: initNumberValue(opts.chainposition),
      hash: initStringValue(opts.hash),
      previoushash: initStringValue(opts.previoushash),
      nonce: initStringValue(opts.nonce),
      difficultytarget: initNumberValue(opts.difficultytarget),
      infotype: initStringValue(opts.infotype),
      infoformat: initStringValue(opts.infoformat),
      contextdata: initBufferValue(opts.contextdata),
      contentdata: initBufferValue(opts.contentdata)
    }
  } else {
    return {
      id: '',
      tag: '',
      groupid: '',
      sequencenumber: 0,
      sequencetotal: 0,
      priority: 0,
      version: IO_MESSAGE_VERSION,
      timestamp: 0,
      publisher: '',
      authid: '',
      authgroup: '',
      chainposition: 0,
      hash: '',
      previoushash: '',
      nonce: '',
      difficultytarget: 0,
      infotype: '',
      infoformat: '',
      contextdata: Buffer.alloc(0),
      contentdata: Buffer.alloc(0)
    }
  }
}

/**
 * Returns JSON representation for ioMessage (with content and context data encrypted to base64 format)
 *
 * @param <ioMessage> ioMsg - ioMessage to get JSON
 * @param <boolean> encode - flag that indicated if context and content data need to be encoded to base64 format
 * @returns <Object> - ioMessage JSON
 */
exports.toJSON = function (ioMsg, encode) {
  var contextdata, contentdata
  if (encode) {
    contextdata = module.exports.encodeBase64(ioMsg.contextdata)
    contentdata = module.exports.encodeBase64(ioMsg.contentdata)
  } else {
    contextdata = ioMsg.contextdata.toString()
    contentdata = ioMsg.contentdata.toString()
  }
  return {
    id: initStringValue(ioMsg.id),
    tag: initStringValue(ioMsg.tag),
    groupid: initStringValue(ioMsg.groupid),
    sequencenumber: initNumberValue(ioMsg.sequencenumber),
    sequencetotal: initNumberValue(ioMsg.sequencetotal),
    priority: initNumberValue(ioMsg.priority),
    version: IO_MESSAGE_VERSION,
    timestamp: 0,
    publisher: initStringValue(ioMsg.publisher),
    authid: initStringValue(ioMsg.authid),
    authgroup: initStringValue(ioMsg.authgroup),
    chainposition: initNumberValue(ioMsg.chainposition),
    hash: initStringValue(ioMsg.hash),
    previoushash: initStringValue(ioMsg.previoushash),
    nonce: initStringValue(ioMsg.nonce),
    difficultytarget: initNumberValue(ioMsg.difficultytarget),
    infotype: initStringValue(ioMsg.infotype),
    infoformat: initStringValue(ioMsg.infoformat),
    contextdata: contextdata,
    contentdata: contentdata
  }
}

/**
 * Returns ioMessage object created from it's JSON representation (with content and context data decrypted from base64 format)
 *
 * @param <JSON> jsonMsg -  JSON ioMessage
 * @param <boolean> decode - flag that indicated if context and content data need to be decoded from base64 format
 * @returns <Object> - ioMessage object
 */
exports.fromJSON = function (ioMsgJSON, decode) {
  var contextdata, contentdata
  if (decode) {
    contentdata = module.exports.decodeBase64(ioMsgJSON.contentdata)
    contextdata = module.exports.decodeBase64(ioMsgJSON.contextdata)
  } else {
    contentdata = ioMsgJSON.contentdata
    contextdata = ioMsgJSON.contextdata
  }
  return {
    id: initStringValue(ioMsgJSON.id),
    tag: initStringValue(ioMsgJSON.tag),
    groupid: initStringValue(ioMsgJSON.groupid),
    sequencenumber: initNumberValue(ioMsgJSON.sequencenumber),
    sequencetotal: initNumberValue(ioMsgJSON.sequencetotal),
    priority: initNumberValue(ioMsgJSON.priority),
    version: initNumberValue(ioMsgJSON.version),
    timestamp: initNumberValue(ioMsgJSON.timestamp),
    publisher: initStringValue(ioMsgJSON.publisher),
    authid: initStringValue(ioMsgJSON.authid),
    authgroup: initStringValue(ioMsgJSON.authgroup),
    chainposition: initNumberValue(ioMsgJSON.chainposition),
    hash: initStringValue(ioMsgJSON.hash),
    previoushash: initStringValue(ioMsgJSON.previoushash),
    nonce: initStringValue(ioMsgJSON.nonce),
    difficultytarget: initNumberValue(ioMsgJSON.difficultytarget),
    infotype: initStringValue(ioMsgJSON.infotype),
    infoformat: initStringValue(ioMsgJSON.infoformat),
    contextdata: initBufferValue(contextdata),
    contentdata: initBufferValue(contentdata)
  }
}

/**
 * Returns encoded with base64 format String based on specified <Buffer> array
 *
 * @param <Buffer> data -  <Buffer> to encode
 * @returns <String>
 */
exports.encodeBase64 = function (data) {
  if (data) {
    return data.toString('base64')
  } else {
    return ''
  }
}

/**
 * Returns <Buffer> array decoded from base64 format based on specified String
 *
 * @param <Buffer> string -  string to be decoded
 * @returns <Buffer> bytes
 */
exports.decodeBase64 = function (string) {
  var bytes = Buffer.from(string, 'base64')
  return bytes
}

/**
 * Returns array of parsed ioMessages from response
 *
 * @param <Array> messages - list of messages to be parsed
 * @returns <Array> messages - list of parsed from JSON messages
 */
exports.parseMessages = function (messages) {
  var decodedMsgs = []
  if (messages) {
    for (var i = 0, len = messages.length; i < len; i++) {
      decodedMsgs.push(module.exports.fromJSON(messages[i], true))
    }
  }
  return decodedMsgs
}

/**
 * Utility function to write specified byte array to <Buffer> object.
 *
 * @param <Buffer> resultBuffer - <Buffer> object where to write byte array
 * @param <Array> bytes - byte array to write
 * @returns <Buffer> resultBuffer
 */
function writeBytes (resultBuffer, bytes) {
  var bytesBuffer = Buffer.from(bytes)
  resultBuffer = Buffer.concat([resultBuffer, bytesBuffer], resultBuffer.length + bytesBuffer.length)
  return resultBuffer
}

/**
 * Utility function to get length of property.
 *
 * @param property
 * @returns <Number> length
 */
function getLength (property) {
  if (property) {
    return property.length
  } else {
    return 0
  }
}

function initNumberValue (number) {
  return number || 0
}

// function initBigInt (number) {
//   if (typeof number === 'bigint') {
//     return number
//   }
//   if (typeof BigInt === 'function') {
//     return number ? BigInt(number) : BigInt(0)
//   }
//   return number || 0
// }

function initStringValue (string) {
  return string || ''
}

function initBufferValue (data) {
  return data || Buffer.alloc(0)
}

function checkData (data) {
  if ((data instanceof Object || typeof data === 'number') && !(data instanceof Buffer)) {
    try {
      return JSON.stringify(data)
    } catch (error) {
      console.error('Error stringifying data to transform to Buffer:', error)
      return data
    }
  } else {
    return data
  }
}
