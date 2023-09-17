//交易创建
export interface CreateTransaction {
    from:number,//发起人用户id
    to:number,//接收人用户id
    amount:number,//转账金额
    timestamp:Date,//交易发起的时间戳
    comment:string,//用于在生成凭证时写入的内容
    digest:string,//交易信息sha256摘要
    signature:string,//hex字符串ed25519签名
}

export interface CreateTransactionsDto extends CreateTransaction{
    count:number;
}
