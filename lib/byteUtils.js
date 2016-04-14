'use strict';

/*
 * ioTracks: ioTracks node.js SDK
 *
 * Utility lib for convenient numbers ans string transformations to Buffer array.
 */

/**
 * Transforms integer to {Buffer} array.
 *
 * @param integer
 * @returns {Buffer} - {Buffer} array representation of integer
 */
exports.intToBytes = function(integer) {
    return numberToBytes(integer, 4);
}

/**
 * Transforms short to {Buffer} array.
 *
 * @param short
 * @returns {Buffer} - {Buffer} array representation of short
 */
exports.shortToBytes = function(short){
    return numberToBytes(short, 2);
}

/**
 * Transforms long to {Buffer} array.
 *
 * @param long
 * @returns {Buffer} - {Buffer} array representation of long
 */
exports.longToBytes = function(long){
    return numberToBytes(long, 8);
}

/**
 * Transforms string to {Buffer} array.
 *
 * @param string
 * @returns {Buffer} - {Buffer} array representation of string
 */
exports.stringToBytes = function(string){
    var bytes = [];
    for (var i = 0; i < string.length; ++i) { bytes.push(string.charCodeAt(i));}
    return bytes;
}

/**
 * Transforms number to {Buffer} array of specified length.
 *
 * @param number
 * @param length
 * @returns {Buffer} - {Buffer} array representation of number
 */
function numberToBytes(number, length) {
    var bytes = new Buffer(length);
    bytes.writeUIntBE(number, 0, length);
    return bytes;
}
