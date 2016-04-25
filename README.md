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
```
  var ioFabricClient = module.exports = require('@iotracks/container-sdk-nodejs');
```

set up custom host, port and container's ID (in case of no params default values for host and port will be used: 'iofabric', 54321):
```
  ioFabricClient.settings('iofabric', 54321, null);
```

#### REST calls
post new ioMessage to ioFabric via REST call:
```
  ioFabricClient.sendNewMessage(
    ioFabricClient.ioMessage('Bosch Camera 8798797', 'group1', 2, 100, 5, 'auth', 'authgrp', 10, 'hashingggg', 'prevhashingggg', 'nounceee',
        30, 'image/jpeg', 'base64', 'gghh', 'sdkjhwrtiy8wrtgSDFOiuhsrgowh4touwsdhsDFDSKJhsdkljasjklweklfjwhefiauhw98p328'),
    Object.create({
        "onBadRequest": function(errorMsg){ console.log(errorMsg); },
        "onMessageReceipt": function(messageId, timestamp){ console.log(messageId + ' : ' + timestamp); },
        "onError":function(error){ console.log(error); }
    })
  );
```

get list of ioMessages by time frame for accessible publishers from ioFabric via REST call
```
  ioFabricClient.getMessagesByQuery(Date.now(), Date.now(), ['PUBLISHER'],
    Object.create({
        "onBadRequest": function(errorMsg){ console.log(errorMsg); },
        "onMessagesQuery": function(timeframestart, timeframeend, messages){ console.log(timeframestart + ':' + timeframeend); console.log(messages); },
        "onError":function(error){ console.log(error); }
    })
  );
```

get list of next unread ioMessages via REST call
```
  ioFabricClient.getNextMessages(
    Object.create({
        "onBadRequest": function(errorMsg){ console.log(errorMsg); },
        "onMessages": function(timeframestart, timeframeend, messages){ console.log(timeframestart + ':' + timeframeend); console.log(messages); },
        "onError":function(error){ console.log(error); }
    })
  );
```

get container's config via REST call
```
  ioFabricClient.getConfig(
    Object.create({
        "onBadRequest": function(errorMsg){ console.log(errorMsg); },
        "onNewConfig":function(config){
            console.log(config);
        },
        "onError":function(error){ console.log(error); }
    })
  );
```

#### WebSocket(WS) calls
open WS Message Channel to ioFabric with callback to send new message via this channel
```
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
```

Open WS Control Channel to ioFabric
```
  ioFabricClient.wsControlConnection(
    Object.create({
        "onNewConfigSignal": function(){ console.log("New config is awaiting,"); },
        "onError":function(error){ console.log(error); }
    })
  );
```







