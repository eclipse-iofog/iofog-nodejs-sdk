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
    if (typeof number === 'bigint') { // Node.js v10.4+
      if (bytes.writeBigUInt64BE) { // Node.js v12+
        bytes.writeBigUInt64BE(number, 0, length)
      } else { // Node >= 10.4 < 12
        // https://github.com/nodejs/node/blob/v12.6.0/lib/internal/buffer.js#L590
        (function writeBigUInt64BE (buf, value, offset = 0) {
          let lo = Number(value & BigInt(0xffffffff))
          buf[offset + 7] = lo
          lo = lo >> 8
          buf[offset + 6] = lo
          lo = lo >> 8
          buf[offset + 5] = lo
          lo = lo >> 8
          buf[offset + 4] = lo
          let hi = Number(value >> BigInt(32) & BigInt(0xffffffff))
          buf[offset + 3] = hi
          hi = hi >> 8
          buf[offset + 2] = hi
          hi = hi >> 8
          buf[offset + 1] = hi
          hi = hi >> 8
          buf[offset] = hi
          return offset + 8
        })(bytes, number)
      }
    } else if (number.toBuffer) { // node-int64
      number.toBuffer().copy(bytes, 0, 0, length)
    } else {
      bytes.writeUIntBE(number, 0, length)
    }
  } catch (err) {
    console.error('Number to bytes: ', err)
    return []
  }
  return bytes
}

exports.readBigUInt64BE = function (data, pos, size) {
  if (typeof BigInt === 'function') { // Node v10.4+
    if (data.readBigUInt64BE) { // Node v12+
      return data.readBigUInt64BE(pos)
    }
    // https://github.com/nodejs/node/blob/v12.6.0/lib/internal/buffer.js#L98
    return (function readBigUInt64BE (buffer, offset = 0) {
      const first = buffer[offset]
      const last = buffer[offset + 7]

      const hi = first * 2 ** 24 +
      buffer[++offset] * 2 ** 16 +
      buffer[++offset] * 2 ** 8 +
      buffer[++offset]

      const lo = buffer[++offset] * 2 ** 24 +
      buffer[++offset] * 2 ** 16 +
      buffer[++offset] * 2 ** 8 +
        last

      return (BigInt(hi) << BigInt(32)) + BigInt(lo)
    })(data, pos)
  } else {
    return data.readUIntBE(pos, size)
  }
}
