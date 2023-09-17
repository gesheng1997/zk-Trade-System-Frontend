import { request } from "../Utils/axiosRequest";
import { AdminRegister, OrgRegister, UserLogin, UserRegister } from "../Interface/User/UserIdentity";
import { UpdateUserInfo, UserInfo } from "../Interface/User/UserInfo";
import UserType from '../Constants/userType'
import { Response } from "../Interface/Response";
import Orgnization from "../Interface/User/OrgInfo";

export const getUserInfo = (id: number): Promise<Response> => {
	return request.get<Response>(`/user/${id}`);
};

//查询某一类型的所有用户----主要给管理员用
export const findAllUsers = (): Promise<Response> => {
	return request.get<Response>(`/user/all`);
}

//获取所有的金融组织
export const findAllCommercial = (): Promise<Response> => {
	return request.get<Response>('/user/commercial');
}

export const test = (): Promise<any> => {
	return request.get<any>('');
}

//用于注册的api
export const createUser = (body: UserRegister): Promise<Response> => {
	return request.post<Response>("/user/register", body);
};

export const createOrgUser = (body:OrgRegister): Promise<Response> => {
	return request.post<Response>("/user/register/org",body);
}

export const createAdminUser = (body:AdminRegister): Promise<Response> => {
	return request.post<Response>("/user/register/admin",body);
}

//用于登陆的api
export const checkUser = (body: UserLogin): Promise<Response> => {
	return request.post<Response>("/user/login", body);
};

export const updateUserInfo = (id:number, body: UpdateUserInfo): Promise<Response> => {
	return request.patch<Response>(`/user/${id}`, body);
};

export const deleteUser = (id: number): Promise<Response> => {
	return request.patch<Response>(`/user/${id}`);
};

export const checkToken = ():Promise<Response> => {
	return request.get<Response>('/user/checktoken');
}
