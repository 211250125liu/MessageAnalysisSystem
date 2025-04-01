import {request} from "../request.ts";

export function getTopSrcIp(start: string, end:string,topN : number){
    return request.get('/stats/top-src-ip',{
        params:{
            start : start,
            end: end,
            topN : topN
        }
    })
}

export function getTopDstIp(start: string, end:string,topN : number){
    return request.get('/stats/top-dst-ip',{
        params:{
            start : start,
            end: end,
            topN : topN
        }
    })
}
