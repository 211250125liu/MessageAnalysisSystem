import {requestForOriginLog} from "../request.ts";

export function getEventData(page,size,startTime,endTime,level){
    return requestForOriginLog.get('/eventData/searchEventData',{
        params: {
            page : page,
            size : size,
            startTime: startTime,
            endTime : endTime,
            level : level
        }
    })
}
export function getFields(dataSrcIp,page,size,startTime,endTime){
    return requestForOriginLog.get('/fields/searchFields',{
        params: {
            dataSrcIp : dataSrcIp,
            page : page,
            size : size,
            startTime : startTime,
            endTime : endTime
        }
    })
}

export function getFilePath(page,size,dataSrcIp,startTime,endTime){
    return requestForOriginLog.get('/filePath/searchFilePath',{
        params: {
            page : page,
            size : size,
            dataSrcIp : dataSrcIp,
            startTime : startTime,
            endTime : endTime
        }
    })
}

export function getFlowStart(page,size,startTime,endTime,eventType){
    return requestForOriginLog.get('/flowStart/searchFlowStart',{
        params: {
            page : page,
            size : size,
            startTime : startTime,
            endTime : endTime,
            eventType : eventType
        }
    })
}

export function getId(page,size,startTime,endTime,eventType){
    return requestForOriginLog.get('/id/searchId',{
        params: {
            page : page,
            size : size,
            startTime : startTime,
            endTime : endTime,
            eventType : eventType
        }
    })
}

export function getProductFamily(page,size,startTime,endTime,dataSrcIp){
    return requestForOriginLog.get('/productFamily/searchProductFamily',{
        params: {
            page : page,
            size : size,
            startTime : startTime,
            endTime : endTime,
            dataSrcIp : dataSrcIp
        }
    })
}

export function getRcodeName(page,size,startTime,endTime,proto){
    return requestForOriginLog.get('/rcodeName/searchRcodeName',{
        params: {
            page : page,
            size : size,
            startTime : startTime,
            endTime : endTime,
            proto : proto
        }
    })
}
