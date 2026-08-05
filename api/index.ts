// Vercel serverless 入口：引用 esbuild 预打包的 Hono app。
//
// 为什么不直接 import "../src/app.js"？
//   Vercel @vercel/node 不会跟随 import 链到 api/ 外的源文件，runtime
//   会报 Cannot find module。
//
// 为什么不 import "../dist/app.js"？
//   同样问题：Vercel 部署包不包含 dist/。
//
// 当前方案：在 vercel.json 的 buildCommand 里跑 esbuild 把 src/app.tsx
// 和所有依赖 bundle 到同目录的 api/_app.js（单文件，含静态 import 的
// 全部 56 个路由）。api/index.ts 引用同目录的 ./_app.js，Vercel esbuild
// 能直接处理。
//
// Docker 部署完全不受影响 —— src/registry.ts 已改为静态 import，tsc 编译
// 后的 dist/ 在 Docker 环境一样能解析到 dist/routes/。
import app from "./_app.js";

export default app;
