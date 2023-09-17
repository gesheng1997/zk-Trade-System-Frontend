//交易查询
import TransactionState from "../../Constants/transactionState";
import TransactionType from "../../Constants/transactionType";

export default interface TransactionDto{
    id:number;

    from:number;
    fromUsername:string;
    fromUserPublicKey:string;
    fromUserPhone:string;
    fromUserEmail:string;

    to:number;
    toUsername:string;
    toUserPublicKey:string;
    toUserPhone:string;
    toUserEmail:string;

    amount:number;
    comment:string;
    state:TransactionState;

    type:TransactionType;    
    initTime:string;//
    gmt_modified:string;//这里后端返回的实际上就是string类型，故即使强行用Date去约束它不会报错！
    //但是在调用Date类型的方法如.getYear()...时将会报不是函数的错误！这个bug非常坑！
}