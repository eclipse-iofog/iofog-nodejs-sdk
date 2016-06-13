'use strict';

/*
 * ioTracks: ioTracks node.js SDK
 *
 * Utility lib for convenient numbers and string transformations to Buffer array.
 */

/**
 * Transforms integer to <Buffer> array.
 *
 * @param <Integer> integer
 * @returns <Buffer> - <Buffer> array representation of integer
 */
exports.intToBytes = function(integer) {
    return numberToBytes(integer, 4);
};

/**
 * Transforms short to <Buffer> array.
 *
 * @param <Short> short
 * @returns <Buffer> - <Buffer> array representation of short
 */
exports.shortToBytes = function(short) {
    return numberToBytes(short, 2);
};

/**
 * Transforms long to <Buffer> array.
 *
 * @param <Long> long
 * @returns <Buffer> - <Buffer> array representation of long
 */
exports.longToBytes = function(long) {
    return numberToBytes(long, 8);
};

/**
 * Transforms string to <Buffer> array.
 *
 * @param <String> string
 * @returns <Buffer> bytes - <Buffer> array representation of string
 */
exports.stringToBytes = function(string) {
    var bytes = [];
    if(string) {
        for (var i = 0; i < string.length; ++i) {
            bytes.push(string.charCodeAt(i));
        }
    }
    return bytes;
};

/**
 * Transforms decimal to <Buffer> array (as a 64-bit double).
 *
 * @param <Double> decimal
 * @returns <Buffer> bytes - <Buffer> array representation of string
 */
exports.decimalToBytes = function(decimal) {
    var bytes = Buffer(8);
    try {
        bytes.writeDoubleBE(decimal, 0);
    } catch (err) {
        console.error('Decimal to bytes: ', err);
        return [];
    }
    return bytes;
};

/**
 * Transforms number to <Buffer> array of specified length.
 *
 * @param <Number> number
 * @param <Integer> length
 * @returns <Buffer> bytes - <Buffer> array representation of number
 */
function numberToBytes(number, length) {
    var bytes = Buffer(length);
    try {
        bytes.writeUIntBE(number, 0, length);
    } catch (err) {
        console.error('Number to bytes: ', err);
        return [];
    }
    return bytes;
}
