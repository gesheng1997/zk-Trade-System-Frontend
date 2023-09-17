import { MenuFoldOutlined, MenuUnfoldOutlined, UploadOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Avatar, Button, Drawer, Layout, Menu, message, theme } from 'antd'
import Sider from 'antd/es/layout/Sider';
import { Content, Header } from 'antd/es/layout/layout';
import React, { useEffect, useState } from 'react'
import './index.css';
import MenuItem from '../../Constants/transMenuItem';
import { NavLink, Switch, Route, Redirect } from 'react-router-dom'
import Personal from './Personal';
import CreateTrans from './CreateTrans';
import CheckTrans from './CheckTrans';
import { UserInfo } from '../../Interface/User/UserInfo';
import Exception from '../../Constants/exceptions';
import { checkToken } from '../../api/loginRegister';
import TransactionDto from '../../Interface/Transaction/Transaction';
// import { type } from './../../Interface/User/UserIdentity';

export default function Transaction(props) {
    console.log(props);
    let user  = props.location.state;

    const [collapsed,setCollapsed] = useState<boolean>(false);
    const [selectedItem,setSelectedItem] = useState<MenuItem>(MenuItem.CHECK);
    const [userInfo,setUserInfo] = useState<UserInfo>(user);
    /*     
        在父组件Transaction中存储查询交易表格中获取的所有交易的状态
        防止三个子组件路由切换导致每次切回交易查询页面都要重新请求获取所有交易信息
    */    
    const [transactions,setTransactions] = useState<TransactionDto[]>([]);

    // useEffect(() => {
    //     checkToken().then(() => {

    //     }).catch(err =>{
    //     if(err.response.code === Exception.WITHOUT_TOKEN)
    //         message.error('用户未登录');
    //     else if(err.response.code === Exception.INVALID_TOKEN)
    //         message.error('登录已过期或非法，请重新登录')
    //     props.history.replace('/welcome');
    //     })
    // },[])


    useEffect(() => {
        console.log('%@',userInfo);
        console.log(selectedItem);
        user = userInfo;
    },[userInfo])

    const {
        token: { colorBgContainer },
      } = theme.useToken();

    return (
        <Layout 
            className='transaction-wrapper'
            style={{
                height:'100%'
            }}
        >
            <Sider
                className='transaction-sider' 
                trigger={null} 
                collapsible 
                collapsed={collapsed}
                collapsedWidth={0}
                width='300'
            >
                <div className='system-title-wrapper'>
                    <div className='system-title'>
                        零知识凭证交易系统
                    </div>
                </div>

                <div className='brief-info-wrapper'>
                    <div className='brief-info'>
                        <div className='brief-info-avatar'>
                            {/* <UserOutlined style={{fontSize:'30px'}}/> */}
                            <Avatar 
                                size='large' 
                                shape='square' 
                                icon={<UserOutlined />} 
                                src = {userInfo?.avatar}
                                draggable
                            />
                        </div>
                        <div className='brief-info-content'>
                            <div className='brief-info-username'>
                                用户名：{userInfo?.username}
                            </div>
                            <div className='brief-info-balance'>
                                余额：{userInfo?.balance}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className='sider-menu'
                >
                    <div className="menu-item-wrapper">
                        <NavLink                         
                                className='menu-item'
                                activeClassName='active-item'
                                to={{
                                    pathname:'/transaction/check',
                                    state:user
                                }}
                                onClick={() => setSelectedItem(MenuItem.CHECK)}
                            >
                                <VideoCameraOutlined className='menu-icon'/>
                                <div className='item-title'>
                                    交易查询       
                                </div>
                        </NavLink>
                        <NavLink                         
                            className='menu-item'
                            activeClassName='active-item'
                            to={{
                                pathname:'/transaction/create',
                                state:user
                            }}
                            onClick={() => setSelectedItem(MenuItem.CREATE)}
                        >
                            <UploadOutlined className='menu-icon'/>
                            <div className='item-title'>
                                交易发起        
                            </div>
                        </NavLink>
                        <NavLink 
                            className='menu-item'
                            activeClassName='active-item'
                            to={{
                                pathname:'/transaction/personal',
                                state:user
                            }}
                            onClick={() => setSelectedItem(MenuItem.PERSONAL)}
                        >
                            <UserOutlined className='menu-icon'/>
                            <div className='item-title'>
                                我的账户
                            </div>
                        </NavLink>
                    </div>

                    <div className='logout-wrapper'>
                        <Button 
                            danger type="primary" 
                            className='logout-btn'
                            onClick={() => {
                                localStorage.removeItem('token');
                                props.history.replace('/welcome');
                            }}
                        >
                            退出登陆
                        </Button>
                    </div>
                </div>

            </Sider>
                
            <Layout>
                <Header 
                    className='transaction-header'
                    style={{ padding: 0, background: colorBgContainer }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                    }}
                    />
                </Header>
                <Content
                    style={{
                    margin: '24px 16px',
                    padding: 24,
                    minHeight: 280,
                    background: colorBgContainer,
                    }}
                >
                    <Switch>
                        <Route path="/transaction/check" render = {(props) => (
                            <CheckTrans {...props} 
                                setTransactions = {setTransactions} 
                                setUser={setUserInfo}
                                transactions = {transactions}
                            />
                        )}/>
                        <Route path="/transaction/create" render = {(props) => (
                            <CreateTrans {...props} setUser={setUserInfo} user = {userInfo}/>
                        )}/>
                        <Route path="/transaction/personal" render = {(props) => (
                            <Personal {...props} setUser={setUserInfo} user = {userInfo}/>
                        )}/>
                        <Redirect to='/transaction'/>
                    </Switch>
                </Content>
            </Layout>
        </Layout>
    );
}
