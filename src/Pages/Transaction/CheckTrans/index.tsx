/* eslint-disable jsx-a11y/anchor-is-valid */
// import TransactionDto from '@/Interface/Transaction/Transaction';
import Exception from '../../../Constants/exceptions';
import { checkToken, getUserInfo } from '../../../api/loginRegister';
import { Button, Drawer, Popover, Radio, Spin, Steps, Switch, Table, Tag, message } from 'antd';
import React, { useEffect, useState } from 'react'
import { findAllMyTrans } from '../../../api/transaction';
import UserCharacter from '../../../Constants/userCharacter';
import TransactionType from '../../../Constants/transactionType';
import TransactionState from '../../../Constants/transactionState';
import TransactionDisplayState from '../../../Constants/transactionDisplayState';
import RefreshSVG from './../../../Svg/refresh';
import TransactionDto from '../../../Interface/Transaction/Transaction';
import ColumnGroup from 'antd/es/table/ColumnGroup';
import Column from 'antd/es/table/Column';
import { AuditOutlined, CheckCircleOutlined, CloseCircleOutlined, FileSearchOutlined, LoadingOutlined, RocketOutlined, SmileOutlined, SolutionOutlined, SwapOutlined, SyncOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import generateTimeFromDate from '../../../Utils/generateTimeFromDate';
import './index.css';
import { Typography } from 'antd';
import VoucherModal from '../../../component/VoucherModal/index';

const { Paragraph } = Typography;

export default function CheckTrans(props) {
	const user = props.location.state;
	const {setUserInfo, setTransactions, transactions} = props;
	let refreshTimer : NodeJS.Timeout;//用于承接刷新计时器的变量
	// console.log(props);

	//分别缓存成功失败和进行中的交易
	const [transactionData,setTransactionData] = useState<TransactionDto[]>(transactions);
	//表格加载中状态
	const [transTableSpin,setTransTableSpin] = useState<boolean>(false);
	//表格选择显示作为发起者还是接收者还是显示所有
	// const [myCharacter,setMyCharacter] = useState<UserCharacter>(UserCharacter.SENDER);
	//表格选择显示所有交易类型还是普通交易、特殊交易
	// const [selectTransType,setSelectTransType] = useState<TransactionType>(TransactionType.NORMAL);
	//表格选择显示成功交易？失败交易？进行中交易？
	const [selectTransState,setSelectTransState] = useState<TransactionDisplayState>(TransactionDisplayState.ACTIVE);
	//显示交易详情
	const [displayDetail,setDisplayDetail] = useState<boolean>(false);
	//保存当前欲查看详情的交易记录
	const [selectedTrans,setSelectedTrans] = useState<TransactionDto>(transactionData[0]);
	//在显式详情中是否展开显示交易留言
	const [ellipsisComment,setEllipsisComment] = useState<boolean>(true);
	/* 	
		用于控制能否进行刷新操作的状态,初始状态为true。也只有在该状态为true的情况下，
		点击刷新按钮才能进行刷新操作，否则将会弹出警告信息告诉用户一段时间内只能刷新一次
		因此这个状态相当于定义了一个临界资源，信号量为{0,1} 为刷新操作上锁
 	*/	
	const [refreashable,setRefreshable] = useState<boolean>(true);
	//打开凭证预览model
	const [openVoucher,setOpenVoucher] = useState<boolean>(false);

	useEffect(() => {
		// console.log(localStorage.getItem('token'));
		setTransTableSpin(true);
        checkToken().then(() => {
			if(transactions.length === 0){
				findAllMyTrans(user.id).then(res => {
					// console.log(1)
					const results:TransactionDto[] = res.data;

					const dataSource = results.map(trans => ({
						key:trans.id + '',
						...trans,
						//对于充值交易金额为负值，将其改为正值显示
						amount:trans.amount < 0 ?-trans.amount:trans.amount,
					}))
					setTransactionData(dataSource);
					setTransactions(results);
					setTransTableSpin(false);

					getUserInfo(user.id).then(res => {
						setUserInfo(res.data);
					}).catch(err => console.log);
				}).catch(err => console.log);
			}else{
				const dataSource = transactions.map(trans => ({
					key:trans.id + '',
					...trans,
				}))
				setTransactionData(dataSource);
				setTransTableSpin(false);
			}
        }).catch(err =>{
			if(err.response.code === Exception.WITHOUT_TOKEN)
				message.error('用户未登录');
			else if(err.response.code === Exception.INVALID_TOKEN)
				message.error('登录已过期或非法，请重新登录')
			// localStorage.removeItem('token');
			setTransTableSpin(false);
			props.history.replace('/welcome');
        })
    },[])

	// const activeTransSource = activeTransactions.map(trans => ({
	// 	key:trans.id + '',
	// 	...trans,
	// }))
	// const successTransSource = successTransactions.map(trans => ({
	// 	key:trans.id + '',
	// 	...trans,
	// }))
	// const failTransSource = failTransactions.map(trans => ({
	// 	key:trans.id + '',
	// 	...trans,
	// }))

	const getDataSource = () => {
		let dataSource;
		switch(selectTransState){
			case TransactionDisplayState.ACTIVE:
				dataSource = transactionData.filter(trans => 
					trans.state !== TransactionState.FAILED && 
					trans.state !== TransactionState.SETTLED)
					.map(trans => {
						const initTime = generateTimeFromDate(new Date(Date.parse(trans.initTime)));
						const gmt_modified = generateTimeFromDate(new Date(Date.parse(trans.gmt_modified)));

						return {
							key:trans.id + '',
							...trans,
							initTime,
							gmt_modified,
						}
					});
				return dataSource;
			case TransactionDisplayState.SUCCESS:
				dataSource = transactionData.filter(trans => 
					trans.state === TransactionState.SETTLED)
					.map(trans => {
						const initTime = generateTimeFromDate(new Date(Date.parse(trans.initTime)));
						const gmt_modified = generateTimeFromDate(new Date(Date.parse(trans.gmt_modified)));

						return {
							key:trans.id + '',
							...trans,
							initTime,
							gmt_modified,
						}
					});
				return dataSource;
			case TransactionDisplayState.FAIL:
				dataSource = transactionData.filter(trans => 
					trans.state  === TransactionState.FAILED)
					.map(trans => {
						const initTime = generateTimeFromDate(new Date(Date.parse(trans.initTime)));
						const gmt_modified = generateTimeFromDate(new Date(Date.parse(trans.gmt_modified)));

						return {
							key:trans.id + '',
							...trans,
							initTime,
							gmt_modified,
						}
					});
				return dataSource;
			default: return [];
		}
	}

	const refreshHandler = () => {
		if(refreashable){
			setRefreshable(false);//锁住临界区，即暂时不允许刷新
			
			refreshTimer = setTimeout(() => {
				//计时器设定为1min，1min后回调函数才会释放临界区
				setRefreshable(true);
				//取消定时器
				clearTimeout(refreshTimer);
			},6000);

			//重新获取刷新数据
			setTransTableSpin(true);
			findAllMyTrans(user.id).then(res => {
				// console.log(1)
				const results:TransactionDto[] = res.data;

				const dataSource = results.map(trans => ({
					key:trans.id + '',
					...trans,
				}))
				setTransactionData(dataSource);
				setTransactions(results);
				setTransTableSpin(false);

				getUserInfo(user.id).then(res => {
					setUserInfo(res.data);
				}).catch(err => console.log);
			}).catch(err => console.log);
		}else{
			message.warning('您的操作过于频繁！1min内只能刷新一次！')
		}
	}
	

	return (
		<div className='check-trans-wrapper'>
			<div className='control-bar-wrapper'>
				<div className='switch-mode-wrapper'>
					<div className='switch-mode-title'>交易状态：</div>
					<Radio.Group 
						defaultValue={TransactionDisplayState.ACTIVE} 
						buttonStyle='solid'
						onChange={(e) => setSelectTransState(e.target.value)}
					>
						<Radio.Button value={TransactionDisplayState.ACTIVE}>进行中</Radio.Button>
						<Radio.Button value={TransactionDisplayState.FAIL}>已失败</Radio.Button>
						<Radio.Button value={TransactionDisplayState.SUCCESS}>已完成</Radio.Button>
					</Radio.Group>
				</div>

				<div className='refresh-wrapper'>
					<Popover content='刷新交易状态'>
						<Button 
							className='refresh-btn' 
							type='primary'
							onClick={refreshHandler}
						>
							<RefreshSVG/>
						</Button>
					</Popover>
				</div>
			</div>

			<div className='table-wrapper'>
				{/* <Spin
					spinning = {transTableSpin}
				> */}
					<Table
						// bordered
						size='middle'
						loading = {transTableSpin}
						scroll={{
							scrollToFirstRowOnChange:true,
							y:540
						}}
						sticky
						dataSource={ getDataSource() }
					>
						<ColumnGroup
							title='参与方'
							align='center'
						>
							<Column 
								title='发起方' 
								dataIndex='fromUsername' 
								key='fromUsername'
								align='center'
							/>
							<Column 
								title='接收方' 
								dataIndex='toUsername' 
								key='toUsername'
								align='center'
							/>
						</ColumnGroup>

						<Column 
							title='金额' 
							dataIndex='amount' 
							key='amount'
							align='center'
						/>
						<Column 
							title='发起时间' 
							dataIndex='initTime' 
							key='initTime' 
							align='center'
							width={200}
						/>
						<Column 
							title='交易类型' 
							dataIndex='type' 
							render={ text => {
								if(text === TransactionType.NORMAL) 
									return (<Tag color='#108ee9'>普通</Tag>)
								else if(text === TransactionType.DEPOSIT) 
									return (<Tag color='#f50'>充值</Tag>)
								else 
									return (<Tag color='#87d068'>提现</Tag>)
							}}
							align='center'
						/>
						<Column 
							title='交易状态' 
							dataIndex='state' 
							render={ text => {
								switch(text){
									case TransactionState.LAUNCHED: 
										return (<Tag icon={<RocketOutlined />} color='#108ee9'>已发起</Tag>)
									case TransactionState.QUEUEING: 
										return (<Tag icon={<SwapOutlined spin/>} color='#7F18C4'>排队中...</Tag>)
									case TransactionState.VERIFYING: 
										return (<Tag icon={<LoadingOutlined spin />} color = '#2db7f5'>验证中...</Tag>)
									case TransactionState.VERIFIED: 
										return (<Tag icon={<CheckCircleOutlined />} color='#D7B818'>验证成功</Tag>)
									case TransactionState.SETTLED: 
										return (<Tag icon={<CheckCircleOutlined />} color="#87d068">已完成</Tag>)
									case TransactionState.FAILED: 
										return (<Tag icon={<CloseCircleOutlined />} color="#f50">失败</Tag>)
									default: return ''
								}
							}}
							align='center'
						/>

						<Column 
							title='操作'
							key='operation'
							align='center'
							width={200}
							render={(text,record:TransactionDto) => (
								<div>
									<a 
										onClick={() => {
											console.log(record)
											setSelectedTrans(record);
											setDisplayDetail(true);
										}}
										style={{marginRight:'10px'}}
									>
										<FileSearchOutlined />
										查看详情
									</a>
									{
										record.state === TransactionState.SETTLED ?
										(<a
											onClick={() => {
												setSelectedTrans(record);
												setOpenVoucher(true);
											}}
										>
											<AuditOutlined />
												生成凭证
										</a>) : ''
									}
								</div>
							)}
						/>
					</Table>
				{/* </Spin> */}
			</div>

			<Drawer
				open = {displayDetail}
				onClose={() => setDisplayDetail(false)}
				width={600}
				maskClosable
				title={`#${selectedTrans?.id} 交易细节`}
				className='drawer-wrapper'
			>
				<Steps
					className='steps-wrapper'
					size='small'
				  	direction='vertical'
					progressDot
				  	current={
						selectedTrans?.state !== TransactionState.FAILED?
						selectedTrans?.state:
						TransactionState.VERIFYING
					}
					status={selectedTrans?.state === TransactionState.FAILED?'error':'process'}
					items={[
						{
							title: '发起交易',
							status: selectedTrans?.state === TransactionState.LAUNCHED?'process':'finish',
							description: '交易发起，准备进入等待验证队列'
							// icon: <UserOutlined />,
						},
						{
							title: '排队中...',
							status: selectedTrans?.state < TransactionState.QUEUEING?'wait':
								selectedTrans?.state === TransactionState.QUEUEING?'process':'finish',
							description: '排队等待验证中...'
							// icon: <SolutionOutlined />,
						},
						{
							title: '验证中...',
							status: selectedTrans?.state < TransactionState.VERIFYING?'wait':
							selectedTrans?.state === TransactionState.VERIFYING?'process':'finish',
							description: '交易正在和其他交易一起进行打包验证...'
							// icon: <LoadingOutlined />,
						},
						{
							title: '验证通过',
							status: selectedTrans?.state < TransactionState.VERIFIED?'wait':
							selectedTrans?.state === TransactionState.VERIFIED?'process':'finish',
							description: '交易已验证通过，正在更新账户状态'
							// icon: <LoadingOutlined />,
						},
						{
							title: '完成',
							status: selectedTrans?.state < TransactionState.SETTLED?'wait':'finish',
							description:'交易完成'
							// icon: <SmileOutlined />,
						},
						{
							title:'失败',
							status: selectedTrans?.state === TransactionState.FAILED?'error':'wait'
						}
					]}
				/>

				<div className='basic-detail-wrapper'>
					<div className='trans-type'>
						<span style={{color:'#1f1f1f'}}>交易类型：</span>
						<span style={{color:'#8c8c8c'}}>{
								(() => {
									if(selectedTrans?.type === TransactionType.NORMAL) 
										return '普通'
									else if(selectedTrans?.type === TransactionType.DEPOSIT) 
										return '充值'
									else 
										return '提现'
								})()	
							}
						</span>
					</div>

					<div className='basic-detail-time-wrapper'>
						<div className='trans-create-time'>
							<span style={{color:'#1f1f1f'}}>交易发起时间：</span>
							<span style={{color:'#8c8c8c'}}>{
									selectedTrans?.initTime
								}
							</span>
						</div>
						<div className='trans-final-modified-time'>
							<span style={{color:'#1f1f1f'}}>交易最后更新时间：</span>
							<span style={{color:'#8c8c8c'}}>{selectedTrans?.gmt_modified}</span>
						</div>
					</div>
				</div>

				<div className='participants-detail-wrapper'>
					<div className='from-detail'>
						<div className='from-detail-title'>发方详情</div>
						<div className='from-username'>
							<span style={{color:'#1f1f1f'}}>用户名：</span>
							<span style={{color:'#8c8c8c'}}>{selectedTrans?.fromUsername}</span>
						</div>
						<div className='from-publicKey'>
							<span style={{color:'#1f1f1f'}}>{'公钥：\n'}</span>
							<span style={{color:'#8c8c8c'}}>{selectedTrans?.fromUserPublicKey.slice(0,32) + '\n'}</span>
							<span style={{color:'#8c8c8c'}}>{selectedTrans?.fromUserPublicKey.slice(32,64)}</span>
						</div>
						<div className='from-phone'>
							<span style={{color:'#1f1f1f'}}>电话：</span>
							<span style={{color:'#8c8c8c'}}>{selectedTrans?.fromUserPhone}</span>
						</div>
						<div className='from-username'>
							<span style={{color:'#1f1f1f'}}>邮箱：</span>
							<span style={{color:'#8c8c8c'}}>{selectedTrans?.fromUserEmail}</span>
						</div>
					</div>

					<div className='to-detail'>
						<div className='to-detail-title'>收方详情</div>
						<div className='to-username'>
							<span style={{color:'#1f1f1f'}}>用户名：</span>
							<span style={{color:'#8c8c8c'}}>{selectedTrans?.toUsername}</span>
						</div>
						<div className='to-publicKey'>
							<span style={{color:'#1f1f1f'}}>{'公钥：\n'}</span>
							<span style={{color:'#8c8c8c'}}>{selectedTrans?.toUserPublicKey.slice(0,32) + '\n'}</span>
							<span style={{color:'#8c8c8c'}}>{selectedTrans?.toUserPublicKey.slice(32,64)}</span>
						</div>
						<div className='to-phone'>
							<span style={{color:'#1f1f1f'}}>电话：</span>
							<span style={{color:'#8c8c8c'}}>{selectedTrans?.toUserPhone}</span>
						</div>
						<div className='to-username'>
							<span style={{color:'#1f1f1f'}}>邮箱：</span>
							<span style={{color:'#8c8c8c'}}>{selectedTrans?.toUserEmail}</span>
						</div>
					</div>
				</div>

				<div className='comment-detail-wrapper'>
					<div className='comment-content'>
						<div>
							<span style={{color:'#1f1f1f'}}>交易留言：</span>
							<Switch 
								checkedChildren='展开' 
								unCheckedChildren='收起'
								size='small'
								onClick={checked => {
									checked?setEllipsisComment(false):setEllipsisComment(true)
								}}
							/>
						</div>
						<Paragraph ellipsis={ellipsisComment}>
							{selectedTrans?.comment}				
							{/* Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas ipsa quod ut? Minus repudiandae, id quae labore vitae quo eos vel odit! Error amet, voluptate ipsa et esse, adipisci maiores quas tempore iure quis, vero laudantium sequi! Omnis consectetur numquam hic fugit. Quidem quas ut tenetur, nesciunt illo, debitis tempora iste, ad libero vitae quasi ipsum ab laborum natus facilis dicta quaerat officia quod nisi assumenda obcaecati ducimus sequi neque tempore! Ab hic repellat eius odio earum! Eius ullam cupiditate deleniti iure molestiae fugit nihil asperiores. Unde, provident ducimus quam officiis fuga rerum facere fugiat animi eligendi, accusantium iusto commodi corrupti, soluta ipsam et temporibus nesciunt. Ex nesciunt illum neque voluptatibus? Autem veritatis numquam repellendus doloremque suscipit nihil dolor facere iste, sit tenetur a eum atque neque veniam, expedita nulla ducimus beatae quos aliquam qui maiores natus odit esse dolorem. Natus at voluptate, totam quas temporibus sapiente aliquam perferendis possimus voluptas perspiciatis inventore laboriosam iste earum veritatis officiis reprehenderit ut quidem unde? Beatae eaque vero natus consequatur, placeat iure nulla. Dolor veritatis reiciendis dignissimos consectetur dolore quasi? Voluptatem voluptatum ab sunt facilis laudantium, corporis alias consectetur odio vel qui libero reprehenderit voluptatibus cumque voluptate animi dignissimos molestiae expedita vitae tempore veritatis ducimus ipsam delectus atque. Tenetur accusamus quos eveniet ad minima rerum incidunt assumenda quisquam odio officiis ducimus, nulla totam voluptate eum et? Saepe, consequatur autem. Magni eaque voluptas dolorum fugiat totam harum, eveniet accusantium doloribus, odio consequatur quia quo repellendus inventore expedita explicabo reiciendis? Veritatis quisquam quae et consequatur, tenetur necessitatibus similique libero corrupti reprehenderit fugiat explicabo debitis aperiam dolorem amet culpa, tempora harum impedit facere consectetur ullam vel distinctio odio vitae quaerat? Odit similique amet perspiciatis porro fugiat cumque, dolor consequatur vel minima soluta officiis corporis omnis rem ab quasi hic nam saepe sequi voluptatibus possimus beatae eum qui. Autem, sed! Suscipit esse expedita eaque neque quos, exercitationem aspernatur error provident odio ipsa blanditiis, veniam ducimus nihil omnis sint accusantium minus cupiditate facilis sunt temporibus ab incidunt, unde labore? Quae laboriosam, obcaecati, numquam totam sit saepe excepturi perferendis rem facilis corrupti iure illum! Dolorum quaerat velit at expedita tempora mollitia dolor nulla sit ad asperiores ea placeat facere ipsa earum in, provident modi vero, praesentium iusto eveniet deleniti architecto. Sit eius ex culpa expedita quasi illo consequatur eos ducimus quas maiores debitis quibusdam, iste similique commodi mollitia. Ullam rerum libero sit iste sed quasi itaque quod quibusdam accusamus omnis at consequuntur ad pariatur eos voluptatibus ipsa ab eligendi labore explicabo, in tempora. Atque repellat unde quis nesciunt ullam minus consectetur. Minus consequuntur porro voluptates omnis distinctio voluptatibus sunt quae hic, voluptate quaerat. Minima totam officia eius fuga dignissimos maxime obcaecati impedit. Placeat, nostrum a. Voluptatem animi accusantium vitae, corporis beatae molestiae tempore dicta. Debitis quia deserunt fuga asperiores aperiam perferendis consectetur mollitia impedit eligendi reiciendis similique error laudantium molestiae quaerat aliquid nostrum, quas eveniet! Et quasi perferendis aspernatur quis quas voluptatum. Cumque voluptate, totam eveniet minima laborum veritatis facilis, eaque explicabo quas consectetur illo excepturi itaque inventore assumenda ipsam voluptas qui neque natus non. Ullam molestiae iusto doloribus eveniet dolore dolores excepturi cumque ipsum accusantium sint nemo repellat omnis alias quaerat, esse vel nihil? Blanditiis assumenda omnis, necessitatibus, accusamus eaque quo ipsa fuga beatae enim adipisci, a nihil perspiciatis quae modi culpa? Placeat culpa consequatur temporibus quo, labore ipsum quaerat laudantium accusantium ex nostrum mollitia pariatur commodi modi suscipit aut repellat veniam! Alias quibusdam doloremque officiis nam magni minima eaque assumenda eius ratione sequi ipsum, accusantium est! Veniam repellendus laudantium atque voluptas ratione ipsa! Enim dolor obcaecati nulla esse id? Eum cupiditate pariatur totam, numquam quia sed impedit iure, quisquam obcaecati facere aut iusto qui nulla esse at. Quo optio vero perspiciatis ullam dolorem similique repellat ipsam mollitia quas quis ex necessitatibus repudiandae corrupti labore, dolorum tempore, dolores delectus, illum qui distinctio dicta reprehenderit dolore quae? Repellat excepturi placeat cumque aperiam voluptatibus saepe magni, eveniet veniam aspernatur vitae tempora architecto doloremque magnam, deleniti officiis suscipit! Debitis quia iure commodi eum, quae dicta fuga dolorum nesciunt odit expedita beatae, quis sed minima itaque iusto! Quia asperiores enim reiciendis, minima dolores sint repellendus, est velit modi, illum nam incidunt id autem iusto error! Ratione vero maxime dicta, obcaecati inventore atque consequatur sed temporibus expedita tenetur minus nesciunt. Amet vero tenetur libero accusantium voluptatibus itaque illum ullam. Consequuntur amet eaque aperiam. Possimus facere, officia beatae id recusandae sed? Cumque quasi ex at libero illo, aliquam officia quis optio quidem laudantium sit provident fugiat atque a nam exercitationem doloribus? Qui aut repudiandae amet pariatur iure debitis, nam blanditiis provident dolor quas vel eligendi, inventore veniam ipsa in cumque a, architecto distinctio eos culpa explicabo rem dignissimos corporis commodi. Alias perferendis veniam quod ratione obcaecati vitae laboriosam, vero voluptatibus iusto! Adipisci doloribus quasi aliquam libero, ipsam officia rerum tempora quaerat. Dicta saepe odit, sit quae natus voluptatem fuga harum omnis recusandae qui quasi nihil velit optio pariatur! Nobis minus voluptas facere maxime sequi tenetur doloribus autem neque soluta incidunt rerum deleniti modi cupiditate eaque tempora sit, fugiat sint quidem a perferendis veritatis corporis. Iusto porro veritatis, aspernatur sit eum doloremque saepe voluptatem tempore hic quae incidunt laboriosam neque quod quia. Sed incidunt est voluptas reprehenderit dolores quia? Quo maiores sapiente voluptate delectus quas maxime consequatur iste asperiores pariatur? Natus a iure quisquam accusamus veniam cupiditate sed velit dolorem suscipit adipisci distinctio, mollitia eum error voluptatem nulla omnis fugit hic eius iste? Sunt provident corrupti quidem veniam minima similique soluta autem pariatur, nobis, deleniti id, suscipit natus a sit ad? Aspernatur praesentium debitis expedita. Voluptas sequi quisquam cupiditate atque asperiores obcaecati accusamus ipsam sunt delectus ipsa! Amet distinctio non aspernatur ipsa. Qui alias obcaecati ea voluptatem nam voluptatibus corporis magni fugiat porro, recusandae perspiciatis? Porro repudiandae nesciunt omnis ad, unde saepe aspernatur dolore illum sequi quos adipisci quae ut iure maiores totam hic dicta iusto rem molestiae nobis qui accusamus earum, voluptates veritatis. Cum nulla vitae eveniet? Totam autem quibusdam ut et porro tempore corporis voluptate libero quia temporibus inventore nihil iusto mollitia, eius neque vitae debitis cumque. Blanditiis eos consectetur voluptatem fugit illo, autem, illum repellendus architecto ab officia, totam dicta nobis. Minima quidem odit ea nobis excepturi maiores magnam iste animi. Commodi ex hic velit doloribus? Eaque fuga, dolorem nam magni, molestiae laboriosam beatae qui aliquam architecto, sit neque voluptas. Qui reiciendis deserunt suscipit cupiditate itaque adipisci a assumenda. Aspernatur, architecto, asperiores aut aliquid excepturi exercitationem non id ipsa repellat mollitia nihil officiis sed autem dolorem labore laudantium perferendis modi voluptate magnam. Molestias nulla cumque suscipit corrupti alias adipisci error numquam temporibus quam doloribus corporis ab minima dicta architecto incidunt harum doloremque nesciunt laboriosam pariatur provident nostrum, commodi quisquam officiis enim! Nostrum suscipit, autem commodi neque consequatur saepe provident voluptas, tempora aperiam eaque adipisci quis facere, nulla assumenda velit reiciendis officiis? */}
						</Paragraph>
					</div>
				</div>
			</Drawer>

			{   
				/* 				
					这里解释一下为什么可以将openVoucher传入组件以控制打开关闭的情况下
					还要用一个判断去控制组件的挂载，这是因为如果不做控制，那么VoucherModal
					会在整个组件加载的同时一起加载，而那个时候selectedTrans状态还未加载
					因此将会传入组件一个undefined，导致VoucherModal组件中的useEffect中的ajax
					入参为undefined报错！
				*/				
				openVoucher? (
					<VoucherModal 
						openVoucher={openVoucher} 
						setOpenVoucher = {setOpenVoucher}
						id={selectedTrans?.id}
					/>
				):''
			}

		</div>
	)
}
