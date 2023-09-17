import Icon from "@ant-design/icons/lib/components/Icon";

const arrowSVG = () => (
    <svg t="1693973839842" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1256" width="200" height="200"><path d="M64 599h564.4L339.9 887.3h244.8L960 512 584.7 136.7H339.9l288.5 288.4H64z" p-id="1257" fill="#015ea4"></path></svg>)

const ArrowSVG = (props) => (
    <Icon component = {arrowSVG} {...props}/>
)

export default ArrowSVG;