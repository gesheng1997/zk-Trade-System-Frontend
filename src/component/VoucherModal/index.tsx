import React, { useEffect, useState } from 'react'
import { Form, Modal, Skeleton, Switch, message } from 'antd'
import { AuditOutlined } from '@ant-design/icons';
import Voucher from '../../Interface/Transaction/Voucher';
import { generateVoucher } from '../../api/transaction';
import { decodeBase64 } from 'tweetnacl-util';
import myEncodeUTF8 from '../../Utils/encodeUTF8';
import './index.css';
import generateTimeFromDate from '../../Utils/generateTimeFromDate';
import { Typography } from 'antd';
const { Paragraph } = Typography;

export default function VoucherModal(props) {
	const { openVoucher, setOpenVoucher, id } = props;

	//返回的凭证为base64字符串格式！
	const [voucherRaw,setVoucherRaw] = useState<string>('');
	const [voucher,setVoucher] = useState<Voucher>();
	const [loading,setLoading] = useState<boolean>(false);
	const [commentEllipsis,setCommentEllipsis] = useState<boolean>(true);
	const [pemEllipsis,setPemEllipsis] = useState<boolean>(true);
	const [fromSigEllipsis,setFromSigEllipsis] = useState<boolean>(true);
	const [pemSigEllipsis,setPemSigEllipsis] = useState<boolean>(true);

	useEffect(() => {
		setLoading(true);
		generateVoucher(id).then(res => {
			setVoucherRaw(res.data);
			console.log(JSON.parse(myEncodeUTF8(decodeBase64(res.data))));

			setVoucher(JSON.parse(myEncodeUTF8(decodeBase64(res.data))));
			setLoading(false);
		}).catch(err => {
			console.log(err);
			message.error('加载失败');
			setLoading(false);
		})
	},[id]);

	// useEffect(() => {
	// 	if(voucher){
	// 		voucherForm.setFieldsValue({
	// 			// transactionId:voucher?.transactionId,
	// 			// fromUsername: voucher?.fromUsername,
	// 			// fromUsername: voucher?.fUsername,
	// 			...voucher,
	// 			timestamp:generateTimeFromDate(new Date(Date.parse(voucher.timestamp))),
	// 		})
	// 	}
	// },[voucher]);

	return (
		<div className='voucher-wrapper'>
			<Skeleton loading={loading} >
				<Modal
					open={openVoucher}
					closable
					destroyOnClose
					maskClosable={false}
					title={
						<div>
							<AuditOutlined />
							<span>生成凭证</span>
						</div>
					}
					okText='下载'
					cancelText='取消'
					centered
					onCancel={() => {
						setOpenVoucher(false);
					}}
					onOk={() => {
						const blob = new Blob([voucherRaw],{type:'text/plain'});
						const a = document.createElement('a');
						a.style.display = 'none';
						a.download = `transaction#${id}.voucher`; // 文件名
						a.href = URL.createObjectURL(blob);
			 
						// 将 a 元素添加到 DOM
						document.body.appendChild(a);
			 
						// 模拟点击下载
						a.click();
			 
						// 清理
						document.body.removeChild(a);
						URL.revokeObjectURL(a.href);
						setOpenVoucher(false);
					}}
					bodyStyle={{
						backgroundColor:'#FFE3C2',
						padding:'0px 20px 10px 20px',
						borderRadius:'10px',
						overflow:'auto'
					}}
					width={800}
					className='voucher-modal'
				>
					<div className='voucher-form'>
						<div className='voucher-title-wrapper'
							style={{
								display:'flex',
								justifyContent:'center',
								alignItems:'center',
								marginBottom:'0px',
								width:'100%'
							}}
						>
							<h2 className='voucher-title'>{`#${id}交易凭证`}</h2>
						</div>

						<div className='transacitonId-wrapper'
							style={{
								display:'flex',
								width:'100%',
								marginBottom:'5px'
							}}
						>
							<span style={{fontWeight:'bold'}}>交易编号：</span>
							<div
								style={{
									borderBottom:'1px black solid',
									width:'83%',
									// textAlign:'center'
								}}
							>
								{voucher?.transactionId}
							</div>
						</div>

						<div className='participants-name-wrapper'
							style={{
								display:'flex',
								justifyContent:'space-between',
								width:'100%',
								marginBottom:'5px'
							}}
						>
							<div className='voucher-item-wrapper'
								style={{
									display:'flex',
									width:'50%'
								}}
							>
								<span style={{fontWeight:'bold'}}>发起方：</span>
								<div
									style={{
										borderBottom:'1px black solid',
										width:'70%',
										textAlign:'center'
									}}
								> 
									{voucher?.fromUsername} 
								</div>
							</div>

							<div className='voucher-item-wrapper'
								style={{
									display:'flex',
									width:'50%'
								}}								
							>
								<span style={{fontWeight:'bold'}}>接收方：</span>
								<div
									style={{
										borderBottom:'1px black solid',
										width:'70%',
										textAlign:'center'
									}}
								> 
									{voucher?.toUsername} 
								</div>
							</div>
						</div>

						<div className='time-amount-wrapper'
							style={{
								display:'flex',
								justifyContent:'space-between',
								width:'100%',
								marginBottom:'5px'
							}}
						>
							<div className='voucher-item-wrapper'
								style={{
									display:'flex',
									width:'50%'
								}}
							>
								<span style={{fontWeight:'bold'}}>交易发起时间：</span>
								<div
									style={{
										borderBottom:'1px black solid',
										width:'64%',
										textAlign:'center'
									}}
								> 
									{voucher? generateTimeFromDate(new Date(Date.parse(voucher.timestamp))):''} 
								</div>
							</div>

							<div className='voucher-item-wrapper'
								style={{
									display:'flex',
									width:'59%'
								}}
							>
								<span style={{fontWeight:'bold'}}>交易金额：</span>
								<div
									style={{
										borderBottom:'1px black solid',
										width:'69%',
										textAlign:'center'
									}}
								>  
									{voucher?.amount} 
								</div>
							</div>
						</div>

						<div className='voucher-comment-wrapper'>
							<span style={{fontWeight:'bold'}}>交易留言：</span>
							<Switch 
								checkedChildren='收起' 
								unCheckedChildren='展开'
								size='small'
								onClick={checked => {
									checked?setCommentEllipsis(false):
											setCommentEllipsis(true)
								}}
							/>
							<Paragraph ellipsis={commentEllipsis}>
								{voucher?.comment}
							</Paragraph>
						</div>

						<div className='voucher-item-wrapper'
							style={{
								display:'flex',
								width:'100%',
								marginBottom:'5px'
							}}
						>
							<span style={{fontWeight:'bold'}}>交易摘要：</span>
							<div
								style={{
									borderBottom:'1px black solid',
									width:'83%',
									// textAlign:'center'
								}}
							> 
								{voucher?.digest} 
							</div>
						</div>

						<div className='voucher-item-wrapper'
							style={{
								display:'flex',
								width:'100%',
								marginBottom:'5px'
							}}
						>
							<span style={{fontWeight:'bold'}}>发起方公钥：</span>
							<div
								style={{
									borderBottom:'1px black solid',
									width:'81%',
									// textAlign:'center'
								}}
							> 
								{voucher?.fromPublicKey} 
							</div>
						</div>

						<div className='voucher-comment-wrapper'>
							<span style={{fontWeight:'bold'}}>认证方证书：</span>
							<Switch 
								checkedChildren='收起' 
								unCheckedChildren='展开'
								size='small'
								onClick={checked => {
									checked?setPemEllipsis(false):
											setPemEllipsis(true)
								}}
							/>
							<Paragraph ellipsis={pemEllipsis}>
								{voucher?.serverPemCert}
							</Paragraph>
						</div>

						<div className='signature-wrapper'>
							<div className='voucher-signature-item-wrapper'>
								<span style={{fontWeight:'bold'}}>发起方签名：</span>
								<Switch 
									checkedChildren='收起' 
									unCheckedChildren='展开'
									size='small'
									onClick={checked => {
										checked?setFromSigEllipsis(false):
												setFromSigEllipsis(true)
									}}
								/>
								<Paragraph ellipsis={fromSigEllipsis}> 
									{voucher?.fromSignature} 
								</Paragraph>
							</div>

							<div className='voucher-signature-item-wrapper'>
								<span style={{fontWeight:'bold'}}>认证方签名：</span>
								<Switch 
									checkedChildren='收起' 
									unCheckedChildren='展开'
									size='small'
									onClick={checked => {
										checked?setPemSigEllipsis(false):
												setPemSigEllipsis(true)
									}}
								/>
								<Paragraph ellipsis={pemSigEllipsis}> 
									{voucher?.serverSignature} 
								</Paragraph>
							</div>
						</div>
					</div>
				</Modal>
			</Skeleton>
		</div>
	)
}
