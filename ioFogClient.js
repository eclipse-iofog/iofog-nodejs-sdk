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
 * ioFogClient lib that mimics all requests to ioFog's Local API
 */

const exec = require('child_process').exec
const request = require('request')
const WebSocket = require('ws')

exports.ioMessageUtil = require('./lib/ioMessageUtil')
exports.byteUtils = require('./lib/byteUtils')
exports.Logger = require('./logger')
exports.FileLogger = require('./fileLogger')

const OPCODE_PING = 0x9
const OPCODE_PONG = 0xA
const OPCODE_ACK = 0xB
const OPCODE_CONTROL_SIGNAL = 0xC
const OPCODE_MSG = 0xD
const OPCODE_RECEIPT = 0xE

let ELEMENT_ID = 'NOT_DEFINED' // publisher's ID
let SSL = false
let host = 'iofog'
let port = 54321
let wsConnectMessageTimeoutAttempts = 0
let wsConnectControlTimeoutAttempts = 0

const wsConnectAttemptsLimit = 5
const wsConnectTimeout = 1000

let wsMessage
let wsControl

const logger = exports.Logger

require('console-stamp')(
  console,
  {
    colors: {
      stamp: 'yellow',
      label: 'white',
      metadata: 'green'
    }
  }
)

/**
 * Sets custom host and port for connection (if no argument is specified will use the default values).
 *
 * @param <String> host - host' string name
 * @param <Number> port - port's number
 * @param <String> containerId - container's ID
 * @param <Function> mainCb - main function to perform when all set up and checks are done
 */
exports.init = function (pHost, pPort, containerId, mainCb) {
  const options = processArgs(process.argv)

  if (options['--id']) {
    ELEMENT_ID = options['--id']
  }

  if (process.env.SELFNAME) {
    ELEMENT_ID = process.env.SELFNAME
  }

  if (process.env.SSL) {
    SSL = true
  }

  if (!(!pHost || !pHost.trim())) {
    host = pHost
  }
  if (!(!pPort || pPort <= 0)) {
    port = pPort
  }
  if (!(!containerId || !containerId.trim())) {
    ELEMENT_ID = containerId
  }

  exec('ping -c 3 ' + host, function checkHost (error, stdout, stderr) {
    if (stderr || error) {
      if (stderr) {
        logger.error(stderr)
      }
      if (error) {
        logger.error(error)
      }
      logger.warn('Host: \'' + host + '\' is not reachable. Changing to \'127.0.0.1\'')
      host = '127.0.0.1'
    }
    mainCb()
  })
}

/**
 * Utility function to create ioMessage object
 *
 * @param <Object> opts - object to initialize ioMessage
 * <String> tag
 * <String> groupid
 * <Integer> sequencenumber
 * <Integer> sequencetotal
 * <Byte> priority
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
    opts.publisherId = ELEMENT_ID
  } else {
    opts = { publisherId: ELEMENT_ID }
  }
  return module.exports.ioMessageUtil.ioMessage(opts)
}

/**
 * Posts new ioMessage to ioFog via Local API REST call
 *
 * @param <Object> ioMsg - ioMessage object to send
 * @param <Object> cb - object with callback functions (onError, onBadRequest, onMessageReceipt)
 */
exports.sendNewMessage = function (ioMsg, cb) {
  ioMsg.publisher = ELEMENT_ID
  makeHttpRequest(
    cb,
    '/v2/messages/new',
    module.exports.ioMessageUtil.toJSON(ioMsg, true),
    function postNewMsg (body) {
      if (body.id && body.timestamp) {
        cb.onMessageReceipt(body.id, body.timestamp)
      }
    }
  )
}

/**
 * Gets all unread messages for container via Local API REST call
 *
 * @param <Object> cb - object with callback functions (onError, onBadRequest, onMessages)
 */
exports.getNextMessages = function (cb) {
  makeHttpRequest(
    cb,
    '/v2/messages/next',
    {
      id: ELEMENT_ID
    },
    function getNextMsgs (body) {
      if (body.messages) {
        cb.onMessages(module.exports.ioMessageUtil.parseMessages(body.messages))
      }
    }
  )
}

