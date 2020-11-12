# iofog/nodejs-sdk

This module lets you easily build a micro-service. It gives you all the functionality to interact with ioFog via Local API. Additionally some useful methods to work with ioMessage.

 - send new message to ioFog (sendNewMessage)
 - fetch next unread messages from ioFog (getNextMessages)
 - fetch messages for time period and list of accessible publishers (getMessagesByQuery)
 - get config options (getConfig)
 - create ioMessage JSON object (ioMessage)
 - connect to ioFog Control Channel via WebSocket (wsControlConnection)
 - connect to ioFog Message Channel via WebSocket (wsMessageConnection) and publish new message via this channel (wsSendMessage)

## Code snippets: 

import module:
```javascript
  var ioFogClient = require('@iofog/nodejs-sdk');
```

set up custom host, port and container's ID (in case of no params default values for host and port will be used: 'ioFog', 54321)
and pass main callback to trigger when ioFogClient initialization is done:
```javascript
  ioFogClient.init( 'iofog', 54321, null,
    function () {
        // any code to perform after ioFog is initialized
    }
  );
```

#### REST calls
post new ioMessage to ioFog via REST call:
```javascript
  ioFogClient.sendNewMessage(
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
                 }),
    {
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
    }
  );
```

get list of ioMessages by time frame for accessible publishers from ioFog via REST call
```javascript
  ioFogClient.getMessagesByQuery( Date.now(), Date.now(), ['PUBLISHER'],
    {
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
    }
  );
```

get list of next unread ioMessages via REST call
```javascript
  ioFogClient.getNextMessages(
    {
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
    }
  );
```

get container's config via REST call
```javascript
  ioFogClient.getConfig(
    {
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
    }
  );
```

get Agent's Edge Resources via REST call
```javascript
  ioFogClient.getEdgeResources(
    {
        'onBadRequest':
            function(errorMsg) {
                console.log(errorMsg);
            },
        'onEdgeResources':
            function(edgeResources) {
               console.log(edgeResources);
            },
        'onError':
            function(error) {
                console.log(error);
            }
    }
  );
```

#### WebSocket(WS) calls
open WS Message Channel to ioFog with callback that will be executed on open socket (in this example - sends new message via this channel)
```javascript
  ioFogClient.wsMessageConnection(
    function(ioFogClient) {
        var ioMsg = ioFogClient.ioMessage(
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
        ioFogClient.wsSendMessage(ioMsg);
    },
    {
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
    }
  );
```

Open WS Control Channel to ioFog
```javascript
  ioFogClient.wsControlConnection(
    {
        'onNewConfigSignal':
            function() {
                console.log('New config is awaiting.');
            },
        'onEdgeResourceUpdatedSignal':
            function() {
                console.log('Agent\'s Edge Resources have been updated.');
            },
        'onError':
            function(error) {
                console.log(error);
            }
    }
  );
```







