// Vercel serverless 入口：不启动常驻进程，只导出 Hono app
// 原 src/index.ts 保留 Docker / 本地开发环境的使用方式
//
// Vercel @vercel/node builder 只会编译 api/ 目录下的文件，不会把
// src/app.tsx 跟随 bundle 进来。所以我们在 vercel.json 里加了
// `buildCommand: "npm run build"`，让 tsc 提前把 src/ 编译到 dist/，
// 然后这里从编译产物引入。
import app from "../dist/app.js";

export default app;
