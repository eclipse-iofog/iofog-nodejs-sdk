/*
 * *******************************************************************************
 *   Copyright (c) 2019 Edgeworx, Inc.
 *
 *   This program and the accompanying materials are made available under the
 *   terms of the Eclipse Public License v. 2.0 which is available at
 *   http://www.eclipse.org/legal/epl-2.0
 *
 *   SPDX-License-Identifier: EPL-2.0
 * *******************************************************************************
 */

/* globals describe, it, beforeEach, afterEach, before, after */

const expect = require('chai').expect
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const request = require('request')
const WS = require('ws')
const logger = require('../logger')
const FileLogger = require('../fileLogger')
const fs = require('fs')

const execStub = sinon.stub()
const ioFogClient = proxyquire('../ioFogClient', {
  child_process: { exec: execStub }
})

describe('ioFogClient', () => {
  describe('init', () => {
    it('Should set host to 127.0.0.1', (done) => {
      const error = 'This is an error'
      const stdError = 'This was on stderr'
      const logStub = sinon.stub(logger, 'error')
      const warnStub = sinon.stub(logger, 'warn')
      const host = 'iofog-test'
      const protocol = 'protocol'
      const port = 1234
      const cb = () => {
        expect(execStub.args[0][0]).to.equal(`ping -c 3 ${host}`)
        expect(logStub.args[0]).to.deep.equal([stdError])
        expect(logStub.args[1]).to.deep.equal([error])
        expect(warnStub.args[0][0]).to.equal(`Host: '${host}' is not reachable. Changing to '127.0.0.1'`)
        expect(ioFogClient.getURL(protocol, '')).to.equal(`${protocol}://127.0.0.1:${port}`)
        logStub.restore()
        warnStub.restore()
        done()
      }

      execStub.callsFake((command, pingCb) => {
        pingCb(error, null, stdError)
      })

      ioFogClient.init(host, port, null, cb)
    })

    it('Should init', (done) => {
      const host = 'iofog-test'
      const port = 1234
      const cb = () => {
        expect(execStub.args[0][0]).to.equal(`ping -c 3 ${host}`)
        expect(ioFogClient.getURL('', '')).to.equal(`://${host}:${port}`)
        done()
      }

      execStub.callsFake((command, pingCb) => {
        pingCb(null, null, null)
      })

      ioFogClient.init(host, port, null, cb)
    })
  })

  describe('ioMessage', () => {
    // Init
    beforeEach((done) => {
      execStub.callsFake((command, cb) => {
        cb(null, null, null)
      })
      ioFogClient.init(null, null, 'NOT_DEFINED', () => {
        done()
      })
    })

    it('Should create an ioMessage', () => {
      const expectedIOMessage = {
        id: '',
        tag: '',
        groupid: '',
        sequencenumber: 0,
        sequencetotal: 0,
        priority: 0,
        version: 4,
        timestamp: 0,
        publisher: 'NOT_DEFINED',
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
      expect(ioFogClient.ioMessage()).to.deep.equal(expectedIOMessage)
    })
    it('Should create an ioMessage from an empty object', () => {
      const expectedIOMessage = {
        id: '',
        tag: '',
        groupid: '',
        sequencenumber: 0,
        sequencetotal: 0,
        priority: 0,
        version: 4,
        timestamp: 0,
        publisher: 'NOT_DEFINED',
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
      expect(ioFogClient.ioMessage({})).to.deep.equal(expectedIOMessage)
    })
    it('Should create an ioMessage with publisher', (done) => {
      const publisher = 'Albatros'
      const expectedIOMessage = {
        id: '',
        tag: '',
        groupid: '',
        sequencenumber: 0,
        sequencetotal: 0,
        priority: 0,
        version: 4,
        timestamp: 0,
        publisher,
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
      execStub.callsFake((command, cb) => {
        cb(null, null, null)
      })
      ioFogClient.init(null, null, publisher, () => {
        expect(ioFogClient.ioMessage()).to.deep.equal(expectedIOMessage)
        done()
      })
    })
    it('Should create an ioMessage with content', () => {
      const ioMessage = {
        tag: 'tag',
        groupid: 'groupid',
        sequencenumber: 5,
        sequencetotal: 4,
        priority: 2,
        authid: 'authid',
        authgroup: 'authgroup',
        chainposition: 12,
        hash: 'hash',
        previoushash: 'previoushash',
        nonce: 'nonce',
        difficultytarget: 4,
        infotype: 'infotype',
        infoformat: 'infoformat',
        contextdata: Buffer.from('contextdata'),
        contentdata: Buffer.from('contentdata')
      }
      const expectedIOMessage = {
        ...ioMessage,
        id: '',
        version: 4,
        timestamp: 0,
        chainposition: 12,
        publisher: 'NOT_DEFINED'
      }
      expect(ioFogClient.ioMessage(ioMessage)).to.deep.equal(expectedIOMessage)
    })
  })

  describe('sendNewMessage', () => {
    // Init
    let postStub
    const body = { id: 'id', timestamp: 'timestamp' }

    before(() => {
      postStub = sinon.stub(request, 'post')
    })

    after(() => {
      postStub.restore()
    })

    beforeEach((done) => {
      execStub.callsFake((command, cb) => {
        cb(null, null, null)
      })
      postStub.callsFake((opt, cb) => {
        const err = null
        const resp = { statusCode: 200 }
        cb(err, resp, body)
      })
      ioFogClient.init(null, null, 'NOT_DEFINED', () => {
        done()
      })
    })

    it('Should send an ioMessage using http', (done) => {
      const ioMessage = ioFogClient.ioMessage({
        contentdata: Buffer.from('contentdata'),
        contextdata: Buffer.from('contextdata')
      })
      const onError = () => done('Should not have errored')
      const onBadRequest = () => done('Should not have returned bad request')
      const onMessageReceipt = (id, timestamp) => {
        expect(postStub.args[0][0]).to.deep.equal({
          url: ioFogClient.getURL('http', '/v2/messages/new'),
          headers: {
            'Content-Type': 'application/json'
          },
          json: {
            ...ioMessage,
            contentdata: ioMessage.contentdata.toString('base64'),
            contextdata: ioMessage.contextdata.toString('base64')
          }
        })
        expect(id).to.equal(body.id)
        expect(timestamp).to.equal(body.timestamp)
        done()
      }
      const cb = { onError, onBadRequest, onMessageReceipt }
      ioFogClient.sendNewMessage(ioMessage, cb)
    })

    it('Should fail to send an ioMessage using http', (done) => {
      const error = { message: 'Failed' }
      postStub.callsFake((opt, cb) => {
        const resp = null
        cb(error, resp, null)
      })
      const ioMessage = ioFogClient.ioMessage({})
      const onError = (e) => {
        expect(e).to.deep.equal(error)
        done()
      }
      const onBadRequest = () => done('Should not have returned bad request')
      const onMessageReceipt = () => done('Should not have succeeded')
      const cb = { onError, onBadRequest, onMessageReceipt }
      ioFogClient.sendNewMessage(ioMessage, cb)
    })

    it('Should call badRequest on 400 status sending ioMessage using http', (done) => {
      const error = null
      const body = {
        message: 'Bad request'
      }
      postStub.callsFake((opt, cb) => {
        const resp = { statusCode: 400 }
        cb(error, resp, body)
      })
      const ioMessage = ioFogClient.ioMessage({})
      const onBadRequest = (e) => {
        expect(e).to.deep.equal(body)
        done()
      }
      const onError = () => done('Should not have errored')
      const onMessageReceipt = () => done('Should not have succeeded')
      const cb = { onError, onBadRequest, onMessageReceipt }
      ioFogClient.sendNewMessage(ioMessage, cb)
    })
  })

  describe('getNextMessages', () => {
    // Init
    let postStub
    const messages = [{
      ...ioFogClient.ioMessage({}),
      contentdata: Buffer.from('contentdata').toString('base64'),
      contextdata: Buffer.from('contextdata').toString('base64')
    }]
    const body = { id: 'id', timestamp: 'timestamp', messages }

    before(() => {
      postStub = sinon.stub(request, 'post')
    })

    after(() => {
      postStub.restore()
    })

    beforeEach((done) => {
      execStub.callsFake((command, cb) => {
        cb(null, null, null)
      })
      postStub.callsFake((opt, cb) => {
        const err = null
        const resp = { statusCode: 200 }
        cb(err, resp, body)
      })
      ioFogClient.init(null, null, 'NOT_DEFINED', () => {
        done()
      })
    })

    it('Should get unread ioMessages using http', (done) => {
      const onError = () => done('Should not have errored')
      const onBadRequest = () => done('Should not have returned bad request')
      const onMessages = (m) => {
        expect(postStub.args[0][0]).to.deep.equal({
          url: ioFogClient.getURL('http', '/v2/messages/next'),
          headers: {
            'Content-Type': 'application/json'
          },
          json: {
            id: 'NOT_DEFINED'
          }
        })
        expect(m).to.deep.equal([{
          ...ioFogClient.ioMessage({}),
          contentdata: Buffer.from('contentdata'),
          contextdata: Buffer.from('contextdata')
        }])
        done()
      }
      const cb = { onError, onBadRequest, onMessages }
      ioFogClient.getNextMessages(cb)
    })

    it('Should fail to get unread ioMessages using http', (done) => {
      const error = { message: 'Failed' }
      postStub.callsFake((opt, cb) => {
        const resp = null
        cb(error, resp, null)
      })
      const onError = (e) => {
        expect(e).to.deep.equal(error)
        done()
      }
      const onBadRequest = () => done('Should not have returned bad request')
      const onMessages = () => done('Should not have succeeded')
      const cb = { onError, onBadRequest, onMessages }
      ioFogClient.getNextMessages(cb)
    })

    it('Should call badRequest on 400 status getting unread ioMessages using http', (done) => {
      const error = null
      const body = {
        message: 'Bad request'
      }
      postStub.callsFake((opt, cb) => {
        const resp = { statusCode: 400 }
        cb(error, resp, body)
      })
      const onBadRequest = (e) => {
        expect(e).to.deep.equal(body)
        done()
      }
      const onError = () => done('Should not have errored')
      const onMessages = () => done('Should not have succeeded')
      const cb = { onError, onBadRequest, onMessages }
      ioFogClient.getNextMessages(cb)
    })
  })

  describe('getMessagesByQuery', () => {
    // Init
    let postStub
    const startdate = new Date('2018-11-20').getTime()
    const enddate = Date.now()
    const publishers = ['Albatros', 'Cameleon']
    const messages = [{
      ...ioFogClient.ioMessage({}),
      contentdata: Buffer.from('contentdata').toString('base64'),
      contextdata: Buffer.from('contextdata').toString('base64')
    }]
    const body = {
      id: 'id',
      timestamp: 'timestamp',
      messages,
      timeframestart: startdate,
      timeframeend: enddate
    }

    before(() => {
      postStub = sinon.stub(request, 'post')
    })

    after(() => {
      postStub.restore()
    })

    beforeEach((done) => {
      execStub.callsFake((command, cb) => {
        cb(null, null, null)
      })
      postStub.callsFake((opt, cb) => {
        const err = null
        const resp = { statusCode: 200 }
        cb(err, resp, body)
      })
      ioFogClient.init(null, null, 'NOT_DEFINED', () => {
        done()
      })
    })

    it('Should fail if publishers in not an array', () => {
      const errorStub = sinon.stub(logger, 'error')
      ioFogClient.getMessagesByQuery(startdate, enddate, null, {})
      expect(errorStub.args[0]).to.deep.equal(['getMessagesByQuery: Publishers input is not array!'])
      errorStub.restore()
    })

    it('Should get all ioMessages from specified publishers within time-frame using http', (done) => {
      const onError = () => done('Should not have errored')
      const onBadRequest = () => done('Should not have returned bad request')
      const onMessagesQuery = (start, end, m) => {
        expect(postStub.args[0][0]).to.deep.equal({
          url: ioFogClient.getURL('http', '/v2/messages/query'),
          headers: {
            'Content-Type': 'application/json'
          },
          json: {
            id: 'NOT_DEFINED',
            timeframestart: startdate,
            timeframeend: enddate,
            publishers
          }
        })
        expect(m).to.deep.equal([{
          ...ioFogClient.ioMessage({}),
          contentdata: Buffer.from('contentdata'),
          contextdata: Buffer.from('contextdata')
        }])
        expect(start).to.equal(startdate)
        expect(end).to.equal(enddate)
        done()
      }
      const cb = { onError, onBadRequest, onMessagesQuery }
      ioFogClient.getMessagesByQuery(startdate, enddate, publishers, cb)
    })

    it('Should fail to get all ioMessages from specified publishers within time-frame using http', (done) => {
      const error = { message: 'Failed' }
      postStub.callsFake((opt, cb) => {
        const resp = null
        cb(error, resp, null)
      })
      const onError = (e) => {
        expect(e).to.deep.equal(error)
        done()
      }
      const onBadRequest = () => done('Should not have returned bad request')
      const onMessagesQuery = () => done('Should not have succeeded')
      const cb = { onError, onBadRequest, onMessagesQuery }
      ioFogClient.getMessagesByQuery(startdate, enddate, publishers, cb)
    })

    it('Should call badRequest on 400 status getting all ioMessages from specified publishers within time-frame using http', (done) => {
      const error = null
      const body = {
        message: 'Bad request'
      }
      postStub.callsFake((opt, cb) => {
        const resp = { statusCode: 400 }
        cb(error, resp, body)
      })
      const onBadRequest = (e) => {
        expect(e).to.deep.equal(body)
        done()
      }
      const onError = () => done('Should not have errored')
      const onMessagesQuery = () => done('Should not have succeeded')
      const cb = { onError, onBadRequest, onMessagesQuery }
      ioFogClient.getMessagesByQuery(startdate, enddate, publishers, cb)
    })
  })

  describe('getConfig', () => {
    // Init
    const config = {
      foo: 'bar'
    }
    let postStub
    const body = { id: 'id', timestamp: 'timestamp', config: JSON.stringify(config) }

    before(() => {
      postStub = sinon.stub(request, 'post')
    })

    after(() => {
      postStub.restore()
    })

    beforeEach((done) => {
      execStub.callsFake((command, cb) => {
        cb(null, null, null)
      })
      postStub.callsFake((opt, cb) => {
        const err = null
        const resp = { statusCode: 200 }
        cb(err, resp, body)
      })
      ioFogClient.init(null, null, 'NOT_DEFINED', () => {
        done()
      })
    })

    it('Should get config using http', (done) => {
      const onError = () => done('Should not have errored')
      const onBadRequest = () => done('Should not have returned bad request')
      const onNewConfig = (c) => {
        expect(postStub.args[0][0]).to.deep.equal({
          url: ioFogClient.getURL('http', '/v2/config/get'),
          headers: {
            'Content-Type': 'application/json'
          },
          json: {
            id: 'NOT_DEFINED'
          }
        })
        expect(c).to.deep.equal(config)
        done()
      }
      const cb = { onError, onBadRequest, onNewConfig }
      ioFogClient.getConfig(cb)
    })

    it('Should fail to get config using http', (done) => {
      const error = { message: 'Failed' }
      postStub.callsFake((opt, cb) => {
        const resp = null
        cb(error, resp, null)
      })
      const onError = (e) => {
        expect(e).to.deep.equal(error)
        done()
      }
      const onBadRequest = () => done('Should not have returned bad request')
      const onNewConfig = () => done('Should not have succeeded')
      const cb = { onError, onBadRequest, onNewConfig }
      ioFogClient.getConfig(cb)
    })

    it('Should call badRequest on 400 status sending ioMessage using http', (done) => {
      const error = null
      const body = {
        message: 'Bad request'
      }
      postStub.callsFake((opt, cb) => {
        const resp = { statusCode: 400 }
        cb(error, resp, body)
      })
      const onBadRequest = (e) => {
        expect(e).to.deep.equal(body)
        done()
      }
      const onError = () => done('Should not have errored')
      const onNewConfig = () => done('Should not have succeeded')
      const cb = { onError, onBadRequest, onNewConfig }
      ioFogClient.getConfig(cb)
    })
  })

  describe('Websockets', () => {
    const host = 'localhost'
    const port = 1234
    const publisher = 'test-publisher'
    const controlURL = `/v2/control/socket/id/${publisher}`
    const messageURL = `/v2/message/socket/id/${publisher}`
    let mockServer

    beforeEach((done) => {
      execStub.callsFake((command, cb) => {
        cb(null, null, null)
      })
      ioFogClient.init(host, port, publisher, () => {
        done()
      })
    })

    afterEach(() => {
      if (mockServer) {
        mockServer.close()
        mockServer = null
      }
    })

    it('Should open a control WS and receive new config signal', (done) => {
      const controlServer = new WS.Server({ port, path: controlURL })
      mockServer = controlServer
      // Test is considered done when a new config signal is received
      const onNewConfigSignal = () => {
        ioFogClient.wsCloseControlConnection(() => {
          done()
        })
      }
      const onError = (e) => {
        done(e)
      }
      // Mock server that replies with a OPCODE_CONTROL_SIGNAL to any incoming connection
      controlServer.on('connection', (ws) => {
        const opCodeControlSignal = Buffer.from([12]) // OPCODE_CONTROL_SIGNAL
        ws.send(opCodeControlSignal)
      })

      ioFogClient.wsControlConnection(
        {
          onNewConfigSignal,
          onError
        }
      )
    })

    it('Should open a message WS, send a message and receive a message receipt', (done) => {
      const messageServer = new WS.Server({ port, path: messageURL })
      mockServer = messageServer
      const ioMessage = ioFogClient.ioMessage({})

      // Test is considered done when the mock server has received a ioMessage, and responded with a receipt
      const onMessageReceipt = () => {
        ioFogClient.wsCloseMessageConnection(() => {
          done()
        })
      }
      const onError = (e) => {
        done(e)
      }

      // Mock server will respond with OPCODE_RECEIPT if it receives a message starting with OPCODE_MSG
      messageServer.on('connection', socket => {
        socket.on('message', data => {
          if (data[0] === 13) { // OPCODE_MSG
            socket.send(Buffer.from([14])) // OPCODE_RECEIPT
          }
        })
      })

      ioFogClient.wsMessageConnection((ioFogClient) => {
        ioFogClient.wsSendMessage(ioMessage)
      }, {
        onMessageReceipt,
        onError
      })
    })

    it('Should open a message WS, send a message and receive it back', (done) => {
      const messageServer = new WS.Server({ port, path: messageURL })
      mockServer = messageServer
      const expectedIOMessage = {
        tag: 'tag',
        groupid: 'groupid',
        sequencenumber: 5,
        sequencetotal: 10,
        priority: 2,
        authid: 'authid',
        authgroup: 'authgroup',
        chainposition: 12,
        publisher,
        hash: 'hash',
        previoushash: 'previoushash',
        nonce: 'nonce',
        difficultytarget: 4,
        infotype: 'infotype',
        infoformat: 'infoformat',
        contextdata: Buffer.from('contextdata'),
        contentdata: Buffer.from('contentdata')
      }
      const ioMessage = ioFogClient.ioMessage({ ...expectedIOMessage })
      // Test is considered done when the mock server has received a ioMessage, and responded with a receipt
      const onMessages = (messages) => {
        expect(messages).to.deep.equal([expectedIOMessage])
        ioFogClient.wsCloseMessageConnection(() => {
          done()
        })
      }
      const onError = (e) => {
        done(e)
      }

      // Mock server will respond with same ioMessage if it receives a message starting with OPCODE_MSG
      messageServer.on('connection', socket => {
        socket.on('message', data => {
          if (data[0] === 13) { // OPCODE_MSG
            socket.send(data)
          }
        })
      })

      ioFogClient.wsMessageConnection((ioFogClient) => {
        ioFogClient.wsSendMessage(ioMessage)
      }, {
        onMessages,
        onError
      })
    })
  })
  describe('FileLogger', function () {
    const dir = '/temp/log/'
    const nestedDir = '/temp/log/iofog-microservices/'
    const warnStub = sinon.stub(FileLogger.prototype, 'warn')
    const infoStub = sinon.stub(FileLogger.prototype, 'info')
    const info = 'I am just info'
    const warning = 'Could not open the log file /var/log/not-exits/my-microservice.log. Reverting to std output logging'

    after(function () {
      sinon.restore()
      if (fs.existsSync(dir)) {
        fs.rmdir(dir)
      }
      if (fs.existsSync(nestedDir)) {
        fs.rmdir(nestedDir)
      }
    })

    it('file Logger should warn when directory is not created', (done) => {
      const fileLogger = new FileLogger('my-microservice.log', '/var/log/not-exits/')
      expect(warnStub.args[0]).to.deep.equal([warning])
      fileLogger.info('I am just info')
      expect(infoStub.args[0]).to.deep.equal([info])
      warnStub.restore()
      done()
    })

    it('file Logger should create directory', (done) => {
      const fileLogger = new FileLogger('my-microservice.log', dir)
      warnStub.neverCalledWith(warning)
      fileLogger.info('I am just info')
      expect(infoStub.args[0]).to.deep.equal([info])
      done()
    })

    it('file Logger should create nested directory', (done) => {
      const fileLogger = new FileLogger('my-microservice.log', nestedDir)
      warnStub.neverCalledWith(warning)
      fileLogger.info('I am just info')
      expect(infoStub.args[0]).to.deep.equal([info])
      done()
    })
  })
})
