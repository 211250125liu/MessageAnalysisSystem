import {request} from "../request.ts";

export function getStatsHourly(startTime: string,endTime : string){
    return request.get('/stats/hourly',{
        params:{
            start : startTime,
            end : endTime
        }
    })
}
