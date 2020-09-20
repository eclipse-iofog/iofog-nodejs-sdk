/*
 *  *******************************************************************************
 *  * Copyright (c) 2020 Edgeworx, Inc.
 *  *
 *  * This program and the accompanying materials are made available under the
 *  * terms of the Eclipse Public License v. 2.0 which is available at
 *  * http://www.eclipse.org/legal/epl-2.0
 *  *
 *  * SPDX-License-Identifier: EPL-2.0
 *  *******************************************************************************
 *
 */
const pino = require('pino')
const path = require('path')
const fs = require('fs')

const defaultFormat = {
  level: 'debug',
  messageKey: 'message',
  timestamp: () => {
    return ', "timestamp":' + timeStamp()
  },
  formatters: {
    level: (level) => ({ level })
  }
}

const timeStamp = () => {
  return new Date(Date.now()).toISOString()
}

class Logger {
  constructor (fileName, dirName = '/var/log/iofog-microservices/') {
    try {
    // Create the log directory if it does not exist
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName)
      }
    } catch (e) { }
    const logDestination = pino.destination(path.resolve(dirName, fileName))
    const fileLogger = pino(
      {
        ...defaultFormat,
        level: 'info'
      },
      logDestination)
    process.on('SIGHUP', () => logDestination.reopen())
    this.logger = fileLogger
  }

  info (...message) {
    this.logger.info(...message)
  }

  debug (...message) {
    this.logger.debug(...message)
  }

  error (...message) {
    this.logger.error(...message)
  }

  warn (...message) {
    this.logger.warn(...message)
  }

  trace (...message) {
    this.logger.trace(...message)
  }
}
module.exports = Logger
