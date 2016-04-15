/**
 * Created by josh on 6/25/15.
 *
 * this module lets you easily build an ioelement
 * with proper logging support. it gives you a method
 * to send and receive events, and to access
 * configuration information
 *
 *  - send new message to ioFabric
 *  - receive messages from ioFabric
 *  - get config options
 *  - create ioMessage JSON object
 *
 */

'use strict';

var ioFabricClient = module.exports = require('./ioFabricClient.js');

ioFabricClient.settings('127.0.0.1', 10500, null);

// REST call
// post new ioMessage to ioFabric
/*
 ioFabricClient.sendNewMessage(
 ioFabricClient.ioMessage('Bosch Camera 8798797', 'group1', 2, 100, 5, 'auth', 'authgrp', 10, 'hashingggg', 'prevhashingggg', 'nounceee',
 30, 'image/jpeg', 'base64', 'gghh', 'sdkjhwrtiy8wrtgSDFOiuhsrgowh4touwsdhsDFDSKJhsdkljasjklweklfjwhefiauhw98p328'),
 Object.create({
 "onBadRequest": function(errorMsg){ console.log(errorMsg); },
 "onMessageReceipt": function(messageId, timestamp){ console.log(messageId + ' : ' + timestamp); },
 "onError":function(error){ console.log(error); }
 })
 );
 */

// get list of ioMessages with query to ioFabric
/*ioFabricClient.getMessagesByQuery(Date.now(), Date.now(), ['PUBLISHER'],
 Object.create({
 "onBadRequest": function(errorMsg){ console.log(errorMsg); },
 "onMessagesQuery": function(timeframestart, timeframeend, messages){ console.log(timeframestart + ':' + timeframeend); console.log(messages); },
 "onError":function(error){ console.log(error); }
 })
 );*/

// get container's config
ioFabricClient.getConfig(
    Object.create({
        "onBadRequest": function(errorMsg){ console.log(errorMsg); },
        "onNewConfig":function(config){
            console.log(config);
        },
        "onError":function(error){ console.log(error); }
    })
 );

// WS call
/*
ioFabricClient.wsMessageConnection(
    function(ioFabricClient) {
        var ioMsg = ioFabricClient.ioMessage('Bosch Camera 8798797', 'group1', 2, 100, 5, 'auth', 'authgrp', 10, 'hashingggg',
            'prevhashingggg', 'nounceee', 30, 'image/jpeg', 'base64', new Buffer('gghh'),
            new Buffer('sdkjhwrtiy8wrtgSDFOiuhsrgowh4touwsdhsDFDSKJhsdkljasjklweklfjwhefiauhw98p328testcounter'));
        ioFabricClient.wsSendMessage(ioMsg);
    },
    Object.create({
        "onMessages": function(messages){ console.log(messages); },
        "onMessageReceipt": function(messageId, timestamp){ console.log(messageId + ' : ' + timestamp); },
        "onError":function(error){ console.log(error); }
    })
);
*/







