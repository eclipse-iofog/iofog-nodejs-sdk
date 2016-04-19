# container-sdk-nodejs

This module lets you easily build an ioElement. It gives you all the functionality to interact with ioFabric via Local API. Additionally some useful methods to work with ioMessage.

 - send new message to ioFabric (sendNewMessage)
 - fetch next unread messages from ioFabric (getNextMessages)
 - fetch messages for time period and list of accessible publishers (getMessagesByQuery)
 - get config options (getConfig)
 - create ioMessage JSON object (ioMessage)
 - connect to ioFabric Control Channel via WebSocket (wsControlConnection)
 - connect to ioFabric Message Channel via WebSocket (wsMessageConnection) and publish new message via this channel (wsSendMessage)

## Code snippets: 

import module:
<pre>
  var ioFabricClient = module.exports = require('@iotracks/container-sdk-nodejs');
</pre>

set up custom host, port and contaoner's ID:
<pre>
  ioFabricClient.settings('iofabric', 54321, null);
</pre>

#### REST calls
post new ioMessage to ioFabric via REST call:
<pre>
  ioFabricClient.sendNewMessage(
    ioFabricClient.ioMessage('Bosch Camera 8798797', 'group1', 2, 100, 5, 'auth', 'authgrp', 10, 'hashingggg', 'prevhashingggg', 'nounceee',
        30, 'image/jpeg', 'base64', 'gghh', 'sdkjhwrtiy8wrtgSDFOiuhsrgowh4touwsdhsDFDSKJhsdkljasjklweklfjwhefiauhw98p328'),
    Object.create({
        "onBadRequest": function(errorMsg){ console.log(errorMsg); },
        "onMessageReceipt": function(messageId, timestamp){ console.log(messageId + ' : ' + timestamp); },
        "onError":function(error){ console.log(error); }
    })
  );
</pre>

get list of ioMessages by time frame for accessible publishers from ioFabric via REST call
<pre>
  ioFabricClient.getMessagesByQuery(Date.now(), Date.now(), ['PUBLISHER'],
    Object.create({
        "onBadRequest": function(errorMsg){ console.log(errorMsg); },
        "onMessagesQuery": function(timeframestart, timeframeend, messages){ console.log(timeframestart + ':' + timeframeend); console.log(messages); },
        "onError":function(error){ console.log(error); }
    })
  );
</pre>

get list of next unread ioMessages via REST call
<pre>
  ioFabricClient.getNextMessages(
    Object.create({
        "onBadRequest": function(errorMsg){ console.log(errorMsg); },
        "onMessages": function(timeframestart, timeframeend, messages){ console.log(timeframestart + ':' + timeframeend); console.log(messages); },
        "onError":function(error){ console.log(error); }
    })
  );
</pre>

get container's config via REST call
<pre>
  ioFabricClient.getConfig(
    Object.create({
        "onBadRequest": function(errorMsg){ console.log(errorMsg); },
        "onNewConfig":function(config){
            console.log(config);
        },
        "onError":function(error){ console.log(error); }
    })
  );
</pre>

#### WebSocket(WS) calls
open WS Message Channel to ioFabric with callback to send new message via this channel
<pre>
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
</pre>

Open WS Control Channel to ioFabric
<pre>
  ioFabricClient.wsControlConnection(
    Object.create({
        "onNewConfigSignal": function(){ console.log("New config is awaiting,"); },
        "onError":function(error){ console.log(error); }
    })
  );
</pre>







