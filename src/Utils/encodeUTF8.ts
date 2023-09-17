export default function myEncodeUTF8(arr:Uint8Array) {
    let s:string[] = [];
    for (let i = 0; i < arr.length; i++) s.push(String.fromCharCode(arr[i]));
    return decodeURIComponent(s.join(''));
};