//定义当前用户在交易中的身份的枚举类型
//主要用在表格组件中显示所有交易？用户作为发起者或接收者的交易？

enum UserCharacter{
    SENDER=0,
    RECEIVER,
}

export default UserCharacter