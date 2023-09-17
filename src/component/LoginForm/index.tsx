import React from 'react'
import { Button, Carousel, Form, Input, Radio, Select, message } from 'antd';
import UserSVG from '../../Svg/user';
import LockSVG from '../../Svg/lock';
import { UserLogin } from '../../Interface/User/UserIdentity';
import uint8ArrayToHex from '../../Utils/Uint8ArrayToHexStr';
import { checkUser, test } from '../../api/loginRegister';
import { UserInfo } from '../../Interface/User/UserInfo';
import { decodeUTF8 } from 'tweetnacl-util';
import { AxiosError } from 'axios';
import { httpStatus } from '../../Constants/httpStatusCode';
import Exception from '../../Constants/exceptions';
import './index.css';

export default function LoginForm(props) {
    const { setUserInfo, history } = props;
    const [loginForm] = Form.useForm();

    const login = () => {
        //此处关于登录是使用用户名还是手机还是邮箱可以用正则做更细粒度的检查先不做
        //首先submit一下检查字段填写
        loginForm.validateFields().then(() => {
            const userLogin:UserLogin = loginForm.getFieldsValue();
            //密码转为16进制字符串发送
            userLogin.password = uint8ArrayToHex(decodeUTF8(userLogin.password));

            //走登录api
            checkUser(userLogin).then(res => {
                console.log('@',res.data);
                if(res){
                    const user:UserInfo = res.data;
                    localStorage.setItem('token',user?.access_token as string);
                    console.log(localStorage.getItem('token'));
                    setUserInfo(user);
                    message.success('登录成功');

                    history.replace('/transaction/check',user);
                }else{
                    throw new Error('not exist!');
                }
            }).catch((err) => {
                console.log(err);
                if(err.response.code === Exception.WRONG_PASSWORD) 
                    message.error('用户名或密码错误') 
                else if(err.response.code === Exception.NOT_EXIST_USER) 
                    message.error('用户不存在或已注销！');
            })
        }).catch(err => {
            console.log(err);
        });
    }

    return (
        <Form 
            name='login' 
            className='form-login'
            form = {loginForm}
        >
            <Form.Item
                name='username'
                rules={[{ required:true }]}
            >
                <Input 
                    placeholder='用户名' 
                    allowClear
                    size='large' 
                    style={{borderRadius:'0px'}}
                    prefix={(<UserSVG style={{borderRadius:'0px',marginRight:'3px'}} />)}
                />
            </Form.Item>

            <Form.Item
                name='password'
                rules={[{ required:true }]}
            >
                <Input.Password 
                    placeholder='密码'
                    allowClear 
                    size='large' 
                    style={{borderRadius:'0px'}}
                    prefix={(<LockSVG style={{borderRadius:'0px',marginRight:'3px'}} />)}
                />
            </Form.Item>
            <Form.Item>
                <Button 
                    type='primary' 
                    size='large' 
                    style={{width:'100%',borderRadius:'0px' }}
                    onClick={
                        () => { login() }
                    }
                >
                    登录
                </Button>
            </Form.Item>

            {/* <Button
                onClick={() => test().then(res => console.log(res)).catch(err => console.log(err))}
            >测试</Button> */}
        </Form>
    )
}
