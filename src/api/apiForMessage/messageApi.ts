import {request} from "../request.ts";

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

export function getLogByMessageId(messageId : number){
    return request.get('/log/selectByMessageId',{
        params:{
            messageId : messageId
        }
    })
}

export function getMessageByConditions(
    srcIp : string, dstIp : string, srcMac : string,dstMac : string,
    protocol : string, startTime : string, endTime : string,
    pageNum : number, pageSize : number){
    return request.get('/message/by-conditions',{
        params: {
            srcIp : srcIp,
            dstIp : dstIp,
            srcMac : srcMac,
            dstMac : dstMac,
            protocol : protocol,
            startTime : startTime,
            endTime : endTime,
            pageNum : pageNum,
            pageSize : pageSize
        }
    })
}
