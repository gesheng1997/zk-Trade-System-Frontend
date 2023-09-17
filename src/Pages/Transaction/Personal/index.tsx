import { checkToken, updateUserInfo } from '../../../api/loginRegister';
import { UpdateUserInfo, UserInfo } from '../../../Interface/User/UserInfo';
import { Button, DatePicker, Form, Image, Input, message } from 'antd';
import React, { useEffect, useState } from 'react'
import './index.css'
import Exception from '../../../Constants/exceptions';
import generateTimeFromDate from '../../../Utils/generateTimeFromDate';
import dayjs from 'dayjs';
import SpecialTransModal from '../../../component/SpecialTransModal';

export default function Personal(props) {
    // console.log(props);
    // const user = props.location.state;
    const user = props.user;
    const setUser = props.setUser;
    const [personalForm] = Form.useForm();

    const [modifyMod,setModifyMod] = useState<boolean>(false);
    const [userInfo,setUserInfo] = useState<UserInfo>(user);
    const [depositOpen,setDepositOpen] = useState<boolean>(false);
    const [withdrawOpen,setWithdrawOpen] = useState<boolean>(false);

    useEffect(() => {
        checkToken().then(() => {

        }).catch(err =>{
            if(err.response.code === Exception.WITHOUT_TOKEN)
                message.error('用户未登录');
            else if(err.response.code === Exception.INVALID_TOKEN)
                message.error('登录已过期或非法，请重新登录')
            // localStorage.removeItem('token');
            props.history.replace('/welcome');
        })
    },[])

    //写法实际上是有bug的，时间比较紧因此先这样，可以实现更新
    useEffect(() => {
        console.log(1);
        setUserInfo(user);
    },[user])

    const updateInfo = () => {
        const updateData:UpdateUserInfo = {
            username:personalForm.getFieldValue('username'),
            phone:personalForm.getFieldValue('phone'),
            email:personalForm.getFieldValue('email'),
            birthday:dayjs(personalForm.getFieldValue('birthday')).toDate(),
            address:personalForm.getFieldValue('address'),
        }

        if(userInfo?.id){
            updateUserInfo(userInfo?.id,updateData).then(res => {
                res.data.birthday = dayjs(res.data.birthday).toDate();
                // console.log(generateTimeFromDate(dayjs(res.data.birthday).toDate()).slice(0,11));
                setUserInfo(res.data);
                setUser(res.data);
            }).catch(err => console.log)
        }
        setModifyMod(false);
    }

    return (
        <div className='personal-info'>
            <div className='avatar-balance-wrapper'>
                <Image 
                    className='user-avatar' 
                    src={userInfo?.avatar} 
                    alt={`${userInfo?.username}-avatar`} 
                    preview={{
                        scaleStep:0.25
                    }}
                />

                <div className='balance-info'>  
                    <span>余额：{userInfo?.balance}</span>
                    <div className='balance-operation'>
                        <Button 
                            className='deposite-btn' 
                            // type='primary'
                            onClick={() => setDepositOpen(true)}
                        >
                            充值
                        </Button>
                        <Button 
                            className='withdraw-btn' 
                            // type='primary' 
                            danger
                            onClick={() => setWithdrawOpen(true)}
                        >
                            提现
                        </Button>
                    </div>
                </div>
            </div>

            <Form
                form={personalForm}
                className='personal-info-form'
            >
                <div className='form-item'>
                    <div className='form-item-addon item-addon'>用户名</div>
                    <Form.Item
                        name='username'
                        className='form-item-content'
                    >
                        <Input 
                            defaultValue={(() => {console.log(userInfo?.username); return userInfo?.username;})()}
                            // addonBefore='用户名'
                            // size='large'
                            readOnly={modifyMod?false:true}
                        />
                    </Form.Item>
                </div>


                <div className='form-item'>
                    <div className='form-item-addon item-addon'>创建时间</div>
                    <Form.Item
                        name='gmt_create'
                        className='form-item-content'
                    >
                        <Input 
                            // addonBefore='创建时间'
                            // size='large'
                            defaultValue={userInfo?generateTimeFromDate(new Date(Date.parse(userInfo?.gmt_create))):''}
                            disabled={modifyMod?true:false}//在修改模式下显式提醒用户该字段不可修改
                            readOnly
                        />
                    </Form.Item>
                </div>

                <div className='form-item'>
                    <div className='form-item-addon item-addon'>公钥</div>
                    <Form.Item
                        name='publicKey'
                        className='form-item-content'
                    >
                        <Input
                            // addonBefore='公钥'
                            // size='large' 
                            defaultValue={userInfo?.publicKey}
                            disabled={modifyMod?true:false}//在修改模式下显式提醒用户该字段不可修改
                            readOnly
                        />
                    </Form.Item>
                </div>

                <div className='form-item'>
                    <div className='form-item-addon item-addon'>手机号码</div>
                    <Form.Item
                        name='phone'
                        className='form-item-content'
                    >
                        <Input
                            // addonBefore='手机号'
                            // size='large' 
                            defaultValue={userInfo?.phone}
                            readOnly={modifyMod?false:true}
                        />
                    </Form.Item>
                </div>

                <div className='form-item'>
                    <div className='form-item-addon item-addon'>邮箱地址</div>
                    <Form.Item
                        name='email'
                        className='form-item-wrapper'
                    >
                        <Input
                            // addonBefore='邮箱' 
                            // size='large'
                            defaultValue={userInfo?.email}
                            readOnly={modifyMod?false:true}
                        />
                    </Form.Item>
                </div>

                <div className='form-item'>
                    <div className='form-item-addon item-addon'>生日</div>
                    <Form.Item
                        name='birthday'
                        className='form-content'
                    >
                        {
                            modifyMod?
                            <DatePicker 
                                defaultValue={
                                    userInfo?.birthday?
                                    dayjs(userInfo?.birthday):undefined
                                }
                            />:
                            <Input
                                // addonBefore='生日'
                                // size='large' 
                                defaultValue={userInfo?.birthday?generateTimeFromDate(dayjs(userInfo.birthday).toDate()).slice(0,11):''}
                                readOnly={modifyMod?false:true}
                            />
                        }

                    </Form.Item>
                </div>

                <div className='form-item'>
                    <div className='form-item-addon item-addon'>地址信息</div>
                    <Form.Item
                        name='address'
                        className='form-content'
                    >
                        <Input
                            // addonBefore='地址' 
                            // size='large'
                            defaultValue={userInfo?.address}
                            readOnly={modifyMod?false:true}
                        />
                    </Form.Item>
                </div>

                {
                    !modifyMod?(
                        <Form.Item
                            name='modify-btn'
                            // style={{width:'100%',display:'flex',justifyContent:'flex-end'}}
                            className='modify-btn'
                        >
                            <Button type='primary' onClick={() => setModifyMod(true)}>修改信息</Button>
                        </Form.Item>
                    ):(
                        <div className='modify-mode-btn'>
                            <Form.Item
                                name='update-btn'
                            >
                                <Button type='primary' danger onClick={() => updateInfo()}>更新信息</Button>
                            </Form.Item>

                            <Button 
                                type='primary' 
                                onClick={() => {
                                    //取消则重置所有表中字段为当前userInfo中的内容
                                    if(userInfo){
                                        personalForm.setFieldsValue({
                                            ...userInfo,
                                            birthday:userInfo?.birthday?generateTimeFromDate(dayjs(userInfo.birthday).toDate()).slice(0,11):''
                                        })
                                    }
                                    setModifyMod(false); 
                                }}
                                className='cancel-btn'
                            >
                                取消
                            </Button>
                        </div>

                    )
                }
            </Form>

            {/* 充值交易发起 */}
            {
                depositOpen?
                <SpecialTransModal
                    title = '充值交易发起'
                    userInfo = {userInfo}
                    transType = 'deposit'
                    open = {depositOpen}
                    setOpen = {setDepositOpen}
                /> : 
                
                withdrawOpen? 
                <SpecialTransModal
                    title = '提现交易发起'
                    userInfo = {userInfo}
                    transType = 'withdraw'
                    open = {withdrawOpen}
                    setOpen = {setWithdrawOpen}
                />:
                ''
            }
        </div>
    )
}
