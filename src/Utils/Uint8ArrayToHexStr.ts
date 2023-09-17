const uint8ArrayToHex = (uint8:Uint8Array):string => {
    return Array.from(uint8)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

export default uint8ArrayToHex;