import { config } from "./config.js";
import { Hono } from "hono";
import getRSS from "./utils/getRSS.js";

// 静态导入所有路由 handler —— 这样 esbuild 能跟随 import 链把全部
// 路由 inline 到 bundle 里。原本用 fs.readdirSync 动态扫描的写法在
// serverless / bundle 后无法定位 routes/ 目录，路由会变成 0 个。
// Docker 本地运行时 tsc 编译后这些静态 import 一样能解析到 dist/routes/，
// 不影响 Docker 部署。
import { handleRoute as h_36kr } from "./routes/36kr.js";
import { handleRoute as h_51cto } from "./routes/51cto.js";
import { handleRoute as h_52pojie } from "./routes/52pojie.js";
import { handleRoute as h_acfun } from "./routes/acfun.js";
import { handleRoute as h_baidu } from "./routes/baidu.js";
import { handleRoute as h_bilibili } from "./routes/bilibili.js";
import { handleRoute as h_coolapk } from "./routes/coolapk.js";
import { handleRoute as h_csdn } from "./routes/csdn.js";
import { handleRoute as h_dgtle } from "./routes/dgtle.js";
import { handleRoute as h_doubanGroup } from "./routes/douban-group.js";
import { handleRoute as h_doubanMovie } from "./routes/douban-movie.js";
import { handleRoute as h_douyin } from "./routes/douyin.js";
import { handleRoute as h_earthquake } from "./routes/earthquake.js";
import { handleRoute as h_gameres } from "./routes/gameres.js";
import { handleRoute as h_geekpark } from "./routes/geekpark.js";
import { handleRoute as h_genshin } from "./routes/genshin.js";
import { handleRoute as h_github } from "./routes/github.js";
import { handleRoute as h_guokr } from "./routes/guokr.js";
import { handleRoute as h_hackernews } from "./routes/hackernews.js";
import { handleRoute as h_hellogithub } from "./routes/hellogithub.js";
import { handleRoute as h_history } from "./routes/history.js";
import { handleRoute as h_honkai } from "./routes/honkai.js";
import { handleRoute as h_hostloc } from "./routes/hostloc.js";
import { handleRoute as h_hupu } from "./routes/hupu.js";
import { handleRoute as h_huxiu } from "./routes/huxiu.js";
import { handleRoute as h_ifanr } from "./routes/ifanr.js";
import { handleRoute as h_ithomeXijiayi } from "./routes/ithome-xijiayi.js";
import { handleRoute as h_ithome } from "./routes/ithome.js";
import { handleRoute as h_jianshu } from "./routes/jianshu.js";
import { handleRoute as h_juejin } from "./routes/juejin.js";
import { handleRoute as h_kuaishou } from "./routes/kuaishou.js";
import { handleRoute as h_linuxdo } from "./routes/linuxdo.js";
import { handleRoute as h_lol } from "./routes/lol.js";
import { handleRoute as h_miyoushe } from "./routes/miyoushe.js";
import { handleRoute as h_neteaseNews } from "./routes/netease-news.js";
import { handleRoute as h_newsmth } from "./routes/newsmth.js";
import { handleRoute as h_ngabbs } from "./routes/ngabbs.js";
import { handleRoute as h_nodeseek } from "./routes/nodeseek.js";
import { handleRoute as h_nytimes } from "./routes/nytimes.js";
import { handleRoute as h_producthunt } from "./routes/producthunt.js";
import { handleRoute as h_qqNews } from "./routes/qq-news.js";
import { handleRoute as h_sinaNews } from "./routes/sina-news.js";
import { handleRoute as h_sina } from "./routes/sina.js";
import { handleRoute as h_smzdm } from "./routes/smzdm.js";
import { handleRoute as h_sspai } from "./routes/sspai.js";
import { handleRoute as h_starrail } from "./routes/starrail.js";
import { handleRoute as h_thepaper } from "./routes/thepaper.js";
import { handleRoute as h_tieba } from "./routes/tieba.js";
import { handleRoute as h_toutiao } from "./routes/toutiao.js";
import { handleRoute as h_v2ex } from "./routes/v2ex.js";
import { handleRoute as h_weatheralarm } from "./routes/weatheralarm.js";
import { handleRoute as h_weibo } from "./routes/weibo.js";
import { handleRoute as h_weread } from "./routes/weread.js";
import { handleRoute as h_yystv } from "./routes/yystv.js";
import { handleRoute as h_zhihuDaily } from "./routes/zhihu-daily.js";
import { handleRoute as h_zhihu } from "./routes/zhihu.js";

