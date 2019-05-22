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

/**
 * This module lets you easily build an ioElement.
 * It gives you all the functionality to interact with ioFog via Local API.
 * Additionally some useful methods to work with ioMessage.
 *
 *  - send new message to ioFog (sendNewMessage)
 *  - fetch next unread messages from ioFog (getNextMessages)
 *  - fetch messages for time period and list of accessible publishers (getMessagesByQuery)
 *  - get config options (getConfig)
 *  - create ioMessage JSON object (ioMessage)
 *  - connect to ioFog Control Channel via WebSocket (wsControlConnection)
 *  - connect to ioFog Message Channel via WebSocket (wsMessageConnection)
 *    and publish new message via this channel (wsSendMessage)
 *
 */

'use strict'

var ioFogClient = module.exports = require('./ioFogClient.js')

ioFogClient.init('iofog', 54321, null,
  function () {
    /* REST calls examples */
    /* post new ioMessage to ioFog via REST call */
    /* ioFogClient.sendNewMessage(
             ioFogClient.ioMessage(
                 {
                     'tag': 'Bosch Camera 8798797',
                     'groupid': 'group1',
                     'sequencenumber': 2,
                     'sequencetotal': 100,
                     'priority': 5,
                     'authid': 'auth',
                     'authgroup': 'authgrp',
                     'chainposition': 10,
                     'hash': 'hashingggg',
                     'previoushash': 'prevhashingggg',
                     'nonce': 'nounceee',
                     'difficultytarget': 30,
                     'infotype': 'image/jpeg',
                     'infoformat': 'base64',
                     'contextdata': 'gghh',
                     'contentdata' : 'sdkjhwrtiy8wrtgSDFOiuhsrgowh4touwsdhsDFDSKJhsdkljasjklweklfjwhefiauhw98p328'
                 }
             Object.create({
                 "onBadRequest": function(errorMsg){ console.log(errorMsg); },
                 "onMessageReceipt": function(messageId, timestamp){ console.log(messageId + ' : ' + timestamp); },
                 "onError":function(error){ console.log(error); }
             })
         ); */

    /* get list of ioMessages with query to ioFog via REST call */
    /*
         ioFogClient.getMessagesByQuery(Date.now(), Date.now(), ['PUBLISHER'],
         Object.create({
         "onBadRequest": function(errorMsg){ console.log(errorMsg); },
         "onMessagesQuery": function(timeframestart, timeframeend, messages){ console.log(timeframestart + ':' + timeframeend); console.log(messages); },
         "onError":function(error){ console.log(error); }
         })
         );
         */

    /* get list of next unread ioMessages via REST call */
    /*
         ioFogClient.getNextMessages(
         Object.create({
         "onBadRequest": function(errorMsg){ console.log(errorMsg); },
         "onMessages": function(messages){ console.log(timeframestart + ':' + timeframeend); console.log(messages); },
         "onError":function(error){ console.log(error); }
         })
         );
         */

    /* get container's config via REST call */
    ioFogClient.getConfig(
      Object.create({
        'onBadRequest': function (errorMsg) { console.log(errorMsg) },
        'onNewConfig': function (config) {
          console.log(config)
        },
        'onError': function (error) { console.log(error) }
      })
    )

    /* WS calls */
    /* Open WSMessage Channel to ioFog with callback to send new message via this channel */
    /*
         ioFogClient.wsMessageConnection(
         function(ioFogClient) {
         var ioMsg = ioFogClient.ioMessage('Bosch Camera 8798797', 'group1', 2, 100, 5, 'auth', 'authgrp', 10, 'hashingggg',
         'prevhashingggg', 'nounceee', 30, 'image/jpeg', 'base64', new Buffer('gghh'),
         new Buffer('sdkjhwrtiy8wrtgSDFOiuhsrgowh4touwsdhsDFDSKJhsdkljasjklweklfjwhefiauhw98p328testcounter'));
         ioFogClient.wsSendMessage(ioMsg);
         },
         Object.create({
         "onMessages": function(messages){ console.log(messages); },
         "onMessageReceipt": function(messageId, timestamp){ console.log(messageId + ' : ' + timestamp); },
         "onError":function(error){ console.log(error); }
         })
         );
         */

    /* Open WSControl Channel to ioFog */
    /*
         ioFogClient.wsControlConnection(
         Object.create({
         "onNewConfigSignal": function(){ console.log("New config is awaiting,"); },
         "onError":function(error){ console.log(error); }
         })
         );
         */
  }
)
