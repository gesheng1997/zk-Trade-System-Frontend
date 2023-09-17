//配置有关当前后端代码是在windows环境下还是在LINUX虚拟机下，保证不会出现魔法数字

import envInfo from '../Constants/envInfo';

const BACK_ENV = envInfo.WINDOWS;

export default BACK_ENV;