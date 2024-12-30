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
