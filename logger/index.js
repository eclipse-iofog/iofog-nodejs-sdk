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

const timeStamp = () => {
  return new Date(Date.now()).toISOString()
}

const defaultFormat = {
  level: 'debug',
  messageKey: 'message',
  stack: 'stacktrace',
  timestamp: () => {
    return ', "timestamp":' + timeStamp()
  },
  formatters: {
    level: (level) => ({ level })
  }
}

const logger = pino(defaultFormat)
module.exports = logger
