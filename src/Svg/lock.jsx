import Icon from "@ant-design/icons/lib/components/Icon";

const lockSVG = () => (
    <svg t="1690351956217" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3078" width="20" height="20"><path d="M818.247 412.327h-45.989v-70.992c0-152.308-123.463-275.779-275.778-275.779S220.698 189.027 220.698 341.335v70.992h-45.987c-25.379 0-45.988 20.566-45.988 45.987v455.407c0 25.428 20.56 45.989 45.988 45.989h643.536c25.377 0 45.988-20.56 45.988-45.989V458.314c-0.045-25.42-20.611-45.987-45.988-45.987z m-137.915 0H312.625v-70.992c0-101.554 82.345-183.853 183.855-183.853 101.51 0 183.853 82.343 183.853 183.853v70.992h-0.001z m0 0" p-id="3079" fill="#8a8a8a"></path></svg>
)

const LockSVG = (props) => (
    <Icon component = {lockSVG} {...props}/>
)

export default LockSVG;