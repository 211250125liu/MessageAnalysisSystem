import {request} from "./request.ts";

export function getMessageLen()  {
    return request.get('/message/count')
}
export function getMessage(pageNum : number, pageSize: number){
    return request.get('/message',{
        params:{
            pageNum : pageNum,
            pageSize : pageSize
        }
    })
}

export function getMessageByIp(srcIp : string,dstIp: string, pageNum : number, pageSize : number){
    return request.get('/ip/search',{
        params: {
            srcIp : srcIp,
            dstIp : dstIp,
            pageNum : pageNum,
            pageSize : pageSize
        }
    })
}

export function getMessageByMac(srcMac: string,dstMac : string, pageNum : number, pageSize: number){
    return request.get('/ethernet/search',{
        params: {
            srcMac : srcMac,
            dstMac : dstMac,
            pageSize : pageSize,
            pageNum : pageNum
        }
    })
}

export function getMessageByMacAndIp(srcMac : string, dstMac : string,srcIp : string,
dstIp : string, pageNum : number,pageSize : number){
    return request.get('/message/searchBySrcDstMacIp',{
        params: {
            srcMac : srcMac,
            dstMac : dstMac,
            srcIp: srcIp,
            dstIp : dstIp,
            pageNum : pageNum,
            pageSize : pageSize
        }
    })
}
