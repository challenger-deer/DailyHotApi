// Vercel serverless 入口：不启动常驻进程，只导出 Hono app
// 原 src/index.ts 保留 Docker / 本地开发环境的使用方式
import app from "../src/app.js";

export default app;
