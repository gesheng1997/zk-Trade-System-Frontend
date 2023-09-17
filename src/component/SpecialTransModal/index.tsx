import Orgnization from '@/Interface/User/OrgInfo';
import { findAllCommercial } from '../../api/loginRegister';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Form, Input, InputNumber, Modal, Select, message } from 'antd'
import React,{ useEffect, useState } from 'react'
import CryptoJS from 'crypto-js';
import * as ed from '@noble/ed25519';
import uint8ArrayToHex from '../../Utils/Uint8ArrayToHexStr';
import { CreateTransaction } from '@/Interface/Transaction/CreateTransaction';
import Exception from '../../Constants/exceptions';
import { createDepositTrans, createWithdrawTrans } from '../../api/transaction';

export default function SpecialTransModal(props) {
    const { userInfo, setOpen, transType, title, open } = props;

    const [commercials,setCommercials] = useState<Orgnization[]>([]);

    const [transForm] = Form.useForm();

    useEffect(() => {
        findAllCommercial().then(res => {
            setCommercials(res.data);
        }).catch(err => {
            console.log(err);
        })
    },[]);

    const launchTransHandler = () => {
        transForm.validateFields().then(() => {
            const info = transForm.getFieldsValue();
            const transactionInfo = {
                from:userInfo.id,
                ...info,
                amount:transType === 'deposit'? -info.amount:info.amount,//充值交易amount应为负值
                timestamp:new Date()
            }

            			//CryptoJs中SHA256函数需要用这种方式转为16进制字符串
			const digest = CryptoJS.SHA256(JSON.stringify(transactionInfo)).toString(CryptoJS.enc.Hex);
			/* 
				此处去localStorage中取用私钥，私钥在其中键为username-privateKey
				如果没有，则报错！如果有才会进行签名操作 
			*/
			const privateKey = localStorage.getItem(`private-${userInfo.id}`);

			if(privateKey){
				ed.signAsync(digest, privateKey).then(res => {
					const signature = uint8ArrayToHex(res);
					
					const transactionData:CreateTransaction = {
						...transactionInfo,
						digest,
						signature,
					}

					console.log(transactionData);
                    if(transType === 'deposit'){
                        createDepositTrans(transactionData).then(res => {
                            console.log('创建的交易id：',res.data);
                            message.success(`创建交易成功，交易编号#${res.data}`);
                        }).catch(err => {
                            console.log(err);
                            if(err.response.code === Exception.INVALID_TRANSACTION){
                                message.error('交易字段值非法，请检查时间戳及金额');
                            }else if(err.response.code === Exception.INVALID_ORGANIZAITON){
                                message.error('金融组织不存在，请检查交易信息');
                            }else if(err.response.code === Exception.VERIFY_FAIL){
                                message.error('验证签名失败');
                            }else{
                                message.error('创建交易失败');
                            }
                        });
                    }else{
                        createWithdrawTrans(transactionData).then(res => {
                            console.log('创建的交易id：',res.data);
                            message.success(`创建交易成功，交易编号#${res.data}`);
                        }).catch(err => {
                            console.log(err);
                            if(err.response.code === Exception.INVALID_TRANSACTION){
                                message.error('交易字段值非法，请检查时间戳及金额');
                            }else if(err.response.code === Exception.INVALID_ORGANIZAITON){
                                message.error('金融组织不存在，请检查交易信息');
                            }else if(err.response.code === Exception.VERIFY_FAIL){
                                message.error('验证签名失败');
                            }else{
                                message.error('创建交易失败');
                            }
                        });
                    }
                    setOpen(false);
				});
			}else{
				message.error('当前设备为新设备！请您向系统导入您的私钥！');
			}
        }).catch(err => console.log(err))
    }

    return (
        <Modal
            open = {open}
            title = {(
                <div>
                    {transType === 'deposit'? <DownloadOutlined /> : <UploadOutlined />}
                    <span style={{fontWeight:'bold',marginLeft:'5px'}}>{title}</span>
                </div>
            )}
            cancelText='取消'
            okText='发起交易'
            closable
            centered
            bodyStyle={{padding:'10px'}}
            onCancel={() => setOpen(false)}
            onOk={launchTransHandler}
        >
            <Form
                form = {transForm}
            >
                <Form.Item
                    rules={[{required:true}]}
                    name='to'
                    label='金融组织'
                >
                    <Select
                        options={commercials.map(commercial => ({
                            value:commercial.userId,
                            label:commercial.orgname
                        }))}
                        showSearch
                        allowClear
                        optionFilterProp='label'
                    />
                </Form.Item>

                <Form.Item
                    rules={[{required:true}]}
                    name='amount'
                    label={transType === 'deposit'? '充值金额' : '提现金额'}
                    style={{width:'100%'}}
                >
                    <InputNumber
                        type='number'
                        min={1}
                        value={1}
                        style={{width:'100%'}}
                    />
                </Form.Item>

                <Form.Item
                    // rules={[{required:true}]}
                    name='comment'
                    label='交易留言'
                >
                    <Input.TextArea
                        allowClear
                        showCount
                        autoSize
                        maxLength={500}
                        placeholder='请输入交易留言，可以为空'
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}
