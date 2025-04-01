import {request} from "../request.ts";

export function getFlowBySource(sourceIp : string){
    return request.get('/flow/source/' + sourceIp)
}
export function getFlowByTarget(targetIp : string){
    return request.get('/flow/target/' + targetIp)
}
