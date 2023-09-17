//实现axios的一个封装
import axios, {
	AxiosError,
	AxiosInstance,
	InternalAxiosRequestConfig,
	AxiosRequestHeaders,
	AxiosRequestConfig,
	AxiosResponse,
} from "axios";
import apiConfig from "../Config/apiConfig";
import { httpStatus } from "../Constants/httpStatusCode";

const { timeout, baseURL } = apiConfig;

const service = axios.create({
	timeout,
	baseURL,
	validateStatus:(status) => {
		// console.log(localStorage.getItem('token'));
		return (status >= 200 && status < 400);
	},
	responseType:'json',
	// headers:{
	// 	'Authorization':`Bearer ${localStorage.getItem('token')}`
	// }
});

//这个方式可以在请求发给后端之前拦截，并检查其中的请求头格式，若不符合要求则报错
//并修改发送请求的Promise的状态为reject
// service.interceptors.request.use(
//     (config: InternalAxiosRequestConfig) => {
//       //配置自定义请求头
//       let customHeaders: any = {
//         language: 'zh-cn'
//       };
//       config.headers = customHeaders;
//       return config
//     },
//     error => {
//       console.log(error)
//       Promise.reject(error)
//     }
//   )
//携带token
service.interceptors.request.use(
	config => {
		console.log('@',localStorage.getItem('token'))
		const token = localStorage.getItem('token');
		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
		return config;
	},
	error => {
		throw new Error(error);
	}
);

//规定axios的返回格式，即后端在返回数据的时候应该遵循此处的格式要求！
interface axiosTypes<T> {
	data: T;
	status: number;
	message:string;
	success:boolean;
}

//后台响应数据格式
//###该接口用于规定后台返回的数据格式，意为必须携带code、msg以及result
//###而result的数据格式 由外部提供。如此即可根据不同需求，定制不同的数据格式
// interface responseTypes<T> {
// 	code: number;
// 	msg: string;
// 	result: T;
// }

//核心处理代码 将返回一个promise 调用then将可获取响应的业务数据
//这里写成了anyscript！你之后一定要润色这里
const requestHandler = <T>(
	method: "get" | "post" | "patch" | "delete",
	url: string,
	params: object = {},//这里虽然名字是params，但是实际上也可以是data！具体看method是什么
	config: AxiosRequestConfig = {}
): Promise<T> => {
	// let response: Promise<axiosTypes<responseTypes<T>>>;
	let response: Promise<axiosTypes<T>>;
	switch (method) {
		case "get":
			response = service.get(url, { params: { ...params }, ...config });
			break;
		case "post":
			response = service.post(url, { ...params }, { ...config });//此处虽然是按params展开，但实际上是用requestBody发出去的！
			break;
		case "patch":
			response = service.patch(url, { ...params }, { ...config });
			break;
		case "delete":
			response = service.delete(url, { params: { ...params }, ...config });
			break;
	}

	return new Promise<T>((resolve, reject) => {
		response
			.then((res) => {
				//业务代码 可根据需求自行处理
				const result:any = res;
				if (!result.data.success) {
                    reject();
					let err = JSON.stringify(res.data);
					
					//特定状态码 处理特定的需求
					switch (res.status) {
						case httpStatus.BAD_REQUEST:
							throw new AxiosError("HTTP error: 400 BAD_REQUEST", err);
						case httpStatus.UNAUTHORIZED:
							throw new AxiosError("HTTP error: 401 UNAUTHORIZED", err);
						case httpStatus.FORBIDDEN:
							throw new AxiosError("HTTP error: 403 FORBIDDEN", err);
						case httpStatus.INTERNAL_SERVER_ERROR:
							throw new AxiosError(
								"HTTP error: 500 INTERNAL_SERVER_ERROR",
								err
							);
						case httpStatus.BAD_GATEWAY:
							throw new AxiosError("HTTP error: 502 BAD_GATEWAY", err);
						case httpStatus.SERVER_UNAVAILABLE:
							throw new AxiosError("HTTP error: 503 SERVER_UNAVAILABLE", err);
						case httpStatus.GATEWAY_TIMEOUT:
							throw new AxiosError("HTTP error: 504 GATEWAY_TIMEOUT", err);
						default:
							break;
					}
				} else {
					//数据请求正确 使用resolve将结果返回
					resolve(res.data);
				}
			})
			.catch((error) => {
				// let err = JSON.stringify(error);
				console.log(error.response?.data.data.exception);
				reject(error.response?.data.data.exception);
			});
	});
};




// 使用 request 统一调用，包括封装的get、post、put、delete等方法
export const request = {
	get: <T>(url: string, params?: object, config?: AxiosRequestConfig) =>
		requestHandler<T>("get", url, params, config),
	post: <T>(url: string, params?: object, config?: AxiosRequestConfig) =>
		requestHandler<T>("post", url, params, config),
	patch: <T>(url: string, params?: object, config?: AxiosRequestConfig) =>
		requestHandler<T>("patch", url, params, config),
	delete: <T>(url: string, params?: object, config?: AxiosRequestConfig) =>
		requestHandler<T>("delete", url, params, config),
};

