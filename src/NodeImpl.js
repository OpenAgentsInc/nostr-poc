import Node from "./Node.js";

export default class NodeImpl extends Node{

    constructor(relay, runOn, delegateTo){
        super(relay, runOn);
        this.delegateTo=delegateTo;
    }


    async runForJob(jobId, input, sendStatus, sendResult, requestJob) {
        console.log("$"+this.runOn+": ", "Running for job ", jobId);

        // Run some job
        // This is a mockup, we just append the node name to the input \
        // and add "||" if we are at the end of the chain
        const output={
            v: input.v + " > " + this.runOn + (!this.delegateTo ? " > || " + this.runOn :"")
        };
        console.info(">>> ", output.v);

        // We send the result for this job
        const resultId=await sendResult(output);

        if (this.delegateTo){ // We are not at the end of the chain, we delegate to the next node to use the output of this job
            // Request a job to the next node
            const jobRequest = await requestJob(this.delegateTo, resultId);
        
            // Wait for the result of the job from the next node
            const result = await jobRequest.result();
            console.log("$" + this.runOn + ": ", " Got result for sub job ", jobRequest.jobId," transform...");

            // We transform the result of the job from the next node
            const finalResult = {
                v:result.v+" > "+this.runOn
            };
            console.info(">>> ", finalResult.v);

            // We send the result for this job and communicate to the previous node that from
            // our point of the chain forward, everything is completed
            const subResultId=await sendResult(finalResult);
            await sendStatus(true, subResultId);
        }else{
            // We are at the end of the chain, we communicate to the previous node that the job is completed
            await sendStatus(true, resultId);
        }
        
        

    }

}