# OpenAgents NIP-90 based protocol implementation PoC (draft)

This is a proof of concept implementation of a [NIP-90](https://github.com/nostr-protocol/nips/blob/master/90.md) based protocol for OpenAgents.
A new job kind is introduced, the `OpenAgents Job` that allows to call an OpenAgents node to perform some work [NIP90-5003-draft.md](./NIP90-5003-draft.md) (more work is needed to complete the specification).

The simulation runs a set of mockup nodes that are chained together to simulate an agent chain.

This is a test for the protocol, in a real scenario, the nodes would be self-contained containers running anywhere on the network.


## Useful links
- Entrypoint: [src/main.js](./src/main.js).
- Mockup node implementation: [src/NodeImpl.js](./src/NodeImpl.js).
- Job kind definition draft: [NIP90-5003-draft.md](./NIP90-5003-draft.md).


## How to run

```
npm i 
npm run start
```

Expected Output:

```
Start nodes
Trigger job chain
$placeholder1:  Request published 56f4ec438e5687bb6c6d84b7a95d3e63c3dea99f09790457d1b60a01a5a93299 and input JSON
$placeholder1:  Waiting for feedback for job 56f4ec438e5687bb6c6d84b7a95d3e63c3dea99f09790457d1b60a01a5a93299
$placeholder1:  received event Job Request 56f4ec438e5687bb6c6d84b7a95d3e63c3dea99f09790457d1b60a01a5a93299
$placeholder1:  Running for job  56f4ec438e5687bb6c6d84b7a95d3e63c3dea99f09790457d1b60a01a5a93299
>>>  User Input > placeholder1
$placeholder1:  Sending result a9fbdfb1e1f1893baea66485d5f358a310bf3832866a61fa085af4b8c531b6c0
$placeholder1:  Request published d77073aa3f75a7f25b71b32ffb4b15af489a45fd329be1e8aabe7c6af4df3b67 and input a9fbdfb1e1f1893baea66485d5f358a310bf3832866a61fa085af4b8c531b6c0
$placeholder1:  Waiting for feedback for job d77073aa3f75a7f25b71b32ffb4b15af489a45fd329be1e8aabe7c6af4df3b67
$placeholder2:  received event Job Request d77073aa3f75a7f25b71b32ffb4b15af489a45fd329be1e8aabe7c6af4df3b67
$placeholder2:  Fetch event a9fbdfb1e1f1893baea66485d5f358a310bf3832866a61fa085af4b8c531b6c0
$placeholder2:  Running for job  d77073aa3f75a7f25b71b32ffb4b15af489a45fd329be1e8aabe7c6af4df3b67
>>>  User Input > placeholder1 > placeholder2
$placeholder2:  Sending result de9cdbd41f08eaaf788b6463c9f2409331ee2c6e60602457660162e250992e18
$placeholder2:  Request published 130afb69059876d43e81a407b47670785bd02e9a7129d3194c9be8a432ea1071 and input de9cdbd41f08eaaf788b6463c9f2409331ee2c6e60602457660162e250992e18
$placeholder2:  Waiting for feedback for job 130afb69059876d43e81a407b47670785bd02e9a7129d3194c9be8a432ea1071
$placeholder3:  received event Job Request 130afb69059876d43e81a407b47670785bd02e9a7129d3194c9be8a432ea1071
$placeholder3:  Fetch event de9cdbd41f08eaaf788b6463c9f2409331ee2c6e60602457660162e250992e18
$placeholder3:  Running for job  130afb69059876d43e81a407b47670785bd02e9a7129d3194c9be8a432ea1071
>>>  User Input > placeholder1 > placeholder2 > placeholder3
$placeholder3:  Sending result f2d25cc6c822f9f9c88bed48bca26fec4b49cca0379ba9580b4b71be963a2879
$placeholder3:  Request published 2af21dca64634db1a7a94825e17c1fdbecaa71830ec54e200a3671c05da06bab and input f2d25cc6c822f9f9c88bed48bca26fec4b49cca0379ba9580b4b71be963a2879
$placeholder3:  Waiting for feedback for job 2af21dca64634db1a7a94825e17c1fdbecaa71830ec54e200a3671c05da06bab
$placeholder4:  received event Job Request 2af21dca64634db1a7a94825e17c1fdbecaa71830ec54e200a3671c05da06bab
$placeholder4:  Fetch event f2d25cc6c822f9f9c88bed48bca26fec4b49cca0379ba9580b4b71be963a2879
$placeholder4:  Running for job  2af21dca64634db1a7a94825e17c1fdbecaa71830ec54e200a3671c05da06bab
>>>  User Input > placeholder1 > placeholder2 > placeholder3 > placeholder4 > || placeholder4
$placeholder4:  Sending result f5628704ac57ae5af4b1d932e1adc0c61bd92b221d885c634409be35197f1913
$placeholder4:  Sending feedback for job 2af21dca64634db1a7a94825e17c1fdbecaa71830ec54e200a3671c05da06bab true 68f7e60740a36d751d60ff39a99174652e1cca673f3d1ad50754cd5567428ce5
$placeholder3:  Received feedback for job 2af21dca64634db1a7a94825e17c1fdbecaa71830ec54e200a3671c05da06bab success at 1711525621000
$placeholder3:  Waiting for result for job 2af21dca64634db1a7a94825e17c1fdbecaa71830ec54e200a3671c05da06bab
$placeholder3:  Received result for job 2af21dca64634db1a7a94825e17c1fdbecaa71830ec54e200a3671c05da06bab
$placeholder3:  Job 2af21dca64634db1a7a94825e17c1fdbecaa71830ec54e200a3671c05da06bab completed with status success
$placeholder3:   Got result for sub job  2af21dca64634db1a7a94825e17c1fdbecaa71830ec54e200a3671c05da06bab  transform...
>>>  User Input > placeholder1 > placeholder2 > placeholder3 > placeholder4 > || placeholder4 > placeholder3
$placeholder3:  Sending result 776bfd161330d7ea14755e27a580cd2f32cc1395bf3e1056499bedda5e0cb93d
$placeholder3:  Sending feedback for job 130afb69059876d43e81a407b47670785bd02e9a7129d3194c9be8a432ea1071 true 25e80f95a240b8d90abf9e06d8f10f29d5d4b44076515d4d359f623d121b4353
$placeholder2:  Received feedback for job 130afb69059876d43e81a407b47670785bd02e9a7129d3194c9be8a432ea1071 success at 1711525621000
$placeholder2:  Waiting for result for job 130afb69059876d43e81a407b47670785bd02e9a7129d3194c9be8a432ea1071
$placeholder2:  Received result for job 130afb69059876d43e81a407b47670785bd02e9a7129d3194c9be8a432ea1071
$placeholder2:  Job 130afb69059876d43e81a407b47670785bd02e9a7129d3194c9be8a432ea1071 completed with status success
$placeholder2:   Got result for sub job  130afb69059876d43e81a407b47670785bd02e9a7129d3194c9be8a432ea1071  transform...
>>>  User Input > placeholder1 > placeholder2 > placeholder3 > placeholder4 > || placeholder4 > placeholder3 > placeholder2
$placeholder2:  Sending result c8aa2fb59b8ff830d53b219127fc50bf05caccd86b11d10b6dc5c9648fe453bd
$placeholder2:  Sending feedback for job d77073aa3f75a7f25b71b32ffb4b15af489a45fd329be1e8aabe7c6af4df3b67 true 3706cb2c46e0f63ab1c5c39a5f22decc063530d1c68f531994b9cdf753a3d957
$placeholder1:  Received feedback for job d77073aa3f75a7f25b71b32ffb4b15af489a45fd329be1e8aabe7c6af4df3b67 success at 1711525622000
$placeholder1:  Waiting for result for job d77073aa3f75a7f25b71b32ffb4b15af489a45fd329be1e8aabe7c6af4df3b67
$placeholder1:  Received result for job d77073aa3f75a7f25b71b32ffb4b15af489a45fd329be1e8aabe7c6af4df3b67
$placeholder1:  Job d77073aa3f75a7f25b71b32ffb4b15af489a45fd329be1e8aabe7c6af4df3b67 completed with status success
$placeholder1:   Got result for sub job  d77073aa3f75a7f25b71b32ffb4b15af489a45fd329be1e8aabe7c6af4df3b67  transform...
>>>  User Input > placeholder1 > placeholder2 > placeholder3 > placeholder4 > || placeholder4 > placeholder3 > placeholder2 > placeholder1
$placeholder1:  Sending result b2f083a2f820889447ca9ba2c2837005b1cebded6b65231bd1bcf3b4321ba90f
$placeholder1:  Sending feedback for job 56f4ec438e5687bb6c6d84b7a95d3e63c3dea99f09790457d1b60a01a5a93299 true d41e445b5e485f05bcf0bfc350e48ce6aad47ed27f1e397800db72e5e354bc7f
$placeholder1:  Received feedback for job 56f4ec438e5687bb6c6d84b7a95d3e63c3dea99f09790457d1b60a01a5a93299 success at 1711525622000
$placeholder1:  Waiting for result for job 56f4ec438e5687bb6c6d84b7a95d3e63c3dea99f09790457d1b60a01a5a93299
$placeholder1:  Received result for job 56f4ec438e5687bb6c6d84b7a95d3e63c3dea99f09790457d1b60a01a5a93299
$placeholder1:  Job 56f4ec438e5687bb6c6d84b7a95d3e63c3dea99f09790457d1b60a01a5a93299 completed with status success


FINAL RESULT
 User Input > placeholder1 > placeholder2 > placeholder3 > placeholder4 > || placeholder4 > placeholder3 > placeholder2 > placeholder1 > User Output 
```
