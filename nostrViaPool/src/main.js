
import { sha256 } from '@noble/hashes/sha256';
import { schnorr } from '@noble/curves/secp256k1';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'

import { PoolConnectorClient  } from "openagents-grpc-proto";
import * as GRPC from "@grpc/grpc-js";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";

//////////////////
/// Helpers from
/// https://github.com/nbd-wtf/nostr-tools
/// Note: https://github.com/swentel/nostr-php
//////////////////
function getEventHash(evt) {
    const serializedEvt = JSON.stringify([0, evt.pubkey, evt.created_at, evt.kind, evt.tags, evt.content]);
    const encoder = new TextEncoder();
    const encodedEvent = encoder.encode(serializedEvt);
    const hashedEvent = sha256(encodedEvent);
    return hashedEvent;
}

function signEvent(event, sk, pk) {
    event.pubkey = bytesToHex(pk);
    event.id = bytesToHex(getEventHash(event));
    event.sig = bytesToHex(schnorr.sign(getEventHash(event), sk));
    return event;
}

function verifyEvent(event) {
    const hash = bytesToHex(getEventHash(event));
    if (hash !== event.id) {
        return false
    }
    try {
        const valid = schnorr.verify(event.sig, hash, event.pubkey)
        return valid
    } catch (err) {
        return false
    }
}
//////////////////
//////////////////
//////////////////



 
async function sendEvent(client, key,  event){
    const sk = hexToBytes(key);
    const pk = schnorr.getPublicKey(sk);
    const signedEvent = signEvent(event, sk, pk);
    const cc = await client.sendSignedEvent({
        groupId: "client", // no job
        event: JSON.stringify(signedEvent)
    });
    const rpcStatus = await cc.status;
    if (!(rpcStatus.code.toString() == "0" || rpcStatus.code.toString() == "OK")) {
        throw new Error(`rpc failed with status ${rpcStatus.code}: ${rpcStatus.detail}`);
    }
    return cc.response;
}


async function registerToEvents(client, nip01Filter){
    const cc = await client.subscribeToEvents({
        groupId: "client",
        filters: [JSON.stringify(nip01Filter)]
    });
    const rpcStatus = await cc.status;
    if (!(rpcStatus.code.toString() == "0" || rpcStatus.code.toString() == "OK")) {
        throw new Error(`rpc failed with status ${rpcStatus.code}: ${rpcStatus.detail}`);
    }
    const res=await cc.response;
    console.log(res);
    return res.subscriptionId;
}


async function getEvents(client, subscriptionId, limit){
    const cc = await client.getEvents({
        groupId: "client",
        subscriptionId: subscriptionId,
        limit: limit||100
    });
    const rpcStatus = await cc.status;
    if (!(rpcStatus.code.toString() == "0" || rpcStatus.code.toString() == "OK")) {
        throw new Error(`rpc failed with status ${rpcStatus.code}: ${rpcStatus.detail}`);
    }
    return cc.response.events;
}


async function main(){
    const POOL_IP="127.0.0.1";
    const POOL_PORT="5000";
    console.log("Connect to", `${POOL_IP}:${POOL_PORT}`);

    const transport = new GrpcTransport({
        host: `${POOL_IP}:${POOL_PORT}`,
        channelCredentials: GRPC.ChannelCredentials.createInsecure()
    });
    const client = new PoolConnectorClient(transport);
    const secretKey = bytesToHex(schnorr.utils.randomPrivateKey());

    console.log("Register for events")
    const subscriptionId = await registerToEvents(client, {
        kinds: [1]
    });


    console.log("Send event");
    const sendEventResp=await sendEvent(client, secretKey, {
        kind: 1,
        created_at: Math.floor(Date.now()/1000),
        content: "This is a simple self-signed text event using nip-01 sent through openagents pool",
        tags:[]
    });
    console.log(sendEventResp);


    console.log("Poll events on", subscriptionId, "...");
    while(true){
        const events = await getEvents(client,subscriptionId);
        if(events.length>0) console.log("Received events\n", events);
        await new Promise(resolve => setTimeout(resolve, 100));
    }
  

}


main();