/**
 * Gets all messages from specified publishers within time-frame (only publishers that the container is allowed to access)
 *
 * @param <Date> startdate - start date (timestamp) of a time-frame
 * @param <Date> enddate - end date (timestamp) of a time-frame
 * @param <Array> publishers - array of publishers to get messages
 * @param <Object> cb - object with callback functions (onError, onBadRequest, onMessagesQuery)
 */
exports.getMessagesByQuery = function (startdate, enddate, publishers, cb) {
  if (Array.isArray(publishers)) {
    makeHttpRequest(
      cb,
      '/v2/messages/query',
      {
        id: ELEMENT_ID,
        timeframestart: startdate,
        timeframeend: enddate,
        publishers: publishers
      },
      function getQueryMsgs (body) {
        if (body.messages) {
          cb.onMessagesQuery(body.timeframestart, body.timeframeend, module.exports.ioMessageUtil.parseMessages(body.messages))
        }
      }
    )
  } else {
    logger.error('getMessagesByQuery: Publishers input is not array!')
  }
}

/**
 * Gets new configurations for the container
 *
 * @param <Object> cb - object with callback functions (onError, onBadRequest, onNewConfig)
 */
exports.getConfig = function (cb) {
  makeHttpRequest(
    cb,
    '/v2/config/get',
    {
      id: ELEMENT_ID
    },
    function getNewConfig (body) {
      if (body.config) {
        let configJSON = {}
        try {
          configJSON = JSON.parse(body.config)
        } catch (error) {
          logger.error(error, 'There was an error parsing config to JSON')
        }
        cb.onNewConfig(configJSON)
      }
    }
  )
}

/**
 * Opens WebSocket Control connection to ioFog
 *
 * @param <Object> cb - object with callback functions (onError, onNewConfigSignal)
 */
exports.wsControlConnection = function (cb) {
  openWSConnection(
    cb,
    '/v2/control/socket/id/',
    function wsHandleControlData (data, flags) {
      if (module.exports.byteUtils.isBinary(data) && data.length > 0) {
        const opcode = data[0]
        if (opcode === OPCODE_CONTROL_SIGNAL) {
          cb.onNewConfigSignal()
          sendAck(wsControl)
        }
      }
    }
  )
}

/**
 * Opens WebSocket Message connection to ioFog
 *
 * @param <Function> onOpenSocketCb - function that will be triggered when connection is opened (call wsSendMessage in this function)
 * @param <Object> cb - object with callback functions (onError, onMessages, onMessageReceipt)
 */
exports.wsMessageConnection = function (onOpenSocketCb, cb) {
  openWSConnection(
    cb,
    '/v2/message/socket/id/',
    function wsHandleMessageData (data, flags) {
      if (module.exports.byteUtils.isBinary(data) && data.length) {
        const opcode = data[0]; let pos
        if (opcode === OPCODE_MSG) {
          pos = 1
          const msgLength = data.readUIntBE(pos, 4)
          pos += 4
          const bytes = data.slice(pos, msgLength + pos)
          const msg = module.exports.ioMessageUtil.ioMessageFromBuffer(bytes)
          cb.onMessages([msg])
          sendAck(wsMessage)
        } else if (opcode === OPCODE_RECEIPT) {
          let size = data[1]
          pos = 3
          let messageId = ''
          if (size) {
            messageId = data.slice(pos, pos + size).toString('utf-8')
            pos += size
          }
          size = data[2]
          let timestamp = 0
          if (size) {
            timestamp = data.readUIntBE(pos, size)
          }
          cb.onMessageReceipt(messageId, timestamp)
          sendAck(wsMessage)
        }
      }
    },
    onOpenSocketCb
  )
}

/**
 * Closes WebSocket Control connection if it's opened.
 *
 * @param <Function> cb - Function called after ws closed successfully
 */
exports.wsCloseControlConnection = function (cb) {
  if (wsControl) {
    wsControl.on('close', cb)
    wsControl.close(1000)
  }
  setGlobalWS('/v2/control/socket/id/', null)
}

/**
 * Closes WebSocket Message connection if it's opened.
 *
 * @param <Function> cb - Function called after ws closed successfully
 */
exports.wsCloseMessageConnection = function (cb) {
  if (wsMessage) {
    wsMessage.on('close', cb)
    wsMessage.close(1000)
  }
  setGlobalWS('/v2/message/socket/id/', null)
}

