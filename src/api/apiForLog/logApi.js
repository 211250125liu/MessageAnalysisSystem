import {requestForLog} from "../request.ts";

export function getAllFieldsLog(page,size){
    return requestForLog.get('/fields/getAll',{
        params: {
            page: page,
            size : size
        }
    })
}

export function getAllFilePathLog(page,size){
    return requestForLog.get('/filePath/getAll',{
        params:{
            page: page,
            size:size
        }
    })
}

export function getAllFlowStartLog(page,size){
    return requestForLog.get('/flowStart/getAll',{
        params:{
            page: page,
            size:size
        }
    })
}

export function getAllIdLog(page,size){
    return requestForLog.get('/id/getAll',{
        params:{
            page: page,
            size:size
        }
    })
}

export function getAllProductFamilyLog(page,size){
    return requestForLog.get('/productFamily/getAll',{
        params:{
            page: page,
            size:size
        }
    })
}

export function getAllRCodeNameLog(page,size){
    return requestForLog.get('/rcodeName/getAll',{
        params:{
            page: page,
            size:size
        }
    })
}

export function getAllRtLog(page,size){
    return requestForLog.get('/rt/getAll',{
        params:{
            page: page,
            size:size
        }
    })
}

export function searchWithConditions(size,cat,factoryName,proto,page,startTime,endTime){
    return requestForLog.get('logs/searchWithConditions',{
        params: {
            size : size,
            cat : cat,
            factoryName : factoryName,
            proto : proto,
            page : page,
            startTime: startTime,
            endTime : endTime
        }
    })
}

export function getLogDetail(id){
    return requestForLog.get('logs/detail/' + id)
}
