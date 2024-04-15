import { finalizeEvent, generateSecretKey, getPublicKey } from 'nostr-tools/pure'

export default class Node{
     
    constructor(relay, runOn) {
        this.jobData={};
        this.startTime = Date.now();
        this.sk = generateSecretKey();
        this.pk = getPublicKey(this.sk);
        this.relay = relay;
        this.runOn = runOn;
        this.relay.subscribe([
            {
                kinds: [5003, 6003, 7000],
                since: Math.floor(this.startTime / 1000)
            }
        ], {
            onevent: async (event) => {
                try {
                    const jobId = event.id;
                    if (!this.jobData[jobId]) {
                        this.jobData[jobId] = {
                            result: [],
                            feedback: [],
                            request: []
                        };
                    }

                    if (event.kind === 6003) { // result

                        const jobId = event.tags.find(t => t[0] === "e")[1];
                        // console.log(this.runOn, "received event Job Result", jobId);

                        const customer = event.tags.find(t => t[0] === "p")[1];
                        const result = event.content;
                        const timestamp = event.created_at * 1000;
                        this.jobData[jobId].result.push({
                            jobId: jobId,
                            customer: customer,
                            result: result,
                            timestamp: timestamp
                        });
                    } else if (event.kind === 7000) { // feedback

                        const jobId = event.tags.find(t => t[0] === "e")[1];
                        // console.log(this.runOn, "received event Job Feedback", jobId);

                        const status = event.tags.find(t => t[0] === "status")[1];
                        const timestamp = event.created_at * 1000;
                        this.jobData[jobId].feedback.push({
                            jobId: jobId,
                            status: status,
                            timestamp: timestamp
                        });
                    } else { // request

                        if (event.tags.find(t => t[0] === "param")[2] != runOn) {
                            return;
                        }
                        console.log("$" + this.runOn + ": ",  "received event Job Request", jobId);

                        const pubkey = event.pubkey;
                        const inputData = event.tags.find(t => t[0] === "i");
                        let input = inputData[1];
                        const inputType = inputData[2] || "json";


                        const timestamp = event.created_at * 1000;
                        this.jobData[jobId].request.push({
                            jobId: jobId,
                            customer: pubkey,
                            input: input,
                            inputType: inputType,
                            runOn: runOn,
                            timestamp: timestamp
                        });
                    }
                } catch (e) {
                    throw new Error("$" + this.runOn + ": "+ "Error processing event"+JSON.stringify(event)+e);
                }
            }

        });
    }


    async waitFor(type = "request", jobId, afterTimestamp){
       return new Promise(async (res, rej) => {
            const _run=()=>{
                if (this.jobData){
                    const _ck=(jobId)=>{
                        if (this.jobData[jobId]) {
                            const jobs=this.jobData[jobId][type];
                            for(let i=jobs.length-1;i>=0;i--){
                                const e=jobs[i];
                                if (e.timestamp >= afterTimestamp) {
                                    res(e);
                                    jobs.splice(i,1);
                                    return true;
                                }
                            }
                        }
                        return false;
                    };
                    if (jobId){
                        if (_ck(jobId)) return;
                    }else{
                        for(let jobId in this.jobData){
                            const job=this.jobData[jobId];
                            if(!job.processed){
                                job.processed=true;
                                if (_ck(jobId)) return;
                            }
                        }
                    }
                }
                setTimeout(_run, 10);
            };
            _run();
        });

    }

    async run(){
        while(true){
            const job=await this.waitFor("request", undefined, 0);
            this.onJob(job.jobId, job.customer, job.input, job.inputType);
        }
    }

    async runForJob(jobId, input, sendStatus, sendResult, requestJob){
        throw new Error("Not implemented");
    }


    async getEvent(id){
        console.log("$" + this.runOn + ": ", "Fetch event", id);
        const event = await new Promise((res, rej) => {
            let returned = false;
            const sub = this.relay.subscribe([
                {
                    ids: [id],
                    limit: 1
                },
            ], {
                onevent(event) {
                    returned = true;
                    res(event);
                    sub.close();
                },
                oneose() {
                    returned = true;
                    sub.close()
                    if (!returned) res();
                }
            })
        });
        if (!event) throw new Error("$" + this.runOn + ": " + "Event not found");
        return event;
    }

