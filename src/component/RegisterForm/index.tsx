import React, { useState, useEffect } from 'react'
import { Button, Carousel, Form, Input, Radio, Select, message } from 'antd';
import UserSVG from '../../Svg/user';
import LockSVG from '../../Svg/lock';
import { AdminRegister, OrgRegister, UserLogin, UserRegister } from '../../Interface/User/UserIdentity';
import uint8ArrayToHex from '../../Utils/Uint8ArrayToHexStr';
import { checkUser, createAdminUser, createOrgUser, createUser } from '../../api/loginRegister';
import { UserInfo } from '../../Interface/User/UserInfo';
import UserType from '../../Constants/userType';
import generateEdKeySign from '../../Utils/generateEdKeySign';
import UserSign from '../../Interface/User/UserSign';
import { decodeUTF8 } from 'tweetnacl-util';
import ExceptionResponse from '../../Interface/ExceptionResponse';
import Exception from '../../Constants/exceptions';
// import * as bip39 from 'bip39';
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/simplified-chinese';
// import { } from '@scure/bip39/wordlists/simplified-chinese';
import './index.css';

export default function RegisterForm(props) {
    const { registerConfirm, setOpenModel } = props;

    const [registerType,setRegisterType] = useState<UserType>(UserType.NORMAL);

    const [registerForm] = Form.useForm();
    // const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        //组件加载时registerConfirm从null变为false也会触发useEffect!所以这个if必须
        if(registerConfirm){
            const userRegister = registerForm.getFieldsValue();
            const passwordRaw:string = userRegister.password;
            //密码转换为16进制字符串形式输入函数生成签名
            const password = uint8ArrayToHex(decodeUTF8(passwordRaw));

            generateEdKeySign(password).then((res:UserSign) => {
                console.log(res);
                const {publicKey,privateKey,signature} = res;

                const registerNormal = {
                    username:userRegister.username,
                    password,
                    publicKey,
                    signature,
                    pemCert:'',
                }
                let id = -1;

                //根据不同注册类型走不同接口
                switch(registerType){
                    case UserType.NORMAL:
                        createUser({...registerNormal}).then(res =>{
                            console.log(res);
                            localStorage.setItem(`private-${res.data}`,privateKey);
                        }).catch((err) => {
                            console.log(err);
                            if(err?.response.code === Exception.ALREADY_EXIST)
                                message.error('用户已存在！')
                            throw new Error('create fail');
                        });
                        break;
                    case UserType.ORGANIZATION:
                        createOrgUser({
                            ...registerNormal,
                            pemCert:userRegister.pemCert,
                            pemSignature:userRegister.pemSignature,
                        }).then(res => {
                            id = res.data;
                            console.log(id);
                            localStorage.set('pk',privateKey);
                        }).catch((err) => {
                            if(err?.response.code === Exception.ALREADY_EXIST)
                                message.error('用户已存在！')
                            else if(err?.response.code === Exception.INVALID_PEMCERT)
                                message.error('证书错误')
                            throw new Error('create fail');
                        });
                        break;
                    case UserType.ADMIN:
                        createAdminUser({
                            ...registerNormal,
                            token:userRegister.token,
                        }).then(res => {
                            id = res.data;
                            console.log(id);
                            localStorage.set('pk',privateKey);
                        }).catch((err) => {
                            if(err?.response.code === Exception.ALREADY_EXIST)
                                message.error('用户已存在！')
                            else if(err?.response.code === Exception.WRONG_TOKEN)
                                message.error('TOKEN不正确！')
                            throw new Error('create fail');
                        });
                        break;
                    default: throw new Error();
                }
                message.success('创建成功！可以登陆！');
            }).catch(err => console.log(err));
        }
    },[registerConfirm]);

    //点击确认注册先运行这个函数校验字段，成功后打开确认框，确认框注册注册后走上面useEffect生成签名公私钥
    const register = () => {
        if(!registerForm.getFieldValue('type')) 
            registerForm.setFieldValue('type',registerType)

        registerForm.validateFields().then(() => {
            setOpenModel(true);
        }).catch(err => {
            console.log(err);
        });
    }

    return (
        <Form 
            name='register' 
            className='form-register'
            form = {registerForm} 
        >
            <Form.Item
                name='type'
                rules={[{required:true}]}
                // className='form-register-item'
            >
                <Select
                    autoFocus
                    options={[
                        {value:UserType.NORMAL,label:'普通用户'},
                        {value:UserType.ORGANIZATION,label:'组织'},
                        {value:UserType.ADMIN,label:'管理员'}
                    ]}
                    defaultValue={UserType.NORMAL}
                    onChange={(value) => setRegisterType(value) }
                />
            </Form.Item>

            <Form.Item
                name='username'
                rules={[{ required:true }]}
            >
                <Input 
                    placeholder='用户名' 
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
                    size='large' 
                    style={{borderRadius:'0px'}}
                    prefix={(<LockSVG style={{borderRadius:'0px',marginRight:'3px'}} />)}
                />
            </Form.Item>

            <Form.Item
                name='repassword'
                rules={[
                    { required:true },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                            }
                            return Promise.reject(new Error('两次输入的密码不匹配'));
                        },
                    }),
                ]}
            >
                <Input.Password
                    placeholder='确认密码' 
                    size='large' 
                    style={{borderRadius:'0px'}}
                    prefix={(<LockSVG style={{borderRadius:'0px',marginRight:'3px'}} />)}
                />
            </Form.Item>

            {
                registerType === UserType.ORGANIZATION?
                (<>
                    <Form.Item
                        name='pemCert'
                        rules={[{ required:true }]}
                    >
                        <Input.TextArea
                            placeholder='组织用户注册请输入PEM证书'
                        />
                    </Form.Item>

                    <Form.Item
                        name='pemSignature'
                        rules={[{ required:true }]}
                    >
                        <Input
                            placeholder='组织用户注册请输入额外ECDSA签名'
                        />
                    </Form.Item>
                </>)
                :''
            }

            {
                registerType === UserType.ADMIN?
                (<Form.Item
                    name='token'
                    rules={[{ required:true }]}
                >
                    <Input
                        placeholder='管理员注册请输入TOKEN'
                    />
                </Form.Item>)
                :''
            }

            <Form.Item>
                <Button 
                    type='primary' 
                    size='large' 
                    style={{ width:'100%',borderRadius:'0px' }}
                    onClick={() => {
                        // // console.log(bip39.wordlists.chinese_simplified);
                        // console.log(wordlist);
                        // const mn = bip39.generateMnemonic(wordlist);
                        // console.log(mn,mn.length,'22',mn[22]);
                        // // bip39.setDefaultWordlist('chinese_simplified')
                        // const ent1 = decodeUTF8('38b14f4e305e7fc4413051b868ef8d6efb914955f9db7a27b159dd3a71546591'.slice(0,32));
                        // const ent2 = decodeUTF8('38b14f4e305e7fc4413051b868ef8d6efb914955f9db7a27b159dd3a71546591'.slice(32,64));
                        // const mnemonic1 = bip39.entropyToMnemonic(ent1,wordlist);
                        // const mnemonic2 = bip39.entropyToMnemonic(ent2,wordlist);

                        // console.log(mnemonic1);
                        // console.log(mnemonic2);
                        // const resume1 = bip39.mnemonicToEntropy(mnemonic1,wordlist);
                        // const resume2 = bip39.mnemonicToEntropy(mnemonic2,wordlist);

                        // console.log(uint8ArrayToHex(resume1) + uint8ArrayToHex(resume2));

                        register()
                    }}
                >
                        注册
                </Button>
            </Form.Item>
        </Form>
    )
}
