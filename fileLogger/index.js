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
const logrotate = require('logrotator')

// use the global rotator
const rotator = logrotate.rotator

const defaultFormat = {
  level: 'debug',
  messageKey: 'message',
  timestamp: () => {
    return ', "timestamp":' + `"${timeStamp()}"`
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
    let logDestination = null
    try {
      // Create the log directory if it does not exist
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName)
      }
      logDestination = pino.destination(path.resolve(dirName, fileName))
    } catch (e) { }

    const fileLogger = pino(
      {
        ...defaultFormat,
        level: 'info'
      },
      logDestination)
    this.logger = fileLogger
    if (logDestination !== null) {
      rotator.register(dirName + fileName, {
        schedule: '5m',
        size: '10m',
        compress: true,
        count: 5
      })
      process.on('SIGHUP', () => logDestination.reopen())
    } else {
      this.warn(`Could not open the log file ${path.resolve(dirName, fileName)}. Reverting to std output logging`)
    }
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
