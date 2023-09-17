import Exception from "@/Constants/exceptions";

export default interface ExceptionResponse{
    status:number,
    data:{code:Exception,message:string},
    path:string,
    time:Date,
    success:boolean,
}