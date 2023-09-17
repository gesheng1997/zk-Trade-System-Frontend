import React from 'react'
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
// import './index.css'

export default function AffirmModel(props) {
    const { open, setOpen, setConfirm, title, content } = props; 

    return (
        <Modal
            open={open}
            destroyOnClose={true}
            maskClosable={true}
            title={(
                <div>
                    <ExclamationCircleOutlined style={{marginRight:'10px',color:'orange',fontSize:'20px'}}/>
                    <span style={{fontSize:'20px'}}>{title}</span>
                </div> 
            )}
            okText='确认'
            cancelText='取消'
            centered
            width={(() => {
                switch(title){
                    case '注册确认':
                        return 450;
                    case '发起确认':
                        return 650;
                    default: return 500;
                }
            })()}
            onCancel={() => {
                setOpen(false);
            }}
            onOk={() => {
                setConfirm(true);
                setOpen(false);
            }}
            // style={{transition:'all .2s'}}
            wrapClassName='model-wrapper'
            bodyStyle={{
                height:(() => {
                    switch(title){
                        case '注册确认':
                            return '30px';
                        case '发起确认':
                            return '120px';
                        default: return '50px';
                    }
                })(),
                width:'100%',
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
                fontSize:'16px',
                margin:(() => {
                    switch(title){
                        case '注册确认':
                            return '0';
                        case '发起确认':
                            return '10px 0 50px 0';
                        default: return '0';
                    }
                })()
            }}
        >
            <div>{content}</div>
        </Modal>
    )
}
