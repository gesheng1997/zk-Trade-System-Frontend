import Icon from "@ant-design/icons/lib/components/Icon";

const userSVG = () => (
    <svg t="1690351984972" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3250" width="20" height="20"><path d="M512 483.57376A241.78688 241.78688 0 1 1 512 0a241.78688 241.78688 0 0 1 0 483.57376zM0 967.0656v-28.42624c0-219.9552 178.29888-398.25408 398.21312-398.25408h227.57376c219.9552 0 398.21312 178.29888 398.21312 398.25408v28.42624c0 31.41632-25.47712 56.89344-56.89344 56.89344H56.9344A56.89344 56.89344 0 0 1 0 967.10656z" p-id="3251" fill="#8a8a8a"></path></svg>
)

const UserSVG = (props) => (
    <Icon component = {userSVG} {...props}/>
)

export default UserSVG;