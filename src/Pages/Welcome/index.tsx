import React, { useState, useEffect } from 'react';
import Header from '../../component/Header/index.tsx';
import AffirmModel from '../../component/AffirmModel/index.tsx';
import { Button, Carousel, Form, Input, Radio, Select, message } from 'antd';

import './index.css'
import UserType from '../../Constants/userType.ts';
import { UserInfo } from '@/Interface/User/UserInfo.ts';
import Exception from '@/Constants/exceptions.ts';
import LoginForm from '../../component/LoginForm/index.tsx';
import RegisterForm from '../../component/RegisterForm/index.tsx';

const contentStyle : React.CSSProperties = {
    height: '600px',
    width: '800px', 
    color: 'var(--text-color)',
    backgroundColor :'var(--primary-color)',
    lineHeight: '160px',
    textAlign: 'center',
    borderRadius:'5px',
    // boxShadow:'0 0 10px rgba(0,0,0,.3)'
    // background: '#364d79',
  };

export default function Welcome(props) {
    const { user,history } = props;//token过期时需要重设userInfo

    const [formState,setFromState] = useState<string>('login');
    const [openModel,setOpenModel] = useState<boolean>(false);
    const [registerConfirm,setRegisterConfirm] = useState<boolean>(false);
    const [registerType,setRegisterType] = useState<UserType>(UserType.NORMAL);
    const [userInfo,setUserInfo] = useState<UserInfo>(null);

    //登陆导致userInfo变化，则在这里跳转到Transaction界面
    useEffect(() => {
        if(userInfo){
            history.replace('/transaction/personal',userInfo);
        }
    },[userInfo])

    return (
        <div className='bkg'>
            <div className='welcome-wrapper'>
                <div className='welcome-title'>欢迎来到凭证交易系统</div>
            </div>

            <Header/>

            <div className='content-wrapper'>
                <div className='content'>
                    <div className='carousel-wrapper'>
                        <Carousel autoplay effect='fade' dotPosition='left'>
                            <div className='carousel'>
                                <img className='carousel-image' style={contentStyle} src='/image/F2wat9sbcAEqjoG.jpg' alt='1'/>
                            </div>     
                            <div className='carousel'>
                                <img className='carousel-image' style={contentStyle} src='/image/F4SeDeRXYAAEVn-.jpg' alt='2'/>
                            </div>     
                            <div className='carousel'>
                                <img className='carousel-image' style={contentStyle} src='/image/F4SeDfTXcAAuLpD.jpg' alt='3'/>
                            </div>     
                        </Carousel>
                    </div>

                    <div className='log-regis-wrapper'>
                        <div className='log-regis-bkg'>
                            <div className='log-regis'>
                                <Radio.Group 
                                    defaultValue="login" 
                                    buttonStyle='solid' 
                                    size='middle'
                                    onChange={(e) => {
                                        if(e.target.value === 'login') setFromState('login');
                                        else setFromState('register');
                                    }}
                                    style={{width:'100%',marginBottom:'10px',borderBottom:'1px solid black',paddingBottom:'10px' }}
                                >
                                    <Radio.Button value="login" className={formState === 'login'?'radio-button-active':'radio-button'}>
                                        登录
                                    </Radio.Button>
                                    <Radio.Button value="register" className={formState === 'register'?'radio-button-active':'radio-button'}>
                                        注册
                                    </Radio.Button>
                                </Radio.Group>

                                {
                                    formState === 'login'? 
                                    <LoginForm setUserInfo = {setUserInfo} history = {history}/>:
                                    <RegisterForm 
                                        registerConfirm = {registerConfirm}
                                        setOpenModel = {setOpenModel}
                                    />
                                }

                                {
                                    openModel && 
                                    (
                                        <div>
                                            <AffirmModel
                                                open={openModel} 
                                                setOpen={setOpenModel}
                                                setConfirm={setRegisterConfirm}
                                                title='注册确认'
                                                content='将会在本地生成公私钥，是否确认注册？'
                                            />
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
