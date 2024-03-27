import { Relay } from 'nostr-tools/relay';
import NodeImpl from './NodeImpl.js';
import ws from 'ws';
import { useWebSocketImplementation } from 'nostr-tools/relay'
useWebSocketImplementation(ws);


const RELAY = process.env.NOSTR_RELAY || "wss://nostr.rblb.it:7777";
async function main(){
    const relay = await Relay.connect(RELAY)

    // Note: this is an hardcoded mockup of a chain of dumb nodes
    // in a real scenario, the chain would be created dynamically

    // entry node
    const node0 = new NodeImpl(relay, "placeholder1", "placeholder2");

    // chain
    const node1 = new NodeImpl(relay, "placeholder2", "placeholder3");
    const node2 = new NodeImpl(relay, "placeholder3", "placeholder4");

    // end of chain
    const node3 = new NodeImpl(relay, "placeholder4");

    // start the nodes as separated nostr clients
    console.log("Start nodes");
    node0.run();
    node1.run();
    node2.run();
    node3.run();

    // start the chain, this could be an event posted by any nostr client
    // we use the requestJob api just for convenience
    console.log("Trigger job chain");
    const req=await node0.requestJob("placeholder1", {v:"User Input"});

    // Wait for the job to complete
    const res=await req.result();


    // Print out the result and check if it is as expected
    const v=res.v+" > User Output";
    console.info("\n\nFINAL RESULT\n", v, "\n\n");

    const expectedResult ="User Input > placeholder1 > placeholder2 > placeholder3 > placeholder4 > || placeholder4 > placeholder3 > placeholder2 > placeholder1 > User Output";
    if(v!==expectedResult){
        console.error("\n\n!!!!!\nError: Expected\n", expectedResult, "\nbut got\n", v);
        process.exit(1);
    }
    process.exit(0);
    

}

main();