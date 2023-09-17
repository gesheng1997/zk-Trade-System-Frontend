import  UserSign  from '@/Interface/User/UserSign';
import * as ed from '@noble/ed25519'
import { decodeUTF8 } from 'tweetnacl-util';
import uint8ArrayToHex from './Uint8ArrayToHexStr';

//输入为16进制字符串形式的密码,一定要保证！不然这里ed.signAsync函数报错
const generateEdKeySign = async (password:string):Promise<UserSign> => {
    const privateKeyUint8 = ed.utils.randomPrivateKey();
    // const message = decodeUTF8('I love wenjun!');
    const publicKeyUint8 = await ed.getPublicKeyAsync(privateKeyUint8);
    // const extPublicKey = await ed.utils.getExtendedPublicKeyAsync(privateKey);
    const signatureUint8 = await ed.signAsync(password, privateKeyUint8);

    const privateKey = uint8ArrayToHex(privateKeyUint8);
    const publicKey = uint8ArrayToHex(publicKeyUint8);
    const signature = uint8ArrayToHex(signatureUint8);

    return {publicKey,privateKey,signature};
}

export default generateEdKeySign;