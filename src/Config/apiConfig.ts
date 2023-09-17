//该文件用于写入一些api请求的相关参数，从而达到通过axios.create创建axios实例（封装axios）时不会出现魔法数字
import BACK_ENV from "./backEnvironment";

const apiConfig = {
    timeout:15000,//默认请求超时时间
    baseURL:'http://127.0.0.1:8080',
}

export default apiConfig;