    async onJob(jobId, customer, input, inputType){
        if(inputType=="json"){
            input=JSON.parse(input);
        }else if(inputType=="event"){
            const event = await this.getEvent(input);
            input = JSON.parse(event.content);
        }
        this.runForJob(jobId, input, (success, refResult)=>{
            return this.sendFeedback(jobId, success , refResult);
        }, (result)=>{
            return this.sendResult(jobId, customer, result);
        }, (runOn, output)=>{
            return this.requestJob(runOn, output);
        });
    }
    
    async sendResult(jobId, customer, result){
        let resultEvent={
            kind: 6003,
            created_at: Math.floor(Date.now() / 1000),
            content: JSON.stringify(result),
            tags: [
                ["e", jobId],
                ["p", customer],
                ["expiration", "" + Math.floor((Date.now() + 1000 * 60 * 60) / 1000)] 
            ]
        };
        resultEvent = finalizeEvent(resultEvent, this.sk);
        await this.relay.publish(resultEvent);
        console.log("$" + this.runOn + ": ", "Sending result", resultEvent.id);

        return resultEvent.id;
    }


    async sendFeedback(jobId, success, refResult){
        // TODO: maybe do something with refResult to ensure consistency
        let feedbackEvent={
            kind: 7000,
            content: "",
            created_at: Math.floor(Date.now() / 1000),
            tags: [
                ["status", success ? "success" : "error"],
                ["e", jobId],
                ["expiration", "" + Math.floor((Date.now() + 1000 * 60 * 60) / 1000)] 
            ]
        };
        feedbackEvent = finalizeEvent(feedbackEvent, this.sk);
        console.log("$" + this.runOn + ": ", "Sending feedback for job", jobId, success, feedbackEvent.id);

        await this.relay.publish(feedbackEvent);
    }

    async requestJob(runOn,data){
        let jobRequestEvent = {
            kind: 5003,
            content: "",
            created_at: Math.floor(Date.now() / 1000),
            tags: [
                ["param", "run-on", runOn], // we chose the entry node
                typeof data=="string"?["i", data,"event"]:["i", JSON.stringify(data), "json"], // we send some input to the entry node
                ["expiration", "" + Math.floor((Date.now() + 1000 * 60 * 60) / 1000)]  // the expiration
                // is actually not needed
                // and most likely unwanted
                // in a real scenario, we
                // are using it here just to
                // avoid polluting the relay
                // with test events
            ]
        };
        jobRequestEvent = finalizeEvent(jobRequestEvent, this.sk);

        await this.relay.publish(jobRequestEvent);
        console.log("$" + this.runOn + ": ", "Request published", jobRequestEvent.id, "and input", (typeof data=="string"?data:"JSON"));
        const jobId = jobRequestEvent.id;

        const getResult=async ()=>{
            console.log("$" + this.runOn + ": ", "Waiting for feedback for job", jobId);
            const feedback = await this.waitFor("feedback", jobId, jobRequestEvent.created_at * 1000);
            const status = feedback;
            console.log("$" + this.runOn + ": ", "Received feedback for job", jobId, status.status, "at", feedback.timestamp)
            

            if (status.status !== "success") {
                throw new Error("$" + this.runOn + ": "+"Job "+jobId+" failed with status "+status.status);
            }

            console.log("$" + this.runOn + ": ", "Waiting for result for job", jobId);
            const result = await this.waitFor("result", jobId, jobRequestEvent.created_at*1000);
            console.log("$" + this.runOn + ": ", "Received result for job", jobId);
        
            console.log("$" + this.runOn + ": ", "Job", jobId, "completed with status", status.status);
            return JSON.parse(result.result);
        };
        return {
            jobId, result: getResult
        };

    }
}