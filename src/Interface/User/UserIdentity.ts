//有关身份的基础接口，不论是登陆还是注册都需要提供id 签名 密码
interface UserIdentityBase{
    // username?:string,
    // phone?:string,
    // email?:string,
    password:string,
}

//在基础接口的基础上拓展三个接口
interface UserIdenName extends UserIdentityBase{
    username:string;
}

interface UserIdenPhone extends UserIdentityBase{
    phone:string;
}

interface UserIdenEmail extends UserIdentityBase{
    email:string;
}

//最终创建一个联合类型作为登陆所使用的类型，该类型表示用户登录时可以选择用用户名/手机号/邮箱登陆
export type UserLogin = UserIdenName | UserIdenPhone | UserIdenEmail;

//在基础类型的基础上拓展用于注册的类型，要求提供公钥和用户名
export interface UserRegister extends UserIdentityBase{
    username:string,
    publicKey:string,
    signature:string,
}

export interface OrgRegister extends UserRegister{
    pemCert:string;
    pemSignature:string;
}

export interface AdminRegister extends UserRegister{
    token:string;
}