/**
 * Sends ioMessage to ioFog via WebSocket Message connection if it's opened.
 *
 * @param <Object> ioMsg - ioMessage object to send
 */
exports.wsSendMessage = function (ioMsg) {
  if (!wsMessage || wsMessage.readyState !== WebSocket.OPEN) {
    logger.error('wsSendMessage: socket is not open.')
    return
  }
  ioMsg.publisher = ELEMENT_ID
  const msgBuffer = module.exports.ioMessageUtil.ioMsgBuffer(ioMsg)
  const opCodeBuffer = Buffer.from([OPCODE_MSG])
  const lengthBuffer = Buffer.from(module.exports.byteUtils.intToBytes(msgBuffer.length))
  const resultBuffer = Buffer.concat([opCodeBuffer, lengthBuffer, msgBuffer], opCodeBuffer.length + lengthBuffer.length + msgBuffer.length)
  wsMessage.send(resultBuffer, { binary: true, mask: true })
}

/**
 * Utility function sends ACKNOWLEDGE response to ioFog
 **/
function sendAck (ws) {
  const buffer = Buffer.alloc(1)
  buffer[0] = OPCODE_ACK
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(buffer, { binary: true, mask: true })
  } else {
    logger.warn('Unable to send ACKNOWLEDGE: WS connection isn\'t open. ')
  }
}

/**
 * Not used - Utility function sends PING to ioFog
 **/
// function sendPing (ws) {
//   const buffer = Buffer.alloc(1)
//   buffer[0] = OPCODE_PING
//   if (ws && ws.readyState === WebSocket.OPEN) {
//     ws.ping(buffer, true)
//   } else {
//     console.warn('Unable to send PING: WS connection isn\'t open. ')
//   }
// }

/**
 * Utility function sends PONG to ioFog
 **/
function sendPong (ws) {
  const buffer = Buffer.alloc(1)
  buffer[0] = OPCODE_PONG
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.pong(buffer, true)
  } else {
    logger.warn('Unable to send PONG: WS connection isn\'t open. ')
  }
}

/**
 * Utility function returns HTTP/HTTPS protocol for url based on settings.
 *
 * @returns <String> - HTTP/HTTPS protocol for url
 */
function getHttpProtocol () {
  if (SSL) {
    return 'https'
  } else {
    return 'http'
  }
}

/**
 * Utility function returns WS/WSS protocol for url based on settings.
 *
 * @returns <String> - WS/WSS protocol for url
 */
function getWSProtocol () {
  if (SSL) {
    return 'wss'
  } else {
    return 'ws'
  }
}

/**
 * Utility function to build url based protocol, relative url and settings.
 *
 * @param <String> protocol - HTTP or WS
 * @param <String> url - relative path for URL
 * @returns <String> - endpoint URL
 */
exports.getURL = function (protocol, url) {
  return protocol + '://' + host + ':' + port + url
}

/**
 * Utility function that makes HTTP/HTTPS post request to endpoint URL.
 * Sends specified JSON.
 *
 * @param <Object> listenerCb - <Object> that contains listener callbacks (onError, onBadRequest)
 * @param <String> relativeUrl - relative URL
 * @param <Object> json - JSON <Object> to send
 * @param <Function> onResponseCb - callback to process response body
 */
function makeHttpRequest (listenerCb, relativeUrl, json, onResponseCb) {
  const endpoint = exports.getURL(getHttpProtocol(), relativeUrl)
  request.post(
    {
      url: endpoint,
      headers: {
        'Content-Type': 'application/json'
      },
      json: json
    },
    function handleHttpResponse (err, resp, body) {
      if (err) {
        return listenerCb.onError(err)
      }
      if (resp && resp.statusCode === 400) {
        return listenerCb.onBadRequest(body)
      }
      onResponseCb(body)
    }
  )
}

/**
 * Utility function that opens WS/WSS connection to specified URL.
 *
 * @param <Object> listenerCb - <Object> that contains listener callback (onError)
 * @param <String> relativeUrl - relative URL
 * @param <Function> onDataCb - callback function that will be triggered when message is received from ioFog
 * @param <Function> onOpenSocketCb - function that will be triggered when connection is opened (call wsSendMessage in this function)
 */
