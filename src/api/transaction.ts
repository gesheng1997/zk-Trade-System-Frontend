import TransactionDisplayState from "@/Constants/transactionDisplayState";
import { request } from "../Utils/axiosRequest";
import { Response } from "../Interface/Response";
import { CreateTransaction } from "@/Interface/Transaction/CreateTransaction";

//获取所有我涉及的交易，输入为用户id
export const findAllMyTrans = (id: number): Promise<Response> => {
	return request.get<Response>(`/transaction/${id}`);
};

//生成凭证，输入为交易id
export const generateVoucher = (id: number): Promise<Response> => {
	return request.get<Response>(`/transaction/voucher/${id}`);
};

export const createNormalTrans = (transaction:CreateTransaction):Promise<Response> => {
	return request.post<Response>('/transaction/normal',transaction);
}

export const createDepositTrans = (transaction:CreateTransaction):Promise<Response> => {
	return request.post<Response>('/transaction/deposit',transaction);
}

export const createWithdrawTrans = (transaction:CreateTransaction):Promise<Response> => {
	return request.post<Response>('/transaction/withdraw',transaction);
}