const routeHandlers: Record<string, (c: any, noCache: boolean) => Promise<any>> = {
  "36kr": h_36kr,
  "51cto": h_51cto,
  "52pojie": h_52pojie,
  acfun: h_acfun,
  baidu: h_baidu,
  bilibili: h_bilibili,
  coolapk: h_coolapk,
  csdn: h_csdn,
  dgtle: h_dgtle,
  "douban-group": h_doubanGroup,
  "douban-movie": h_doubanMovie,
  douyin: h_douyin,
  earthquake: h_earthquake,
  gameres: h_gameres,
  geekpark: h_geekpark,
  genshin: h_genshin,
  github: h_github,
  guokr: h_guokr,
  hackernews: h_hackernews,
  hellogithub: h_hellogithub,
  history: h_history,
  honkai: h_honkai,
  hostloc: h_hostloc,
  hupu: h_hupu,
  huxiu: h_huxiu,
  ifanr: h_ifanr,
  "ithome-xijiayi": h_ithomeXijiayi,
  ithome: h_ithome,
  jianshu: h_jianshu,
  juejin: h_juejin,
  kuaishou: h_kuaishou,
  linuxdo: h_linuxdo,
  lol: h_lol,
  miyoushe: h_miyoushe,
  "netease-news": h_neteaseNews,
  newsmth: h_newsmth,
  ngabbs: h_ngabbs,
  nodeseek: h_nodeseek,
  nytimes: h_nytimes,
  producthunt: h_producthunt,
  "qq-news": h_qqNews,
  "sina-news": h_sinaNews,
  sina: h_sina,
  smzdm: h_smzdm,
  sspai: h_sspai,
  starrail: h_starrail,
  thepaper: h_thepaper,
  tieba: h_tieba,
  toutiao: h_toutiao,
  v2ex: h_v2ex,
  weatheralarm: h_weatheralarm,
  weibo: h_weibo,
  weread: h_weread,
  yystv: h_yystv,
  "zhihu-daily": h_zhihuDaily,
  zhihu: h_zhihu,
};

const app = new Hono();

// 注册全部路由
for (const [name, handleRoute] of Object.entries(routeHandlers)) {
  const listApp = app.basePath(`/${name}`);
  // 返回榜单
  listApp.get("/", async (c) => {
    // 是否采用缓存
    const noCache = c.req.query("cache") === "false";
    // 限制显示条目
    const limit = c.req.query("limit");
    // 是否输出 RSS
    const rssEnabled = c.req.query("rss") === "true";
    // 获取路由数据
    const listData = await handleRoute(c, noCache);
    // 是否限制条目
    if (limit && listData?.data?.length > parseInt(limit)) {
      listData.total = parseInt(limit);
      listData.data = listData.data.slice(0, parseInt(limit));
    }
    // 是否输出 RSS
    if (rssEnabled || config.RSS_MODE) {
      const rss = getRSS(listData);
      if (typeof rss === "string") {
        c.header("Content-Type", "application/xml; charset=utf-8");
        return c.body(rss);
      } else {
        return c.json({ code: 500, message: "RSS generation failed" }, 500);
      }
    }
    return c.json({ code: 200, ...listData });
  });
  // 请求方式错误
  listApp.all("*", (c) => c.json({ code: 405, message: "Method Not Allowed" }, 405));
}

// 获取全部路由
app.get("/all", (c) =>
  c.json(
    {
      code: 200,
      count: Object.keys(routeHandlers).length,
      routes: Object.keys(routeHandlers).map((path) => ({
        name: path,
        path: `/${path}`,
      })),
    },
    200,
  ),
);

export default app;
