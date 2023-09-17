import UserType from "@/Constants/userType";

export default interface UserSearch{
    id:number,
    username:string,
    phone:string,
    email:string,
    type:UserType,
    publicKey:string,
    avatar:string
}