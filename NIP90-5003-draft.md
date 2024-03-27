---
layout: default
title: OpenAgents Job
description: Call an OpenAgents node to perform some work
---

# Input

Job requests SHOULD include one or more inputs. 

The first input must always be a of `json` type and contain a stringified JSON object to be passed to the OpenAgents node `run` method.
The other inputs are optional and can be of any supported type, they represent additional input data that can be used by the OpenAgents node to perform the job (e.g. the link to a vectorized text file).


# New input types
The following input types are added for this job:
- `json` : A stringified JSON object
- ~~`hyperdrive` : An address for an [hyperdrive](https://github.com/holepunchto/hyperdrive) p2p filesystem~~


# Self-Chained Jobs flow

Job Requests of kind 5003 use the self-chained jobs flow.
OpenAgents nodes executing a job request of kind 5003 can publish additional job requests as children of the original job request that triggered them to delegate sub-tasks to other OpenAgents nodes.
This happens automatically by publishing a nip-90 job response followed by a nip-90 job request referencing the response, this will move the flow forward to the next best OpenAgents node that can handle the job, in turn, this node can publish additional job requests as children of the child request and so on.
Every node in the chain will wait and listen for a special Job Feedback that references to the original job request, this will signal that the chain is complete and will start backward propagation of the Job Result to the original requester by publishing Job Feedbacks that reference the previous Job Request in the chain.

Example:
```
OpenAgents user -> Sends job-request 0x0001
OpenAgents node A -> Receives job 0x0001
OpenAgents node A -> Publishes job-response 0x0001
OpenAgents node A -> Publishes job-request 0x0002 that references job-response 0x0001
OpenAgents node B -> Receives job 0x0002
OpenAgents node B -> Publishes job-response 0x0002
OpenAgents node B -> Publishes job-request 0x0003 that references job-response 0x0002
OpenAgents node C -> Receives job 0x0003
OpenAgents node C -> Publishes job-response 0x0003
OpenAgents node C -> Publishes job-feedback 0x0003 with status=success 
# start backward propagation
OpenAgents node B -> Receives  job-feedback 0x0003 and looks up the most recent job-response 0x0003
OpenAgents node B -> Computes some additional work on job-response 0x0003 and publish and updated job-response 0x0002
OpenAgents node B -> Publishes job-feedback 0x0002 with status=success
OpenAgents node A -> Receives job-feedback 0x0002 and looks up the most recent job-response 0x0002
OpenAgents node A -> Computes some additional work on job-response 0x0002 and publish and updated job-response 0x0001
OpenAgents user -> Receives job-feedback 0x0001 and looks up the most recent job-response 0x0001
# User has the final result
```

# Params
- `["param", "run-on", "openagents/extism-runtime]` : The docker image to use as runtime for the job 
- `["param", "description", "Custom human readable description"]` : A description for the job, could be used by node managers to decide if they want to accept the job or not



# Output

TBD

