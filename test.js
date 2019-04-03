const buf1 = Buffer.allocUnsafe(26);
const buf2 = Buffer.allocUnsafe(26).fill('!');

for (let i = 0; i < 26; i++) {
  // 97 是 'a' 的十进制 ASCII 值。
  buf1[i] = i + 97;
}

// 拷贝 `buf1` 中第 16 至 19 字节偏移量的数据到 `buf2` 第 8 字节偏移量开始。
buf1.copy(buf2, 8, 16, 20);

console.log(buf2.toString('ascii', 0, 25));
console.log(buf1.toString('ascii', 0, 25));