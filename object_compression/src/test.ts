const data = [1, 4.1, 0.2, 3.14];

const buffer = Buffer.from(new Float64Array(data).buffer);
const numberArray1 = [...Array(buffer.byteLength / 8)].map((_, i) => buffer.readDoubleLE(i * 8));

const arrayBuffer = Float64Array.from(data);
const numberArray2 = Array.from(data)

console.log(arrayBuffer, numberArray2);