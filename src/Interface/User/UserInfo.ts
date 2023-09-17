export interface User{
    id:number,
    username:string,
    type:number,
    phone?:string,
    email?:string,
    birthday?:Date,
    avatar?:string,
    address?:string,
    balance?:number,
    access_token?:string,
    gmt_create:string,
    publicKey:string,
}

export type UserInfo = User | null;

export interface UpdateUserInfo{
    username?:string,
    phone?:string,
    email?:string,
    birthday?:Date,
    avatar?:string,
    address?:string,
}
