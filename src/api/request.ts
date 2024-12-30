import axios from 'axios'

export const request = axios.create({
    baseURL: '/api',  // 注意！！ 这里是全局统一加上了 '/api' 前缀，也就是说所有接口都会加上'/api前缀在，页面里面写接口的时候就不要加 '/api了，否则会出现2个'/api'，类似 '/api/api/user这样的报错，切记！！！
    timeout: 120000
})

// request 拦截器
// 可以自请求发送前对请求做一些处理
// 比如统一加token，对请求参数统一加密
request.interceptors.request.use(config => {
    // if (config.url.startsWith('/image')) config.headers['Content-Type'] = 'multipart/form-data';
    // else config.headers['Content-Type'] = 'application/json;charset=utf-8';
    // config.headers['token'] = user.token;  // 设置请求头
    // 其他接口默认为JSON格式
    config.headers['Content-Type'] = 'application/json;charset=utf-8';
    return config
}, error => {
    return Promise.reject(error)
});

// response 拦截器
// 可以在接口响应后统一处理结果
request.interceptors.response.use(
    response => {
        let res = response.data.result;
        // 如果是返回的文件
        if (response.config.responseType === 'blob') {
            return res
        }
        // 兼容服务端返回的字符串数据
        if (typeof res === 'string') {
            res = res ? JSON.parse(res) : res
            // console.log(res.data.list[0])
        }
        return res;
    },
    error => {
        console.log('err' + error) // for debug
        return Promise.reject(error)
    }
)
