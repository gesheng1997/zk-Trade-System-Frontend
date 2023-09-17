import * as ed from '@noble/ed25519';
import { decodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util';

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

function modulus(num, p) {
	return ((num % p) + p) % p;
}

function chunkBigInt(n, mod = BigInt(2 ** 51)):BigInt[] {
    if (!n) return [0n];
    if(n === 1n) return [1n,0n,0n];
    let arr:BigInt[] = [];
    while (n) {
        arr.push(BigInt(modulus(n, mod)));
        n /= mod;
    }
    return arr;
}

export const testFunc2 = async () => {
    const privateKey = ed.utils.randomPrivateKey();
    const message = decodeUTF8('I love wenjun!');
    const publicKey = await ed.getPublicKeyAsync(privateKey);

    const extPublicKey = await ed.utils.getExtendedPublicKeyAsync(privateKey);

    const signature = await ed.signAsync(message, privateKey);
    const isValid = await ed.verifyAsync(signature, message, publicKey);

    console.log('sk:',privateKey);   
    console.log('pk:',publicKey);   
    console.log('base64pk:',encodeBase64(publicKey));   
    console.log('msg:',message);   
    console.log('extpk-byFromHex:',ed.ExtendedPoint.fromHex(publicKey));
    console.log('extpk-bygetExtendedPk:',extPublicKey);
    console.log('extR:',ed.ExtendedPoint.fromHex(signature.subarray(0,32)));   
    console.log('sig:',signature);   
    console.log('isvalid:',isValid);

    console.log('public_key:',JSON.stringify(buffer2bits(publicKey)));
    console.log('message:',JSON.stringify(buffer2bits(message)));
    console.log('R8:',JSON.stringify(buffer2bits(signature.subarray(0,32))));
    console.log('s:',JSON.stringify(buffer2bits(signature.subarray(32,64))));

    const extA = ed.ExtendedPoint.fromHex(publicKey);
    const extACoord = [extA.ex,extA.ey,extA.ez,extA.et];
    const extR = ed.ExtendedPoint.fromHex(signature.subarray(0,32));
    const extRCoord = [extR.ex,extR.ey,extR.ez,extR.et];

    let extACoordChunk:BigInt[][] = [];
    let extRCoordChunk:BigInt[][] = [];

    for(let elem of extACoord){
        extACoordChunk.push(chunkBigInt(elem,BigInt(2**85)));
    }

    for(let elem of extRCoord){
        extRCoordChunk.push(chunkBigInt(elem,BigInt(2**85)));
    }

    console.log('extACoordChunk',extACoordChunk);
    console.log('extRCoordChunk',extRCoordChunk);
}