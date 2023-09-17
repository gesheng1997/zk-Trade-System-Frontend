/* 
    该方法封装了通过Date类型的变量生成： 
        xxxx 年 xx 月 xx 日 时:分:秒
    时间格式的过程
*/

const generateTimeFromDate = (date:Date):string => {
    // console.log(date);
    const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1 + ''
    const dateNum = date.getDate() < 10 ? '0' + date.getDate() : date.getDate() + ''
    const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours() + ''
    const minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() + ''
    const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds() + ''

    return  date.getFullYear() + '年' + 
        month + '月' + 
        dateNum + '日 ' + 
        hours + ':' + 
        minute + ':' + 
        seconds;
}

export default generateTimeFromDate;