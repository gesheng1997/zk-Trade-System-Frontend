import { sign } from "tweetnacl";
import { decodeUTF8, decodeBase64, encodeBase64 } from 'tweetnacl-util';
import encodeUTF8 from '../../Utils/encodeUTF8'

const { publicKey, secretKey } = sign.keyPair();

export const testFunc = () => {
    console.log(encodeBase64(publicKey),'\n',encodeBase64(secretKey));

    const message = decodeUTF8('I love wenjun!');

    let msgUint8 = Uint8Array.from(message)  ;

    const signature = sign.detached(msgUint8, secretKey);//nacl依赖生成的Ed25519签名会把消息也附带在后面！
    //实际的签名实际上还是64Byte，因此需要手动去除后面的内容，比如此处消息为14个字符即14Byte，故此处signature为78Byte

    function buffer2bits(buff) {
        const res:number[] = [];
        for (let i = 0; i < buff.length; i++) {
            for (let j = 0; j < 8; j++) {
                if ((buff[i] >> j) & 1) {
                    res.push(1);
                } else {
                    res.push(0);
                }
            }
        }
        return res;
    }

    console.log(publicKey,'\n',secretKey);
    console.log(signature);
    console.log('public_key:',JSON.stringify(buffer2bits(publicKey)));
    console.log('message:',JSON.stringify(buffer2bits(message)));
    console.log('R8:',JSON.stringify(buffer2bits(signature.subarray(0,32))));
    console.log('s:',JSON.stringify(buffer2bits(signature.subarray(32,64))));
    // console.log(encodeUTF8(signature.subarray(0,63)));
    // console.log(encodeUTF8(signature));
};
