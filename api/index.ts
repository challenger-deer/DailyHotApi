// Vercel serverless 入口。
//
// 为什么不直接 import "../src/app.js" / "../dist/app.js"？
//   Vercel @vercel/node 不会跟随 import 链到 api/ 外的源文件，runtime
//   会报 Cannot find module。
//
// 当前方案：在 vercel.json 的 buildCommand 里跑 esbuild 把 src/app.tsx
// 和所有依赖 bundle 到同目录的 api/_app.js（单文件，含静态 import 的
// 全部 56 个路由）。本文件引用同目录的 ./_app.js，Vercel esbuild 能
// 直接处理。
//
// 下面再包一层 try/catch 把任何 import-time / handler-time 错误写到响应
// 里 —— 之前几次 500 都看不到堆栈，这一层能让失败原因直接出现在浏览器
// 响应里，方便诊断。
import { Hono } from "hono";

const wrapper = new Hono();
let bundleLoadError: Error | null = null;
let bundleApp: Hono | null = null;

try {
  const mod = await import("./_app.js");
  bundleApp = mod.default;
} catch (e) {
  bundleLoadError = e instanceof Error ? e : new Error(String(e));
}

if (bundleLoadError || !bundleApp) {
  // Bundle 加载失败 —— 把错误和堆栈写到响应里
  wrapper.all("*", (c) =>
    c.text(
      `Failed to load _app.js bundle.\n` +
        `Error: ${bundleLoadError?.message ?? "unknown"}\n\n` +
        `Stack:\n${bundleLoadError?.stack ?? "(no stack)"}`,
      500,
    ),
  );
} else {
  // 正常路径：把请求转给 bundled Hono app，handler 抛错也捕获
  wrapper.all("*", async (c) => {
    try {
      return await bundleApp!.fetch(c.req.raw, c.env);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      return c.text(`Handler error: ${err.message}\n\n${err.stack ?? ""}`, 500);
    }
  });
}

export default wrapper;