function openWSConnection (listenerCb, relativeUrl, onDataCb, onOpenSocketCb) {
  const endpoint = exports.getURL(getWSProtocol(), relativeUrl + ELEMENT_ID)
  //   let pingFlag
  const ws = new WebSocket(
    endpoint,
    {
      protocolVersion: 13
    }
  )
  ws.on(
    'message',
    onDataCb
  )
  ws.on(
    'error',
    function handleWsError (error) {
      listenerCb.onError(error)
      if (error && error.code === 'ECONNREFUSED') {
        wsReconnect(relativeUrl, ws, listenerCb, onDataCb, onOpenSocketCb)
      }
    }
  )
  ws.on(
    'ping',
    function wsPing (data, flags) {
      if (module.exports.byteUtils.isBinary(data) && data.length === 1 && data[0] === OPCODE_PING) {
        sendPong(ws)
      }
    }
  )
  ws.on(
    'pong',
    function wsPong (data, flags) {
      if (module.exports.byteUtils.isBinary(data) && data.length === 1 && data[0] === OPCODE_PONG) {
        // pingFlag = null
      }
    }
  )
  ws.on('close', function wsClose (code, message) {
    // code : 1006  - ioFog crashed, 1000 - CloseWebFrame from ioFog,
    if (code === 1000) { return }
    wsReconnect(relativeUrl, ws, listenerCb, onDataCb, onOpenSocketCb)
  })
  ws.on(
    'open',
    function wsOnOpen () {
      switch (relativeUrl) {
        case '/v2/control/socket/id/':
          wsConnectControlTimeoutAttempts = 0
          break
        case '/v2/message/socket/id/':
          wsConnectMessageTimeoutAttempts = 0
          break
        default:
          logger.warn('No global socket defined.')
      }
      if (onOpenSocketCb) {
        onOpenSocketCb(module.exports)
      }
    }
  )
  setGlobalWS(relativeUrl, ws)
}

function setGlobalWS (relativeUrl, ws) {
  switch (relativeUrl) {
    case '/v2/control/socket/id/':
      wsControl = ws
      break
    case '/v2/message/socket/id/':
      wsMessage = ws
      break
    default:
      logger.warn('No global socket defined.')
  }
}

/**
 * Utility function to process start options
 *
 * @param args - array of start options
 */
function processArgs (args) {
  args.shift()
  args.shift()
  const options = {}
  args.forEach(function handleForEach (arg) {
    if (arg.indexOf('=')) {
      const pieces = arg.split('=')
      options[pieces[0]] = pieces[1]
    }
  })
  return options
}
/**
 * Utility function to reconnect to ioFog via WebSocket.
 *
 * @param relativeUrl - array of start options
 * @param <WebSocket> ws - webSocket that needs to be destroyed
 * @param <Object> listenerCb - <Object> that contains listener callback (onError)
 * @param <Function> onDataCb - callback function that will be triggered when message is received from ioFog
 * @param <Function> onOpenSocketCb - function that will be triggered when connection is opened (call wsSendMessage in this function)
 */
function wsReconnect (relativeUrl, ws, listenerCb, onDataCb, onOpenSocketCb) {
  logger.info('Reconnecting to ioFog via socket.')
  let timeout = 0
  if (wsConnectControlTimeoutAttempts < wsConnectAttemptsLimit && relativeUrl === '/v2/control/socket/id/') {
    timeout = wsConnectTimeout * Math.pow(2, wsConnectControlTimeoutAttempts)
    wsConnectControlTimeoutAttempts++
  } else if (wsConnectMessageTimeoutAttempts < wsConnectAttemptsLimit && relativeUrl === '/v2/message/socket/id/') {
    timeout = wsConnectTimeout * Math.pow(2, wsConnectMessageTimeoutAttempts)
    wsConnectMessageTimeoutAttempts++
  } else {
    timeout = wsConnectTimeout * Math.pow(2, wsConnectAttemptsLimit - 1)
  }
  ws = null
  setGlobalWS(relativeUrl, ws)
  setTimeout(
    function wsReconnect () {
      openWSConnection(listenerCb, relativeUrl, onDataCb, onOpenSocketCb)
    }, timeout)
}
