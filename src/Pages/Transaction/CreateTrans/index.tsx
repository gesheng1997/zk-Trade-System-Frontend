import UserSearch from '../../../Interface/User/UserSearch';
import TransactionType from '../../../Constants/transactionType';
import { Button, Collapse, Form, Input, InputNumber, Select, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { checkToken, findAllUsers } from '../../../api/loginRegister';
import './index.css';
import ArrowSVG from './../../../Svg/arrow';
import Exception from '../../../Constants/exceptions';
import AffirmModel from '../../../component/AffirmModel';
import { KeyOutlined, UserOutlined } from '@ant-design/icons';
// import sha256 from 'crypto-js/sha256';
import * as ed from '@noble/ed25519';
import CryptoJS from 'crypto-js';
import generateTimeFromDate from '../../../Utils/generateTimeFromDate';
import uint8ArrayToHex from './../../../Utils/Uint8ArrayToHexStr';
import { CreateTransaction } from '../../../Interface/Transaction/CreateTransaction';
import { createNormalTrans } from '../../../api/transaction';

export default function CreateTrans(props) {
	// const user = props.location.state;
	const user = props.user;
	// console.log(user);
	const [ transForm ] = Form.useForm(); 

	// const [transType,setTransType] = useState<TransactionType>(TransactionType.NORMAL);
	const [toId,setToId] = useState<number>(-1);
	const [users,setUsers] = useState<UserSearch[]>([]);
	// const [commercialOrgs,setCommercialOrgs] = useState<{id:number,orgId:number,orgname:string}[]>([]);
	const [openModel,setOpenModel] = useState<boolean>(false);
	const [launchConfirm,setLaunchConfirm] = useState<boolean>(false);
	// const [ellipsis,setEllipsis] = useState<boolean>(false);

	useEffect(() => {
		// const today = new Date();
		// const year = today.getFullYear();
		// const month = today.getMonth() + 1 < 10? '0'+(today.getMonth() + 1) :today.getMonth() + 1
		// const day = today.getDate() < 10? '0'+ today.getDate():today.getDate()

		checkToken().then(() => {
			transForm.setFieldsValue({
				from:user.username,
				fromPublicKey:user.publicKey,
				fromPhone:user.phone?user.phone:'',
				fromEmail:user.email?user.email:'',
				date:generateTimeFromDate(new Date()).slice(0,11),
			});
	
			findAllUsers().then(res => {
				const data = res.data.filter(elem => elem.id !== user.id);
				setUsers(data);
			}).catch(err => {
				console.log(err)
			})
		}).catch(err => {
			if(err.response.code === Exception.WITHOUT_TOKEN)
				message.error('用户未登录');
			else if(err.response.code === Exception.INVALID_TOKEN)
				message.error('登录已过期或非法，请重新登录')
			// localStorage.removeItem('token');
			props.history.replace('/welcome');
		})
	},[])

	useEffect(() => {
		const target = users.find(item => item.id === toId);

		transForm.setFieldsValue({
			toPublicKey:target?.publicKey,
			toPhone:target?.phone ? target.phone : '',
			toEmail:target?.email ? target?.email : ''
		});
	},[toId]);

	useEffect(() => {
		if(launchConfirm){
			const transactionInfo = {
				from:user.id,
				to:transForm.getFieldValue('to'),
				amount:transForm.getFieldValue('amount'),
				timestamp:new Date(),
				comment:transForm.getFieldValue('comment'),
			}

			//CryptoJs中SHA256函数需要用这种方式转为16进制字符串
			const digest = CryptoJS.SHA256(JSON.stringify(transactionInfo)).toString(CryptoJS.enc.Hex);
			/* 
				此处去localStorage中取用私钥，私钥在其中键为username-privateKey
				如果没有，则报错！如果有才会进行签名操作 
			*/
			const privateKey = localStorage.getItem(`private-${user.id}`);

			if(privateKey){
				ed.signAsync(digest, privateKey).then(res => {
					const signature = uint8ArrayToHex(res);
					
					const transactionData:CreateTransaction = {
						...transactionInfo,
						digest,
						signature,
					}

					console.log(transactionData);
					createNormalTrans(transactionData).then(res => {
						console.log('创建的交易id：',res.data);
						message.success(`创建交易成功，交易编号#${res.data}`);
					}).catch(err => {
						console.log(err);
						if(err.response.code === Exception.INVALID_TRANSACTION){
							message.error('交易字段值非法，请检查时间戳及金额');
						}else if(err.response.code === Exception.NOT_ENOUGH_BALANCE){
							message.error('余额不足，请充值');
						}else if(err.response.code === Exception.VERIFY_FAIL){
							message.error('验证签名失败');
						}else{
							message.error('创建交易失败');
						}
					});
				});
			}else{
				message.error('当前设备为新设备！请您向系统导入您的私钥！');
			}

			//充值发送交易确认状态，等待下次发送交易
			setLaunchConfirm(false);
		}
	},[launchConfirm]);

	return (
		<div className='create-trans-wrapper'>
			{/* <Select 
				className='trans-type-selector'
				options={[
					{value:TransactionType.NORMAL,label:'普通交易'},
					{value:TransactionType.DEPOSIT,label:''},
				]}
			/> */}
			<Form
				className='create-trans-form'
				form = {transForm}
				scrollToFirstError
			>
				<div className='trans-participants'>
					<div className='trans-from-info'>
						<div className='participant-title'>发起方信息</div>
						<div className='form-item'>
							<div className='form-item-addon item-addon'>发起方名称</div>
							<Form.Item
								name='from'
								className='form-item-contetnt'
								style={{width:'100%'}}
							>
								<Input
									readOnly		
									// addonBefore={(<div className='form-item-addon'>发起方</div>)}
								/>
							</Form.Item>
						</div>

						<div className='form-item'>
							<div className='form-item-addon item-addon'>发起方公钥</div>
							<Form.Item
								name='fromPublicKey'
								className='form-item-contetnt'
								style={{width:'100%'}}
							>
								<Input
									readOnly		
									// addonBefore={(<div className='form-item-addon'>发起方公钥</div>)}	
								/>
							</Form.Item>
						</div>

						<div className='form-item'>
							<div className='form-item-addon item-addon'>发起方电话</div>
							<Form.Item
								name='fromPhone'
								className='form-item-contetnt'
								style={{width:'100%'}}
							>
								<Input
									readOnly		
									// addonBefore={(<div className='form-item-addon'>发起方电话</div>)}
								/>
							</Form.Item>
						</div>

						<div className='form-item'>
							<div className='form-item-addon item-addon'>发起方邮箱</div>
							<Form.Item
								name='fromEmail'
								className='form-item-contetnt'
								style={{width:'100%'}}
							>
								<Input
									readOnly
									// addonBefore={(<div className='form-item-addon'>发起方邮箱</div>)}		
								/>
							</Form.Item>
						</div>
					</div>

					<div className='amount-wrapper'>
						<ArrowSVG className="arrow-icon"/>
						<div className='amount-content'>
							{/* <div className='amount-title'>交易金额</div> */}
							<Form.Item
								name='amount'
								className='amount-item'
								rules={[{required:true}]}
							>
								<InputNumber
									type='number'
									addonBefore={(<div className='amount-title'>交易金额</div>)}
									min={0}
									value={0}
								/>
							</Form.Item>
						</div>
					</div>

					<div className='trans-to-info'>
						<div className='participant-title'>接收方信息</div>
						<div className='form-item'>
							<div className='form-item-addon item-addon'>接收方名称</div>
							<Form.Item
								name='to'
								rules={[{ required:true }]}
								className='form-item-contetnt'
								style={{width:'100%'}}
							>
								<Select
									showSearch
									allowClear
									optionFilterProp='label'
									options={users.map(user => ({
										value:user.id,
										label:user.username
									}))}
									onSelect={value => {
										setToId(value)
									}}
								/>
							</Form.Item>
						</div>

						<div className='form-item'>
							<div className='form-item-addon item-addon'>接收方公钥</div>
							<Form.Item
								name='toPublicKey'
								className='form-item-contetnt'
								style={{width:'100%'}}
							>
								<Input
									readOnly	
									// addonBefore={(<div className='form-item-addon'>接收方公钥</div>)}		
								/>
							</Form.Item>
						</div>

						<div className='form-item'>
							<div className='form-item-addon item-addon'>接收方电话</div>
							<Form.Item
								name='toPhone'
								className='form-item-contetnt'
								style={{width:'100%'}}
							>
								<Input
									readOnly
									// addonBefore={(<div className='form-item-addon'>接收方电话</div>)}			
								/>
							</Form.Item>
						</div>

						<div className='form-item'>
							<div className='form-item-addon item-addon'>接收方邮箱</div>
							<Form.Item
								name='toEmail'
								className='form-item-contetnt'
								style={{width:'100%'}}
							>
								<Input
									readOnly	
									// addonBefore={(<div className='form-item-addon'>接收方邮箱</div>)}		
								/>
							</Form.Item>
						</div>
					</div>
				</div>

				<div className='trans-appendix'>
					<div className='date-wrapper'>
						{/* <div className='date-title'>交易日期</div> */}
						<Form.Item
							name='date'
						>
							<Input
								readOnly
								addonBefore={(<div className='appendix-addon'>交易日期</div>)}
							/>
						</Form.Item>
					</div>

					<div className='comment-wrapper'>
						<div className='comment-title appendix'>交易留言</div>
						<Form.Item
							name='comment'
							className='comment-content'
						>
							<Input.TextArea
								allowClear
								showCount
								autoSize
								maxLength={500}
								placeholder='请输入交易留言，可以为空'
							/>
						</Form.Item>
					</div>

					{/* <div className='digest-wrapper'>
						<div className='comment-title'>交易摘要</div>
						<Form.Item
							name='digest'
						>
							<Input
								readOnly
							/>
						</Form.Item>
					</div> */}
				</div>

				<div className='launch-btn-wrapper'>
					<Button 
						type='primary' 
						className='clear-btn'
						onClick={() => {
							transForm.setFieldsValue({
								to:null,
								toPublicKey:'',
								toPhone:'',
								toEmail:'',
								amount:0,
								comment:'',
							})
						}}
					>
						清空输入
					</Button>

					<Button 
						type='primary' 
						danger 
						className='launch-btn'
						onClick={() => {
							transForm.validateFields().then(res => {
								setOpenModel(true);
							}).catch(err => {
								console.log(err);
							})
						}}
					>
						发起交易
					</Button>
				</div>
			</Form>


			{
				openModel && 
				(
					<div>
						<AffirmModel
							open={openModel} 
							setOpen={setOpenModel}
							setConfirm={setLaunchConfirm}
							title='发起确认'
							content={
								(
									<div className='launch-trans-model-content'>
										<div>将由您的账户向:</div>
										<div 
											className='launch-trans-model-content-toinfo'
											style={{display:'flex',flexDirection:'column',width:'100%',alignItems:'flex-end'}}
										>
											<div style={{border:'2px solid rgba(0,0,0,.1)',borderRadius:'5px', padding:'20px'}}>
												<div>
													<span style={{fontWeight:'bold'}}><UserOutlined /> 用户名: </span>
														{
															(() => {
																const id = transForm.getFieldValue('to');
																return users.filter(user => user.id === id)[0].username;
															})()
														}
												</div>

												<div style={{ marginTop:'5px' }}>
													<span style={{fontWeight:'bold'}}>
														<KeyOutlined /> 公钥地址:
													</span>
													<div>{transForm.getFieldValue('toPublicKey')}</div>
												</div>
											</div>
										</div>

										<div>发起金额为<span style={{fontWeight:'bold'}}> {transForm.getFieldValue('amount')} </span>的转账交易。是否确认？</div>
									</div>
								)
							}
						/>
					</div>
				)
			}
		</div>
	)
}
