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
```javascript
  var ioFabricClient = module.exports = require('@iotracks/container-sdk-nodejs');
```

set up custom host, port and container's ID (in case of no params default values for host and port will be used: 'iofabric', 54321)
and pass main callback to trigger when ioFabricClient initialization is done:
```javascript
  ioFabricClient.init( 'iofabric', 54321, null,
    function () {
        // any code to perform after ioFabric is initialized
    }
  );
```

#### REST calls
post new ioMessage to ioFabric via REST call:
```javascript
  ioFabricClient.sendNewMessage(
    ioFabricClient.ioMessage(
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
                 });
    Object.create( {
        'onBadRequest':
            function(errorMsg) {
                console.log(errorMsg);
            },
        'onMessageReceipt':
            function(messageId, timestamp) {
                console.log(messageId + ' : ' + timestamp);
            },
        'onError':
            function(error) {
                console.log(error);
            }
    } )
  );
```

get list of ioMessages by time frame for accessible publishers from ioFabric via REST call
```javascript
  ioFabricClient.getMessagesByQuery( Date.now(), Date.now(), ['PUBLISHER'],
    Object.create( {
        'onBadRequest':
            function(errorMsg) {
                console.log(errorMsg);
            },
        'onMessagesQuery':
            function(timeframestart, timeframeend, messages) {
                console.log(timeframestart + ':' + timeframeend);
                console.log(messages);
            },
        'onError':
            function(error) {
                console.log(error);
            }
    } )
  );
```

get list of next unread ioMessages via REST call
```javascript
  ioFabricClient.getNextMessages(
    Object.create( {
        'onBadRequest':
            function(errorMsg) {
                console.log(errorMsg);
            },
        'onMessages':
            function(messages) {
                console.log(messages);
            },
        'onError':
            function(error) {
                console.log(error);
            }
    } )
  );
```

get container's config via REST call
```javascript
  ioFabricClient.getConfig(
    Object.create( {
        'onBadRequest':
            function(errorMsg) {
                console.log(errorMsg);
            },
        'onNewConfig':
            function(config) {
               console.log(config);
            },
        'onError':
            function(error) {
                console.log(error);
            }
    } )
  );
```

#### WebSocket(WS) calls
open WS Message Channel to ioFabric with callback to send new message via this channel
```javascript
  ioFabricClient.wsMessageConnection(
    function(ioFabricClient) {
        var ioMsg = ioFabricClient.ioMessage(
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
                 });
        ioFabricClient.wsSendMessage(ioMsg);
    },
    Object.create( {
        'onMessages':
            function(messages) {
                console.log(messages);
            },
        'onMessageReceipt':
            function(messageId, timestamp) {
                console.log(messageId + ' : ' + timestamp);
            },
        'onError':
            function(error) {
                console.log(error);
            }
    } )
  );
```

Open WS Control Channel to ioFabric
```javascript
  ioFabricClient.wsControlConnection(
    Object.create( {
        'onNewConfigSignal':
            function() {
                console.log('New config is awaiting.');
            },
        'onError':
            function(error) {
                console.log(error);
            }
    } )
  );
```







