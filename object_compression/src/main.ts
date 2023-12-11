import { setTimeout } from "timers/promises";
import * as zlib from "zlib";

function getMemoryUsageMB(): NodeJS.MemoryUsage {
    const memoryUsage = process.memoryUsage();
    for (const key in memoryUsage) {
        memoryUsage[key as keyof NodeJS.MemoryUsage] =
            Math.round((memoryUsage[key as keyof NodeJS.MemoryUsage] / 1024 / 1024) * 100) / 100;
    }

    return memoryUsage;
}

function test(description: string, func: { generate: () => any[], compress: Function, decompress: Function }): void {
    if (!global.gc) {
        throw new Error("gc が無効になってます。");
    }

    global.gc();
    global.gc();
    global.gc();
    {
        const startRssMb = getMemoryUsageMB().rss;
        const startMs = new Date().getTime();

        let data = func.compress(func.generate());
        global.gc();
        global.gc();
        global.gc();

        const endRssMb = getMemoryUsageMB().rss;
        const endMs = new Date().getTime();
        console.log(`${description}, ${(endRssMb - startRssMb).toFixed(2)}, ${(endMs - startMs).toFixed(2)}`);

        data = null;
        global.gc();
        global.gc();
        global.gc();
    }

    const raw = func.generate();
    const decompressed = func.decompress(func.compress(raw));
    if (JSON.stringify(decompressed) !== JSON.stringify(raw)) {
        throw new Error(`解凍後データが壊れてます, \n${JSON.stringify(raw)}\n${JSON.stringify(decompressed)}`)
    }
}

function generateData(recodes: number): number[] {
    return [...Array(recodes)].map(_ => {
        return Math.random();
    })
}

(
    async () => {
        const recodes = 3_530_000; // 10_000 * 353 * 10;
        // const recodes = 10
        const doNothing = (data: any) => data;
        const tests: [string, { generate: () => any, compress: Function, decompress: Function }][] = [
            ["無圧縮", { generate: () => generateData(recodes), compress: doNothing, decompress: doNothing }],
            ["JSON zlib.deflateSync", { generate: () => generateData(recodes), compress: (data: any) => zlib.deflateSync(JSON.stringify(data)), decompress: (data: any) => JSON.parse(zlib.inflateSync(data).toString()) }],
            ["Buffer", { generate: () => generateData(recodes), compress: (data: number[]) => Buffer.from(new Float64Array(data).buffer), decompress: (data: Buffer): number[] => [...Array(data.byteLength / 8)].map((_, i) => data.readDoubleLE(i * 8)) }],
            ["Buffer zlib.deflateSync", {
                generate: () => generateData(recodes), compress: (data: number[]) => zlib.deflateSync(Buffer.from(new Float64Array(data).buffer)), decompress: (data: Buffer): number[] => {
                    const inflated = zlib.inflateSync(data);
                    return [...Array(inflated.byteLength / 8)].map((_, i) => inflated.readDoubleLE(i * 8))
                }
            }],
        ]
        console.log("説明, memoryMb, timeMs")

        for (const t of tests) {
            test(t[0], t[1]);
            await setTimeout(5000);
        }
    }
)();

