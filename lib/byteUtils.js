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
 * Utility lib for convenient numbers and string transformations to Buffer array.
 */

/**
 * Check if data is binary (https://github.com/websockets/ws/pull/1101)
 *
 * @param < Buffer | string> data
 * @returns <Boolean> - <Boolean> indicating if the data is binary
 */
exports.isBinary = function (data) {
  return typeof data !== 'string'
}

/**
 * Transforms integer to <Buffer> array.
 *
 * @param <Integer> integer
 * @returns <Buffer> - <Buffer> array representation of integer
 */
exports.intToBytes = function (integer) {
  return numberToBytes(integer, 4)
}

/**
 * Transforms short to <Buffer> array.
 *
 * @param <Short> short
 * @returns <Buffer> - <Buffer> array representation of short
 */
exports.shortToBytes = function (short) {
  return numberToBytes(short, 2)
}

/**
 * Transforms long to <Buffer> array.
 *
 * @param <Long> long
 * @returns <Buffer> - <Buffer> array representation of long
 */
exports.longToBytes = function (long) {
  return numberToBytes(long, 8)
}

/**
 * Transforms string to <Buffer> array.
 *
 * @param <String> string
 * @returns <Buffer> bytes - <Buffer> array representation of string
 */
exports.stringToBytes = function (string) {
  var bytes = []
  if (string) {
    for (var i = 0; i < string.length; ++i) {
      bytes.push(string.charCodeAt(i))
    }
  }
  return bytes
}

/**
 * Transforms decimal to <Buffer> array (as a 64-bit double).
 *
 * @param <Double> decimal
 * @returns <Buffer> bytes - <Buffer> array representation of string
 */
exports.decimalToBytes = function (decimal) {
  const bytes = Buffer.alloc(8)
  try {
    bytes.writeDoubleBE(decimal, 0)
  } catch (err) {
    console.error('Decimal to bytes: ', err)
    return []
  }
  return bytes
}

/**
 * Transforms number to <Buffer> array of specified length.
 *
 * @param <Number> number
 * @param <Integer> length
 * @returns <Buffer> bytes - <Buffer> array representation of number
 */
function numberToBytes (number, length) {
  const bytes = Buffer.alloc(length, 0)
  try {
    if (typeof number === 'bigint' && bytes.writeBigUInt64BE) { // Node.js v10.4+
      bytes.writeBigUInt64BE(number, 0, length)
    } else if (number.toBuffer) { // node-int64
      number.toBuffer().copy(bytes, 0, 0, length)
    } else {
      bytes.writeUIntBE(number, 0, length > 6 ? 6 : length)
    }
  } catch (err) {
    console.error('Number to bytes: ', err)
    return []
  }
  return bytes
}
