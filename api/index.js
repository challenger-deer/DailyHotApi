var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// api/_app.js
var app_exports = {};
__export(app_exports, {
  default: () => app_default
});
import { Hono as Hono2 } from "hono";
import { cors } from "hono/cors";
import dotenv from "dotenv";
import { serveStatic } from "@hono/node-server/serve-static";
import { compress } from "hono/compress";
import { prettyJSON } from "hono/pretty-json";
import { trimTrailingSlash } from "hono/trailing-slash";
import { createLogger, format, transports } from "winston";
import path from "path";
import chalk from "chalk";
import { Hono } from "hono";
import { Feed } from "feed";
import { stringify, parse } from "flatted";
import NodeCache from "node-cache";
import Redis from "ioredis";
import axios from "axios";
import dayjs from "dayjs";
import md5 from "md5";
import RSSParser from "rss-parser";
import iconv from "iconv-lite";
import md52 from "md5";
import md53 from "md5";
import { load } from "cheerio";
import { load as load2 } from "cheerio";
import { load as load3 } from "cheerio";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { load as load5 } from "cheerio";
import { load as load6 } from "cheerio";
import axios2 from "axios";
import { load as load7 } from "cheerio";
import { load as load8 } from "cheerio";
import { load as load9 } from "cheerio";
import UserAgent from "user-agents";
import { load as load10 } from "cheerio";
import crypto from "crypto";
import { html } from "hono/html";
import { css, Style } from "hono/css";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { jsx as jsx2, jsxs as jsxs2 } from "hono/jsx/jsx-runtime";
import { html as html2 } from "hono/html";
import { jsx as jsx3, jsxs as jsxs3 } from "hono/jsx/jsx-runtime";
import { html as html3 } from "hono/html";
import { jsx as jsx4, jsxs as jsxs4 } from "hono/jsx/jsx-runtime";
import { jsx as jsx5 } from "hono/jsx/jsx-runtime";
function isTrendingType(value) {
  return ["daily", "weekly", "monthly"].includes(value);
}
async function getTrendingRepos(type = "daily", ttl = 60 * 60 * 24) {
  const url = `https://github.com/trending?since=${type}`;
  const cachedData = await getCache(url);
  if (cachedData) {
    logger_default.info("\u{1F4BE} [CHCHE] The request is cached");
    return {
      fromCache: true,
      updateTime: cachedData.updateTime,
      data: cachedData?.data || []
    };
  }
  logger_default.info(`\u{1F310} [GET] ${url}`);
  const headers2 = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Cache-Control": "max-age=0"
  };
  const maxRetries = 3;
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2e4);
      const response = await fetch(url, {
        headers: headers2,
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const html4 = await response.text();
      const $ = cheerio.load(html4);
      const results = [];
      $("article.Box-row").each((_, el) => {
        const $el = $(el);
        const $repoAnchor = $el.find("h2 a");
        const fullNameText = $repoAnchor.text().trim().replace(/\r?\n/g, "").replace(/\s+/g, " ").split("/").map((s) => s.trim());
        const owner = fullNameText[0] || "";
        const repoName = fullNameText[1] || "";
        const repoUrl = "https://github.com" + $repoAnchor.attr("href");
        const description = $el.find("p.col-9.color-fg-muted").text().trim();
        const language = $el.find('[itemprop="programmingLanguage"]').text().trim();
        const starsText = $el.find('a[href$="/stargazers"]').text().trim();
        const forksText = $el.find(`a[href$="/forks"]`).text().trim();
        results.push({
          owner,
          repo: repoName,
          url: repoUrl || "",
          description,
          language,
          stars: starsText,
          forks: forksText
        });
      });
      const updateTime = (/* @__PURE__ */ new Date()).toISOString();
      const data = results;
      await setCache(url, { data, updateTime }, ttl);
      logger_default.info(`\u2705 [${response?.status}] \u8BF7\u6C42\u6210\u529F\uFF01`);
      return { fromCache: false, updateTime, data };
    } catch (error) {
      lastError = error;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger_default.error(`\u274C [ERROR] \u7B2C ${i + 1} \u8BF7\u6C42\u5931\u8D25: ${errorMessage}`);
      if (i === maxRetries - 1) {
        logger_default.error("\u274C [ERROR] \u6240\u6709\u5C1D\u8BD5\u8BF7\u6C42\u5931\u8D25\uFF01");
        throw lastError;
      }
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1e3));
      continue;
    }
  }
  throw new Error("\u8BF7\u6C42\u5931\u8D25\uFF01");
}
var getEnvVariable, getNumericEnvVariable, getBooleanEnvVariable, config, pathOption, levelColors, consoleFormat, logger, logger_default, getRSS, getRSS_default, cache, redis, isRedisAvailable, isRedisTried, ensureRedisConnection, getCache, setCache, delCache, request, get, post, getTime, getCurrentDateTime, typeMap, handleRoute, getList, getToken, sign, handleRoute2, getList2, parseRSS, typeMap2, handleRoute3, getList3, typeMap3, rangeMap, handleRoute4, getList4, typeMap4, handleRoute5, getList5, mixinKeyEncTab, getMixinKey, encWbi, getWbiKeys, getBiliWbi, bilibili_default, typeMap5, handleRoute6, getList6, getRandomDEVICE_ID, get_app_token, genHeaders, handleRoute7, getList7, handleRoute8, getList8, handleRoute9, getList9, handleRoute10, getNumbers, getList10, handleRoute11, getNumbers2, getList11, handleRoute12, getDyCookies, getList12, mappings, handleRoute13, getList13, handleRoute14, getList14, handleRoute15, getList15, handleRoute16, getList16, typeMap6, handleRoute17, handleRoute18, getList17, handleRoute19, getList18, handleRoute20, getList19, handleRoute21, getList20, handleRoute22, getList21, typeMap7, handleRoute23, getList22, handleRoute24, getList23, handleRoute25, getList24, handleRoute26, getList25, handleRoute27, replaceLink, getList26, handleRoute28, replaceLink2, getList27, handleRoute29, getID, getList28, headers, category_url, getCategory, handleRoute30, getList29, parseChineseNumber, APOLLO_STATE_PREFIX, handleRoute31, getList30, handleRoute32, getList31, handleRoute33, getList32, gameMap, typeMap8, handleRoute34, getList33, handleRoute35, getList34, handleRoute36, getList35, handleRoute37, getList36, handleRoute38, getList37, areaMap, handleRoute39, getList38, handleRoute40, getList39, handleRoute41, getList40, listType, handleRoute42, parseData, getList41, typeMap9, handleRoute43, getList42, typeMap10, handleRoute44, getList43, handleRoute45, getList44, handleRoute46, getList45, handleRoute47, getList46, handleRoute48, getList47, handleRoute49, getList48, handleRoute50, getList49, handleRoute51, getList50, handleRoute52, getList51, getWereadID, weread_default, typeMap11, handleRoute53, getList52, handleRoute54, getList53, handleRoute55, getList54, handleRoute56, getList55, routeHandlers, app, registry_default, handler, robots_txt_default, Layout, Layout_default, NotFound, NotFound_default, Home, Home_default, Error2, Error_default, app2, app_default;
var init_app = __esm({
  "api/_app.js"() {
    "use strict";
    dotenv.config();
    getEnvVariable = (key) => {
      const value = process.env[key];
      if (value === void 0) return void 0;
      return value;
    };
    getNumericEnvVariable = (key, defaultValue) => {
      const value = getEnvVariable(key) ?? String(defaultValue);
      const parsedValue = parseInt(value, 10);
      if (isNaN(parsedValue)) return defaultValue;
      return parsedValue;
    };
    getBooleanEnvVariable = (key, defaultValue) => {
      const value = getEnvVariable(key) ?? String(defaultValue);
      return value.toLowerCase() === "true";
    };
    config = {
      PORT: getNumericEnvVariable("PORT", 6688),
      DISALLOW_ROBOT: getBooleanEnvVariable("DISALLOW_ROBOT", true),
      CACHE_TTL: getNumericEnvVariable("CACHE_TTL", 3600),
      REQUEST_TIMEOUT: getNumericEnvVariable("REQUEST_TIMEOUT", 6e3),
      ALLOWED_DOMAIN: getEnvVariable("ALLOWED_DOMAIN") || "*",
      ALLOWED_HOST: getEnvVariable("ALLOWED_HOST") || "imsyy.top",
      USE_LOG_FILE: getBooleanEnvVariable("USE_LOG_FILE", true),
      RSS_MODE: getBooleanEnvVariable("RSS_MODE", false),
      REDIS_HOST: getEnvVariable("REDIS_HOST") || "127.0.0.1",
      REDIS_PORT: getNumericEnvVariable("REDIS_PORT", 6379),
      REDIS_PASSWORD: getEnvVariable("REDIS_PASSWORD") || "",
      REDIS_DB: getNumericEnvVariable("REDIS_DB", 0),
      ZHIHU_COOKIE: getEnvVariable("ZHIHU_COOKIE") || "",
      FILTER_WEIBO_ADVERTISEMENT: getBooleanEnvVariable("FILTER_WEIBO_ADVERTISEMENT", false)
    };
    pathOption = [];
    if (config.USE_LOG_FILE && !process.env.VERCEL) {
      try {
        pathOption = [
          new transports.File({
            filename: path.resolve("logs/error.log"),
            level: "error",
            maxsize: 1024 * 1024,
            maxFiles: 1
          }),
          new transports.File({
            filename: path.resolve("logs/logger.log"),
            maxsize: 1024 * 1024,
            maxFiles: 1
          })
        ];
      } catch (error) {
        console.error("Failed to initialize log files. Logging to a file will be skipped.", error);
        pathOption = [];
      }
    }
    levelColors = {
      error: chalk.bgRed(" ERROR "),
      warn: chalk.bgYellow(" WARN "),
      info: chalk.bgBlue(" INFO "),
      debug: chalk.bgGreen(" DEBUG "),
      default: chalk.bgWhite(" LOG ")
    };
    consoleFormat = format.printf(({ level, message, timestamp, stack }) => {
      const originalLevel = Object.keys(levelColors).find((lvl) => level.includes(lvl)) || "default";
      const colorLevel = levelColors[originalLevel] || levelColors.default;
      let logMessage = `${colorLevel} [${timestamp}] ${message}`;
      if (stack) {
        logMessage += `
${stack}`;
      }
      return logMessage;
    });
    logger = createLogger({
      // 最低的日志级别
      level: "info",
      // 定义日志的格式
      format: format.combine(
        format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss"
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
      transports: pathOption
    });
    if (process.env.NODE_ENV !== "production") {
      try {
        logger.add(
          new transports.Console({
            format: format.combine(format.colorize(), consoleFormat)
          })
        );
      } catch (error) {
        console.error("Failed to add console transport. Console logging will be skipped.", error);
      }
    }
    logger_default = logger;
    getRSS = (data) => {
      try {
        const feed = new Feed({
          title: data.title,
          description: data.title + data.type + (data?.description ? " - " + data?.description : ""),
          id: data.name,
          link: data.link,
          language: "zh",
          generator: "DailyHotApi",
          copyright: "Copyright \xA9 2020-present imsyy",
          updated: new Date(data.updateTime)
        });
        const listData = data.data;
        listData.forEach((item) => {
          feed.addItem({
            id: item.id?.toString(),
            title: item.title,
            date: new Date(data.updateTime),
            link: item.url || "\u83B7\u53D6\u5931\u8D25",
            description: item?.desc,
            author: [
              {
                name: item.author
              }
            ],
            extensions: [
              {
                name: "media:content",
                objects: {
                  _attributes: {
                    "xmlns:media": "http://search.yahoo.com/mrss/",
                    url: item.cover
                  },
                  "media:thumbnail": {
                    _attributes: {
                      url: item.cover
                    }
                  },
                  "media:description": item.desc ? {
                    _cdata: item.desc
                  } : ""
                }
              }
            ]
          });
        });
        const rssData = feed.rss2();
        return rssData;
      } catch (error) {
        logger_default.error("\u274C [ERROR] getRSS failed");
        throw error;
      }
    };
    getRSS_default = getRSS;
    cache = new NodeCache({
      // 缓存过期时间（ 秒 ）
      stdTTL: config.CACHE_TTL,
      // 定期检查过期缓存（ 秒 ）
      checkperiod: 600,
      // 克隆变量
      useClones: false,
      // 最大键值对
      maxKeys: 100
    });
    redis = new Redis({
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      password: config.REDIS_PASSWORD,
      db: config.REDIS_DB,
      maxRetriesPerRequest: 5,
      // 重试策略：最小延迟 50ms，最大延迟 2s
      retryStrategy: (times) => Math.min(times * 50, 2e3),
      // 仅在第一次建立连接
      lazyConnect: true
    });
    isRedisAvailable = false;
    isRedisTried = false;
    ensureRedisConnection = async () => {
      if (isRedisTried) return;
      try {
        if (redis.status !== "ready" && redis.status !== "connecting") await redis.connect();
        isRedisAvailable = true;
        isRedisTried = true;
        logger_default.info("\u{1F4E6} [Redis] connected successfully.");
      } catch (error) {
        isRedisAvailable = false;
        isRedisTried = true;
        logger_default.error(
          `\u{1F4E6} [Redis] connection failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    };
    redis.on("error", (err) => {
      if (!isRedisTried) {
        isRedisAvailable = false;
        isRedisTried = true;
        logger_default.error(
          `\u{1F4E6} [Redis] connection failed: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    });
    cache.on("expired", (key) => {
      logger_default.info(`\u23F3 [NodeCache] Key "${key}" has expired.`);
    });
    cache.on("del", (key) => {
      logger_default.info(`\u{1F5D1}\uFE0F [NodeCache] Key "${key}" has been deleted.`);
    });
    getCache = async (key) => {
      await ensureRedisConnection();
      if (isRedisAvailable) {
        try {
          const redisResult = await redis.get(key);
          if (redisResult) return parse(redisResult);
        } catch (error) {
          logger_default.error(
            `\u{1F4E6} [Redis] get error: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }
      return cache.get(key);
    };
    setCache = async (key, value, ttl = config.CACHE_TTL) => {
      if (isRedisAvailable && !Buffer.isBuffer(value?.data)) {
        try {
          await redis.set(key, stringify(value), "EX", ttl);
          if (logger_default) logger_default.info(`\u{1F4BE} [REDIS] ${key} has been cached`);
        } catch (error) {
          logger_default.error(
            `\u{1F4E6} [Redis] set error: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }
      const success = cache.set(key, value, ttl);
      if (logger_default) logger_default.info(`\u{1F4BE} [NodeCache] ${key} has been cached`);
      return success;
    };
    delCache = async (key) => {
      let redisSuccess = true;
      try {
        await redis.del(key);
        logger_default.info(`\u{1F5D1}\uFE0F [REDIS] ${key} has been deleted from Redis`);
      } catch (error) {
        redisSuccess = false;
        logger_default.error(
          `\u{1F4E6} [Redis] del error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
      const nodeCacheSuccess = cache.del(key) > 0;
      if (logger_default) logger_default.info(`\u{1F5D1}\uFE0F [CACHE] ${key} has been deleted from NodeCache`);
      return redisSuccess && nodeCacheSuccess;
    };
    request = axios.create({
      // 请求超时设置
      timeout: config.REQUEST_TIMEOUT,
      withCredentials: true
    });
    request.interceptors.request.use(
      (request2) => {
        if (!request2.params) request2.params = {};
        return request2;
      },
      (error) => {
        logger_default.error("\u274C [ERROR] request failed");
        return Promise.reject(error);
      }
    );
    request.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    get = async (options) => {
      const {
        url,
        headers: headers2,
        params,
        noCache,
        ttl = config.CACHE_TTL,
        originaInfo = false,
        responseType = "json"
      } = options;
      logger_default.info(`\u{1F310} [GET] ${url}`);
      try {
        if (noCache) await delCache(url);
        else {
          const cachedData = await getCache(url);
          if (cachedData) {
            logger_default.info("\u{1F4BE} [CHCHE] The request is cached");
            return {
              fromCache: true,
              updateTime: cachedData.updateTime,
              data: cachedData.data
            };
          }
        }
        const response = await request.get(url, { headers: headers2, params, responseType });
        const responseData = response?.data || response;
        const updateTime = (/* @__PURE__ */ new Date()).toISOString();
        const data = originaInfo ? response : responseData;
        await setCache(url, { data, updateTime }, ttl);
        logger_default.info(`\u2705 [${response?.status}] request was successful`);
        return { fromCache: false, updateTime, data };
      } catch (error) {
        logger_default.error("\u274C [ERROR] request failed");
        throw error;
      }
    };
    post = async (options) => {
      const { url, headers: headers2, body, noCache, ttl = config.CACHE_TTL, originaInfo = false } = options;
      logger_default.info(`\u{1F310} [POST] ${url}`);
      try {
        if (noCache) await delCache(url);
        else {
          const cachedData = await getCache(url);
          if (cachedData) {
            logger_default.info("\u{1F4BE} [CHCHE] The request is cached");
            return { fromCache: true, updateTime: cachedData.updateTime, data: cachedData.data };
          }
        }
        const response = await request.post(url, body, { headers: headers2 });
        const responseData = response?.data || response;
        const updateTime = (/* @__PURE__ */ new Date()).toISOString();
        const data = originaInfo ? response : responseData;
        if (!noCache) {
          await setCache(url, { data, updateTime }, ttl);
        }
        logger_default.info(`\u2705 [${response?.status}] request was successful`);
        return { fromCache: false, updateTime, data };
      } catch (error) {
        logger_default.error("\u274C [ERROR] request failed");
        throw error;
      }
    };
    getTime = (timeInput) => {
      try {
        let num;
        if (typeof timeInput === "string") {
          num = Number(timeInput);
          if (isNaN(num)) {
            const now = dayjs();
            if (/^\d{2}:\d{2}$/.test(timeInput)) {
              const [hour, minute] = timeInput.split(":").map(Number);
              return now.set("hour", hour).set("minute", minute).set("second", 0).valueOf();
            }
            if (/^昨日\s+\d{2}:\d{2}$/.test(timeInput)) {
              const timeStr = timeInput.replace("\u6628\u65E5", "").trim();
              const [hour, minute] = timeStr.split(":").map(Number);
              return now.subtract(1, "day").set("hour", hour).set("minute", minute).set("second", 0).valueOf();
            }
            if (/^\d{1,2}月\d{1,2}日$/.test(timeInput)) {
              const [month, day] = timeInput.replace("\u6708", "-").replace("\u65E5", "").split("-").map(Number);
              return now.set("month", month - 1).set("date", day).startOf("day").valueOf();
            }
            if (/^\d{1,2}月\d{1,2}日\s+\d{2}:\d{2}$/.test(timeInput)) {
              const [datePart, timePart] = timeInput.split(" ");
              const [month, day] = datePart.replace("\u6708", "-").replace("\u65E5", "").split("-").map(Number);
              const [hour, minute] = timePart.split(":").map(Number);
              return now.set("month", month - 1).set("date", day).set("hour", hour).set("minute", minute).set("second", 0).valueOf();
            }
            if (/今天/.test(timeInput)) {
              const timeStr = timeInput.replace("\u4ECA\u5929", "").trim();
              return dayjs().set("hour", parseInt(timeStr.split(":")[0])).set("minute", parseInt(timeStr.split(":")[1])).valueOf();
            }
            if (/昨天/.test(timeInput)) {
              const timeStr = timeInput.replace("\u6628\u5929", "").trim();
              return dayjs().subtract(1, "day").set("hour", parseInt(timeStr.split(":")[0])).set("minute", parseInt(timeStr.split(":")[1])).valueOf();
            }
            if (/小时前/.test(timeInput)) {
              const hoursAgo = parseInt(timeInput.replace("\u5C0F\u65F6\u524D", ""));
              return dayjs().subtract(hoursAgo, "hour").valueOf();
            }
            if (/分钟前/.test(timeInput)) {
              const minutesAgo = parseInt(timeInput.replace("\u5206\u949F\u524D", ""));
              return dayjs().subtract(minutesAgo, "minute").valueOf();
            }
            let standardizedInput = timeInput.replace(/(\d{4})-(\d{2})-(\d{2})-(\d{2})/, "$1-$2-$3 $4").replace(/(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):?(\d{2})?:?(\d{2})?/, "$1-$2-$3 $4:$5:$6").replace(/(\d{4})[-/](\d{2})[-/](\d{2})/, "$1-$2-$3");
            standardizedInput = standardizedInput.replace(/\s+/, " ").trim();
            const formatPatterns = [
              "YYYY-MM-DD HH:mm:ss",
              "YYYY-MM-DD HH:mm",
              "YYYY-MM-DD HH",
              "YYYY-MM-DD"
            ];
            let parsedDate = void 0;
            for (const pattern of formatPatterns) {
              parsedDate = dayjs(standardizedInput, pattern, true);
              if (parsedDate.isValid()) {
                break;
              }
            }
            if (parsedDate && parsedDate.isValid()) {
              return parsedDate.valueOf();
            } else {
              return 0;
            }
          }
        } else {
          num = timeInput;
        }
        if (num > 9466848e5) {
          return num;
        } else {
          return num * 1e3;
        }
      } catch (error) {
        console.error(error);
      }
    };
    getCurrentDateTime = (padZero = false) => {
      const now = dayjs();
      const pad = (num) => num < 10 ? `0${num}` : `${num}`;
      return {
        year: now.year().toString(),
        month: padZero ? pad(now.month() + 1) : (now.month() + 1).toString(),
        day: padZero ? pad(now.date()) : now.date().toString(),
        hour: padZero ? pad(now.hour()) : now.hour().toString(),
        minute: padZero ? pad(now.minute()) : now.minute().toString(),
        second: padZero ? pad(now.second()) : now.second().toString()
      };
    };
    typeMap = {
      hot: "\u4EBA\u6C14\u699C",
      video: "\u89C6\u9891\u699C",
      comment: "\u70ED\u8BAE\u699C",
      collect: "\u6536\u85CF\u699C"
    };
    handleRoute = async (c, noCache) => {
      const type = c.req.query("type") || "hot";
      const listData = await getList({ type }, noCache);
      const routeData = {
        name: "36kr",
        title: "36\u6C2A",
        type: typeMap[type],
        params: {
          type: {
            name: "\u70ED\u699C\u5206\u7C7B",
            type: typeMap
          }
        },
        link: "https://m.36kr.com/hot-list-m",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList = async (options, noCache) => {
      const { type } = options;
      const url = `https://gateway.36kr.com/api/mis/nav/home/nav/rank/${type}`;
      const result = await post({
        url,
        noCache,
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: {
          partner_id: "wap",
          param: {
            siteId: 1,
            platformId: 2
          },
          timestamp: (/* @__PURE__ */ new Date()).getTime()
        }
      });
      const listType2 = {
        hot: "hotRankList",
        video: "videoList",
        comment: "remarkList",
        collect: "collectList"
      };
      const list = result.data.data[listType2[type || "hot"]];
      return {
        ...result,
        data: list.map((v) => {
          const item = v.templateMaterial;
          return {
            id: v.itemId,
            title: item.widgetTitle,
            cover: item.widgetImage,
            author: item.authorName,
            timestamp: getTime(v.publishTime),
            hot: item.statCollect || void 0,
            url: `https://www.36kr.com/p/${v.itemId}`,
            mobileUrl: `https://m.36kr.com/p/${v.itemId}`
          };
        })
      };
    };
    getToken = async () => {
      const cachedData = await getCache("51cto-token");
      if (cachedData?.data) return cachedData.data;
      const result = await get({
        url: "https://api-media.51cto.com/api/token-get"
      });
      const token = result.data.data.data.token;
      await setCache("51cto-token", { data: token, updateTime: (/* @__PURE__ */ new Date()).toISOString() });
      return token;
    };
    sign = (requestPath, payload = {}, timestamp, token) => {
      payload.timestamp = timestamp;
      payload.token = token;
      const sortedParams = Object.keys(payload).sort();
      return md5(md5(requestPath) + md5(sortedParams + md5(token) + timestamp));
    };
    handleRoute2 = async (_, noCache) => {
      const listData = await getList2(noCache);
      const routeData = {
        name: "51cto",
        title: "51CTO",
        type: "\u63A8\u8350\u699C",
        link: "https://www.51cto.com/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList2 = async (noCache) => {
      const url = `https://api-media.51cto.com/index/index/recommend`;
      const params = {
        page: 1,
        page_size: 50,
        limit_time: 0,
        name_en: ""
      };
      const timestamp = Date.now();
      const token = await getToken();
      const result = await get({
        url,
        params: {
          ...params,
          timestamp,
          token,
          sign: sign("index/index/recommend", params, timestamp, token)
        },
        noCache
      });
      const list = result.data.data.data.list;
      return {
        ...result,
        data: list.map((v) => ({
          id: v.source_id,
          title: v.title,
          cover: v.cover,
          desc: v.abstract,
          timestamp: getTime(v.pubdate),
          hot: void 0,
          url: v.url,
          mobileUrl: v.url
        }))
      };
    };
    parseRSS = async (rssContent) => {
      const parser = new RSSParser();
      const isUrl = (url) => {
        try {
          new URL(url);
          return true;
        } catch (error) {
          return false;
        }
      };
      try {
        const feed = isUrl(rssContent) ? await parser.parseURL(rssContent) : await parser.parseString(rssContent);
        const items = feed.items.map((item) => ({
          title: item.title,
          // 文章标题
          link: item.link,
          // 文章链接
          pubDate: item.pubDate,
          // 发布日期
          author: item.creator ?? item.author,
          // 作者
          content: item.content,
          // 内容
          contentSnippet: item.contentSnippet,
          // 内容摘要
          guid: item.guid,
          // 全局唯一标识符
          categories: item.categories
          // 分类
        }));
        return items;
      } catch (error) {
        logger_default.error("\u274C [RSS] An error occurred while parsing RSS content");
        throw error;
      }
    };
    typeMap2 = {
      digest: "\u6700\u65B0\u7CBE\u534E",
      hot: "\u6700\u65B0\u70ED\u95E8",
      new: "\u6700\u65B0\u56DE\u590D",
      newthread: "\u6700\u65B0\u53D1\u8868"
    };
    handleRoute3 = async (c, noCache) => {
      const type = c.req.query("type") || "digest";
      const listData = await getList3({ type }, noCache);
      const routeData = {
        name: "52pojie",
        title: "\u543E\u7231\u7834\u89E3",
        type: typeMap2[type],
        params: {
          type: {
            name: "\u699C\u5355\u5206\u7C7B",
            type: typeMap2
          }
        },
        link: "https://www.52pojie.cn/",
        total: listData?.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList3 = async (options, noCache) => {
      const { type } = options;
      const url = `https://www.52pojie.cn/forum.php?mod=guide&view=${type}&rss=1`;
      const result = await get({
        url,
        noCache,
        responseType: "arraybuffer",
        headers: {
          userAgent: "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36"
        }
      });
      const utf8Data = iconv.decode(result.data, "gbk");
      const list = await parseRSS(utf8Data);
      return {
        ...result,
        data: list.map((v, i) => ({
          id: v.guid || i,
          title: v.title || "",
          desc: v.content?.trim() || "",
          author: v.author,
          timestamp: getTime(v.pubDate || 0),
          hot: void 0,
          url: v.link || "",
          mobileUrl: v.link || ""
        }))
      };
    };
    typeMap3 = {
      "-1": "\u7EFC\u5408",
      "155": "\u756A\u5267",
      "1": "\u52A8\u753B",
      "60": "\u5A31\u4E50",
      "201": "\u751F\u6D3B",
      "58": "\u97F3\u4E50",
      "123": "\u821E\u8E48\xB7\u5076\u50CF",
      "59": "\u6E38\u620F",
      "70": "\u79D1\u6280",
      "68": "\u5F71\u89C6",
      "69": "\u4F53\u80B2",
      "125": "\u9C7C\u5858"
    };
    rangeMap = {
      DAY: "\u4ECA\u65E5",
      THREE_DAYS: "\u4E09\u65E5",
      WEEK: "\u672C\u5468"
    };
    handleRoute4 = async (c, noCache) => {
      const type = c.req.query("type") || "-1";
      const range = c.req.query("range") || "DAY";
      const listData = await getList4({ type, range }, noCache);
      const routeData = {
        name: "acfun",
        title: "AcFun",
        type: `\u6392\u884C\u699C \xB7 ${typeMap3[type]}`,
        description: "AcFun\u662F\u4E00\u5BB6\u5F39\u5E55\u89C6\u9891\u7F51\u7AD9\uFF0C\u81F4\u529B\u4E8E\u4E3A\u6BCF\u4E00\u4E2A\u4EBA\u5E26\u6765\u6B22\u4E50\u3002",
        params: {
          type: {
            name: "\u9891\u9053",
            type: typeMap3
          },
          range: {
            name: "\u65F6\u95F4",
            type: rangeMap
          }
        },
        link: "https://www.acfun.cn/rank/list/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList4 = async (options, noCache) => {
      const { type, range } = options;
      const url = `https://www.acfun.cn/rest/pc-direct/rank/channel?channelId=${type === "-1" ? "" : type}&rankLimit=30&rankPeriod=${range}`;
      const result = await get({
        url,
        headers: {
          Referer: `https://www.acfun.cn/rank/list/?cid=-1&pcid=${type}&range=${range}`
        },
        noCache
      });
      const list = result.data.rankList;
      return {
        ...result,
        data: list.map((v) => ({
          id: v.dougaId,
          title: v.contentTitle,
          desc: v.contentDesc,
          cover: v.coverUrl,
          author: v.userName,
          timestamp: getTime(v.contributeTime),
          hot: v.likeCount,
          url: `https://www.acfun.cn/v/ac${v.dougaId}`,
          mobileUrl: `https://m.acfun.cn/v/?ac=${v.dougaId}`
        }))
      };
    };
    typeMap4 = {
      realtime: "\u70ED\u641C",
      novel: "\u5C0F\u8BF4",
      movie: "\u7535\u5F71",
      teleplay: "\u7535\u89C6\u5267",
      car: "\u6C7D\u8F66",
      game: "\u6E38\u620F"
    };
    handleRoute5 = async (c, noCache) => {
      const type = c.req.query("type") || "realtime";
      const listData = await getList5({ type }, noCache);
      const routeData = {
        name: "baidu",
        title: "\u767E\u5EA6",
        type: typeMap4[type],
        params: {
          type: {
            name: "\u70ED\u641C\u7C7B\u522B",
            type: typeMap4
          }
        },
        link: "https://top.baidu.com/board",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList5 = async (options, noCache) => {
      const { type } = options;
      const url = `https://top.baidu.com/board?tab=${type}`;
      const result = await get({
        url,
        noCache,
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
        }
      });
      const pattern = /<!--s-data:(.*?)-->/s;
      const matchResult = result.data.match(pattern);
      if (!matchResult) {
        return {
          ...result,
          data: []
        };
      }
      let jsonObject = [];
      try {
        const sData = JSON.parse(matchResult[1]);
        const cardContent = sData.data?.cards?.[0]?.content ?? sData.cards?.[0]?.content;
        if (Array.isArray(cardContent)) {
          if (cardContent.length > 0 && Array.isArray(cardContent[0]?.content)) {
            jsonObject = cardContent[0].content;
          } else {
            jsonObject = cardContent;
          }
        }
      } catch {
        jsonObject = [];
      }
      return {
        ...result,
        data: jsonObject.map((v, index) => {
          const title = v.word ?? v.title ?? "";
          return {
            id: v.index ?? index + 1,
            title,
            desc: v.desc ?? "",
            cover: v.img ?? v.imgInfo?.src ?? "",
            author: v.show?.length ? v.show : "",
            timestamp: 0,
            hot: parseInt((v.hotScore ?? v.hotTag ?? "0").toString(), 10) || 0,
            url: `https://www.baidu.com/s?wd=${encodeURIComponent(v.query ?? title)}`,
            mobileUrl: v.rawUrl ?? v.url ?? ""
          };
        })
      };
    };
    mixinKeyEncTab = [
      46,
      47,
      18,
      2,
      53,
      8,
      23,
      32,
      15,
      50,
      10,
      31,
      58,
      3,
      45,
      35,
      27,
      43,
      5,
      49,
      33,
      9,
      42,
      19,
      29,
      28,
      14,
      39,
      12,
      38,
      41,
      13,
      37,
      48,
      7,
      16,
      24,
      55,
      40,
      61,
      26,
      17,
      0,
      1,
      60,
      51,
      30,
      4,
      22,
      25,
      54,
      21,
      56,
      59,
      6,
      63,
      57,
      62,
      11,
      36,
      20,
      34,
      44,
      52
    ];
    getMixinKey = (orig) => mixinKeyEncTab.map((n) => orig[n]).join("").slice(0, 32);
    encWbi = (params, img_key, sub_key) => {
      const mixin_key = getMixinKey(img_key + sub_key);
      const curr_time = Math.round(Date.now() / 1e3);
      const chr_filter = /[!'()*]/g;
      Object.assign(params, { wts: curr_time });
      const query = Object.keys(params).sort().map((key) => {
        const value = params[key].toString().replace(chr_filter, "");
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      }).join("&");
      const wbi_sign = md52(query + mixin_key);
      return query + "&w_rid=" + wbi_sign;
    };
    getWbiKeys = async () => {
      const result = await get({
        url: "https://api.bilibili.com/x/web-interface/nav",
        headers: {
          // SESSDATA 字段
          Cookie: "SESSDATA=xxxxxx",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
          Referer: "https://www.bilibili.com/"
        }
      });
      const img_url = result.data.wbi_img?.img_url ?? "";
      const sub_url = result.data.wbi_img?.sub_url ?? "";
      return {
        img_key: img_url.slice(img_url.lastIndexOf("/") + 1, img_url.lastIndexOf(".")),
        sub_key: sub_url.slice(sub_url.lastIndexOf("/") + 1, sub_url.lastIndexOf("."))
      };
    };
    getBiliWbi = async () => {
      const cachedData = await getCache("bilibili-wbi");
      if (cachedData?.data) return cachedData.data;
      const web_keys = await getWbiKeys();
      const params = { foo: "114", bar: "514", baz: 1919810 };
      const img_key = web_keys.img_key;
      const sub_key = web_keys.sub_key;
      const query = encWbi(params, img_key, sub_key);
      await setCache("bilibili-wbi", {
        data: query,
        updateTime: (/* @__PURE__ */ new Date()).toISOString()
      });
      return query;
    };
    bilibili_default = getBiliWbi;
    typeMap5 = {
      "0": "\u5168\u7AD9",
      "1": "\u52A8\u753B",
      "3": "\u97F3\u4E50",
      "4": "\u6E38\u620F",
      "5": "\u5A31\u4E50",
      "188": "\u79D1\u6280",
      "119": "\u9B3C\u755C",
      "129": "\u821E\u8E48",
      "155": "\u65F6\u5C1A",
      "160": "\u751F\u6D3B",
      "168": "\u56FD\u521B\u76F8\u5173",
      "181": "\u5F71\u89C6"
    };
    handleRoute6 = async (c, noCache) => {
      const type = c.req.query("type") || "0";
      const listData = await getList6({ type }, noCache);
      const routeData = {
        name: "bilibili",
        title: "\u54D4\u54E9\u54D4\u54E9",
        type: `\u70ED\u699C \xB7 ${typeMap5[type]}`,
        description: "\u4F60\u6240\u70ED\u7231\u7684\uFF0C\u5C31\u662F\u4F60\u7684\u751F\u6D3B",
        params: {
          type: {
            name: "\u6392\u884C\u699C\u5206\u533A",
            type: typeMap5
          }
        },
        link: "https://www.bilibili.com/v/popular/rank/all",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList6 = async (options, noCache) => {
      const { type } = options;
      const wbiData = await bilibili_default();
      const url = `https://api.bilibili.com/x/web-interface/ranking/v2?rid=${type}&type=all&${wbiData}`;
      const result = await get({
        url,
        headers: {
          "Referer": "https://www.bilibili.com/ranking/all",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Sec-Ch-Ua": '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
          "Sec-Ch-Ua-Mobile": "?0",
          "Sec-Ch-Ua-Platform": '"Windows"',
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "same-origin",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1"
        },
        noCache: false
      });
      if (result.data?.data?.list?.length && result.data.data.list.length > 0) {
        logger_default.info("bilibili \u65B0\u63A5\u53E3");
        const list = result.data.data.list;
        return {
          fromCache: result.fromCache,
          updateTime: result.updateTime,
          data: list.map((v) => ({
            id: v.bvid,
            title: v.title,
            desc: v.desc || "\u8BE5\u89C6\u9891\u6682\u65E0\u7B80\u4ECB",
            cover: v.pic?.replace(/http:/, "https:"),
            author: v.owner?.name,
            timestamp: getTime(v.pubdate),
            hot: v.stat?.view || 0,
            url: v.short_link_v2 || `https://www.bilibili.com/video/${v.bvid}`,
            mobileUrl: `https://m.bilibili.com/video/${v.bvid}`
          }))
        };
      } else {
        logger_default.info("bilibili \u5907\u7528\u63A5\u53E3");
        const url2 = `https://api.bilibili.com/x/web-interface/ranking?jsonp=jsonp?rid=${type}&type=all&callback=__jp0`;
        const result2 = await get({
          url: url2,
          headers: {
            Referer: `https://www.bilibili.com/ranking/all`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
          },
          noCache
        });
        const list = result2.data.data.list;
        return {
          ...result2,
          data: list.map((v) => ({
            id: v.bvid,
            title: v.title,
            desc: v.desc || "\u8BE5\u89C6\u9891\u6682\u65E0\u7B80\u4ECB",
            cover: v.pic?.replace(/http:/, "https:"),
            author: v.author,
            timestamp: void 0,
            hot: v.video_review,
            url: `https://www.bilibili.com/video/${v.bvid}`,
            mobileUrl: `https://m.bilibili.com/video/${v.bvid}`
          }))
        };
      }
    };
    getRandomDEVICE_ID = () => {
      const id = [10, 6, 6, 6, 14];
      return id.map((i) => Math.random().toString(36).substring(2, i)).join("-");
    };
    get_app_token = () => {
      const DEVICE_ID = getRandomDEVICE_ID();
      const now = Math.round(Date.now() / 1e3);
      const hex_now = "0x" + now.toString(16);
      const md5_now = md53(now.toString());
      const s = "token://com.coolapk.market/c67ef5943784d09750dcfbb31020f0ab?" + md5_now + "$" + DEVICE_ID + "&com.coolapk.market";
      const md5_s = md53(Buffer.from(s).toString("base64"));
      const token = md5_s + DEVICE_ID + hex_now;
      return token;
    };
    genHeaders = () => {
      return {
        "X-Requested-With": "XMLHttpRequest",
        "X-App-Id": "com.coolapk.market",
        "X-App-Token": get_app_token(),
        "X-Sdk-Int": "29",
        "X-Sdk-Locale": "zh-CN",
        "X-App-Version": "11.0",
        "X-Api-Version": "11",
        "X-App-Code": "2101202",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; Mi 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.5563.15 Mobile Safari/537.36"
      };
    };
    handleRoute7 = async (_, noCache) => {
      const listData = await getList7(noCache);
      const routeData = {
        name: "coolapk",
        title: "\u9177\u5B89",
        type: "\u70ED\u699C",
        link: "https://www.coolapk.com/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList7 = async (noCache) => {
      const url = `https://api.coolapk.com/v6/page/dataList?url=/feed/statList?cacheExpires=300&statType=day&sortField=detailnum&title=\u4ECA\u65E5\u70ED\u95E8&title=\u4ECA\u65E5\u70ED\u95E8&subTitle=&page=1`;
      const result = await get({
        url,
        noCache,
        headers: genHeaders()
      });
      const list = result.data.data;
      return {
        ...result,
        data: list.map((v) => ({
          id: v.id,
          title: v.message,
          cover: v.tpic,
          author: v.username,
          desc: v.ttitle,
          timestamp: void 0,
          hot: void 0,
          url: v.shareUrl,
          mobileUrl: v.shareUrl
        }))
      };
    };
    handleRoute8 = async (_, noCache) => {
      const listData = await getList8(noCache);
      const routeData = {
        name: "csdn",
        title: "CSDN",
        type: "\u6392\u884C\u699C",
        description: "\u4E13\u4E1A\u5F00\u53D1\u8005\u793E\u533A",
        link: "https://www.csdn.net/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList8 = async (noCache) => {
      const url = "https://blog.csdn.net/phoenix/web/blog/hot-rank?page=0&pageSize=30";
      const result = await get({ url, noCache });
      const list = result.data.data;
      return {
        ...result,
        data: list.map((v) => ({
          id: v.productId,
          title: v.articleTitle,
          cover: v.picList?.[0] || void 0,
          desc: void 0,
          author: v.nickName,
          timestamp: getTime(v.period),
          hot: Number(v.hotRankScore),
          url: v.articleDetailUrl,
          mobileUrl: v.articleDetailUrl
        }))
      };
    };
    handleRoute9 = async (_, noCache) => {
      const listData = await getList9(noCache);
      const routeData = {
        name: "dgtle",
        title: "\u6570\u5B57\u5C3E\u5DF4",
        type: "\u70ED\u95E8\u6587\u7AE0",
        description: "\u81F4\u529B\u4E8E\u5206\u4EAB\u7F8E\u597D\u6570\u5B57\u751F\u6D3B\u4F53\u9A8C\uFF0C\u56CA\u62EC\u4F60\u95FB\u6240\u672A\u95FB\u7684\u6700\u4E30\u5BCC\u6570\u7801\u8D44\u8BAF\uFF0C\u89E6\u6240\u672A\u89E6\u6700\u62A2\u9C9C\u4EA7\u54C1\u8BC4\u6D4B\uFF0C\u968F\u65F6\u968F\u5730\u611F\u53D7\u5C3E\u5DF4\u4EEC\u5404\u5F0F\u6570\u5B57\u751F\u6D3B\u7CBE\u5F69\u56FE\u6587\u3001\u6444\u5F71\u611F\u609F\u3001\u65C5\u884C\u6E38\u8BB0\u3001\u7231\u7269\u5206\u4EAB\u3002",
        link: "https://www.dgtle.com/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList9 = async (noCache) => {
      const url = `https://opser.api.dgtle.com/v2/news/index`;
      const result = await get({ url, noCache });
      const list = result.data.items;
      return {
        ...result,
        data: list.map((v) => ({
          id: v.id,
          title: v.title || v.content,
          desc: v.content,
          cover: v.cover,
          author: v.from,
          hot: v.membernum,
          timestamp: getTime(v.created_at),
          url: `https://www.dgtle.com/news-${v.id}-${v.type}.html`,
          mobileUrl: `https://m.dgtle.com/news-details/${v.id}`
        }))
      };
    };
    handleRoute10 = async (_, noCache) => {
      const listData = await getList10(noCache);
      const routeData = {
        name: "douban-group",
        title: "\u8C46\u74E3\u8BA8\u8BBA",
        type: "\u8BA8\u8BBA\u7CBE\u9009",
        link: "https://www.douban.com/group/explore",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getNumbers = (text) => {
      if (!text) return 1e8;
      const regex = /\d+/;
      const match = text.match(regex);
      if (match) {
        return Number(match[0]);
      } else {
        return 1e8;
      }
    };
    getList10 = async (noCache) => {
      const url = `https://www.douban.com/group/explore`;
      const result = await get({ url, noCache });
      const $ = load(result.data);
      const listDom = $(".article .channel-item");
      const listData = listDom.toArray().map((item) => {
        const dom = $(item);
        const url2 = dom.find("h3 a").attr("href") || void 0;
        return {
          id: getNumbers(url2),
          title: dom.find("h3 a").text().trim(),
          cover: dom.find(".pic-wrap img").attr("src"),
          desc: dom.find(".block p").text().trim(),
          timestamp: getTime(dom.find("span.pubtime").text().trim()),
          hot: 0,
          url: url2 || `https://www.douban.com/group/topic/${getNumbers(url2)}`,
          mobileUrl: `https://m.douban.com/group/topic/${getNumbers(url2)}/`
        };
      });
      return {
        ...result,
        data: listData
      };
    };
    handleRoute11 = async (_, noCache) => {
      const listData = await getList11(noCache);
      const routeData = {
        name: "douban-movie",
        title: "\u8C46\u74E3\u7535\u5F71",
        type: "\u65B0\u7247\u699C",
        link: "https://movie.douban.com/chart",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getNumbers2 = (text) => {
      if (!text) return 0;
      const regex = /\d+/;
      const match = text.match(regex);
      if (match) {
        return Number(match[0]);
      } else {
        return 0;
      }
    };
    getList11 = async (noCache) => {
      const url = `https://movie.douban.com/chart/`;
      const result = await get({
        url,
        noCache,
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
        }
      });
      const $ = load2(result.data);
      const listDom = $(".article tr.item");
      const listData = listDom.toArray().map((item) => {
        const dom = $(item);
        const url2 = dom.find("a").attr("href") || void 0;
        const scoreDom = dom.find(".rating_nums");
        const score = scoreDom.length > 0 ? scoreDom.text() : "0.0";
        return {
          id: getNumbers2(url2),
          title: `\u3010${score}\u3011${dom.find("a").attr("title")}`,
          cover: dom.find("img").attr("src"),
          desc: dom.find("p.pl").text(),
          timestamp: void 0,
          hot: getNumbers2(dom.find("span.pl").text()),
          url: url2 || `https://movie.douban.com/subject/${getNumbers2(url2)}/`,
          mobileUrl: `https://m.douban.com/movie/subject/${getNumbers2(url2)}/`
        };
      });
      return {
        ...result,
        data: listData
      };
    };
    handleRoute12 = async (_, noCache) => {
      const listData = await getList12(noCache);
      const routeData = {
        name: "douyin",
        title: "\u6296\u97F3",
        type: "\u70ED\u699C",
        description: "\u5B9E\u65F6\u4E0A\u5347\u70ED\u70B9",
        link: "https://www.douyin.com",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getDyCookies = async () => {
      try {
        const cookisUrl = "https://www.douyin.com/passport/general/login_guiding_strategy/?aid=6383";
        const { data } = await get({ url: cookisUrl, originaInfo: true });
        const pattern = /passport_csrf_token=(.*); Path/s;
        const matchResult = data.headers["set-cookie"][0].match(pattern);
        const cookieData = matchResult[1];
        return cookieData;
      } catch (error) {
        console.error("\u83B7\u53D6\u6296\u97F3 Cookie \u51FA\u9519" + error);
        return void 0;
      }
    };
    getList12 = async (noCache) => {
      const url = "https://www.douyin.com/aweme/v1/web/hot/search/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&detail_list=1";
      const cookie = await getDyCookies();
      const result = await get({
        url,
        noCache,
        headers: {
          Cookie: `passport_csrf_token=${cookie}`
        }
      });
      const list = result.data.data.word_list;
      return {
        ...result,
        data: list.map((v) => ({
          id: v.sentence_id,
          title: v.word,
          timestamp: getTime(v.event_time),
          hot: v.hot_value,
          url: `https://www.douyin.com/hot/${v.sentence_id}`,
          mobileUrl: `https://www.douyin.com/hot/${v.sentence_id}`
        }))
      };
    };
    mappings = {
      O_TIME: "\u53D1\u9707\u65F6\u523B(UTC+8)",
      LOCATION_C: "\u53C2\u8003\u4F4D\u7F6E",
      M: "\u9707\u7EA7(M)",
      EPI_LAT: "\u7EAC\u5EA6(\xB0)",
      EPI_LON: "\u7ECF\u5EA6(\xB0)",
      EPI_DEPTH: "\u6DF1\u5EA6(\u5343\u7C73)",
      SAVE_TIME: "\u5F55\u5165\u65F6\u95F4"
    };
    handleRoute13 = async (_, noCache) => {
      const listData = await getList13(noCache);
      const routeData = {
        name: "earthquake",
        title: "\u4E2D\u56FD\u5730\u9707\u53F0",
        type: "\u5730\u9707\u901F\u62A5",
        link: "https://news.ceic.ac.cn/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList13 = async (noCache) => {
      const url = `https://news.ceic.ac.cn/speedsearch.html`;
      const result = await get({ url, noCache });
      const regex = /const newdata = (\[.*?\]);/s;
      const match = result.data.match(regex);
      const list = match && match[1] ? JSON.parse(match[1]) : [];
      return {
        ...result,
        data: list.map((v) => {
          const contentBuilder = [];
          const { NEW_DID, LOCATION_C, M } = v;
          for (const mappingsKey in mappings) {
            contentBuilder.push(
              `${mappings[mappingsKey]}\uFF1A${v[mappingsKey]}`
            );
          }
          return {
            id: NEW_DID,
            title: `${LOCATION_C}\u53D1\u751F${M}\u7EA7\u5730\u9707`,
            desc: contentBuilder.join("\n"),
            timestamp: getTime(v["O_TIME"]),
            hot: void 0,
            url: `https://news.ceic.ac.cn/${NEW_DID}.html`,
            mobileUrl: `https://news.ceic.ac.cn/${NEW_DID}.html`
          };
        })
      };
    };
    handleRoute14 = async (_, noCache) => {
      const listData = await getList14(noCache);
      const routeData = {
        name: "gameres",
        title: "GameRes \u6E38\u8D44\u7F51",
        type: "\u6700\u65B0\u8D44\u8BAF",
        description: "\u9762\u5411\u6E38\u620F\u4ECE\u4E1A\u8005\u7684\u6E38\u620F\u5F00\u53D1\u8D44\u8BAF\uFF0C\u65E8\u5728\u4E3A\u6E38\u620F\u5236\u4F5C\u4EBA\u63D0\u4F9B\u6E38\u620F\u7814\u53D1\u7C7B\u7684\u7A0B\u5E8F\u6280\u672F\u3001\u7B56\u5212\u8BBE\u8BA1\u3001\u827A\u672F\u8BBE\u8BA1\u3001\u539F\u521B\u8BBE\u8BA1\u7B49\u8D44\u8BAF\u5185\u5BB9\u3002",
        link: "https://www.gameres.com",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList14 = async (noCache) => {
      const url = `https://www.gameres.com`;
      const result = await get({ url, noCache });
      const $ = load3(result.data);
      const container = $('div[data-news-pane-id="100000"]');
      const listDom = container.find("article.feed-item");
      const listData = Array.from(listDom).map((el) => {
        const dom = $(el);
        const titleEl = dom.find(".feed-item-title-a").first();
        const title = titleEl.text().trim();
        const href = titleEl.attr("href");
        const url2 = href?.startsWith("http") ? href : `https://www.gameres.com${href ?? ""}`;
        const cover = dom.find(".thumb").attr("data-original") || "";
        const desc = dom.find(".feed-item-right > p").first().text().trim();
        const dateTime = dom.find(".mark-info").contents().first().text().trim();
        const timestamp = getTime(dateTime);
        const hot = void 0;
        return {
          title,
          desc,
          cover,
          timestamp,
          hot,
          url: url2,
          id: url2,
          mobileUrl: url2
        };
      });
      return {
        ...result,
        data: listData
      };
    };
    handleRoute15 = async (_, noCache) => {
      const listData = await getList15(noCache);
      const routeData = {
        name: "geekpark",
        title: "\u6781\u5BA2\u516C\u56ED",
        type: "\u70ED\u95E8\u6587\u7AE0",
        description: "\u6781\u5BA2\u516C\u56ED\u805A\u7126\u4E92\u8054\u7F51\u9886\u57DF\uFF0C\u8DDF\u8E2A\u65B0\u9C9C\u7684\u79D1\u6280\u65B0\u95FB\u52A8\u6001\uFF0C\u5173\u6CE8\u6781\u5177\u521B\u65B0\u7CBE\u795E\u7684\u79D1\u6280\u4EA7\u54C1\u3002",
        link: "https://www.geekpark.net/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList15 = async (noCache) => {
      const url = `https://mainssl.geekpark.net/api/v2`;
      const result = await get({ url, noCache });
      const list = result.data.homepage_posts;
      return {
        ...result,
        data: list.map((v) => {
          const post2 = v.post;
          return {
            id: post2.id,
            title: post2.title,
            desc: post2.abstract,
            cover: post2.cover_url,
            author: post2?.authors?.[0]?.nickname,
            hot: post2.views,
            timestamp: getTime(post2.published_timestamp),
            url: `https://www.geekpark.net/news/${post2.id}`,
            mobileUrl: `https://www.geekpark.net/news/${post2.id}`
          };
        })
      };
    };
    handleRoute16 = async (c, noCache) => {
      const type = c.req.query("type") || "1";
      const listData = await getList16({ type }, noCache);
      const routeData = {
        name: "genshin",
        title: "\u539F\u795E",
        type: "\u6700\u65B0\u52A8\u6001",
        params: {
          type: {
            name: "\u699C\u5355\u5206\u7C7B",
            type: {
              1: "\u516C\u544A",
              2: "\u6D3B\u52A8",
              3: "\u8D44\u8BAF"
            }
          }
        },
        link: "https://www.miyoushe.com/ys/home/28",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList16 = async (options, noCache) => {
      const { type } = options;
      const url = `https://bbs-api-static.miyoushe.com/painter/wapi/getNewsList?client_type=4&gids=2&last_id=&page_size=20&type=${type}`;
      const result = await get({ url, noCache });
      const list = result.data.data.list;
      return {
        ...result,
        data: list.map((v) => {
          const data = v.post;
          return {
            id: data.post_id,
            title: data.subject,
            desc: data.content,
            cover: data.cover || data?.images?.[0],
            author: v.user?.nickname || void 0,
            timestamp: getTime(data.created_at),
            hot: data.view_status,
            url: `https://www.miyoushe.com/ys/article/${data.post_id}`,
            mobileUrl: `https://m.miyoushe.com/ys/#/article/${data.post_id}`
          };
        })
      };
    };
    typeMap6 = {
      daily: "\u65E5\u699C",
      weekly: "\u5468\u699C",
      monthly: "\u6708\u699C"
    };
    handleRoute17 = async (c) => {
      const typeParam = c.req.query("type") || "daily";
      const type = isTrendingType(typeParam) ? typeParam : "daily";
      const listData = await getTrendingRepos(type);
      const routeData = {
        name: "github",
        title: "github \u8D8B\u52BF",
        type: typeMap6[type],
        params: {
          type: {
            name: "\u6392\u884C\u699C\u5206\u533A",
            type: typeMap6
          }
        },
        link: `https://github.com/trending?since=${type}`,
        total: listData?.data?.length || 0,
        ...{
          ...listData,
          data: listData?.data?.map((v, index) => {
            return {
              id: index,
              title: v.repo,
              desc: v.description,
              hot: v.stars,
              ...v
            };
          })
        }
      };
      return routeData;
    };
    handleRoute18 = async (_, noCache) => {
      const listData = await getList17(noCache);
      const routeData = {
        name: "guokr",
        title: "\u679C\u58F3",
        type: "\u70ED\u95E8\u6587\u7AE0",
        description: "\u79D1\u6280\u6709\u610F\u601D",
        link: "https://www.guokr.com/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList17 = async (noCache) => {
      const url = `https://www.guokr.com/beta/proxy/science_api/articles?limit=30`;
      const result = await get({
        url,
        noCache,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0"
        }
      });
      const list = result.data;
      return {
        ...result,
        data: list.map((v) => ({
          id: v.id,
          title: v.title,
          desc: v.summary,
          cover: v.small_image,
          author: v.author?.nickname,
          hot: void 0,
          timestamp: getTime(v.date_modified),
          url: `https://www.guokr.com/article/${v.id}`,
          mobileUrl: `https://m.guokr.com/article/${v.id}`
        }))
      };
    };
    handleRoute19 = async (_, noCache) => {
      const listData = await getList18(noCache);
      const routeData = {
        name: "hackernews",
        title: "Hacker News",
        type: "Popular",
        description: "News about hacking and startups",
        link: "https://news.ycombinator.com/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList18 = async (noCache) => {
      const baseUrl = "https://news.ycombinator.com";
      const result = await get({
        url: baseUrl,
        noCache,
        headers: {
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      });
      try {
        const $ = load5(result.data);
        const stories = [];
        $(".athing").each((_, el) => {
          const item = $(el);
          const id = item.attr("id") || "";
          const title = item.find(".titleline a").first().text().trim();
          const url = item.find(".titleline a").first().attr("href");
          const scoreText = $(`#score_${id}`).text().match(/\d+/)?.[0];
          const hot = scoreText ? parseInt(scoreText, 10) : void 0;
          if (id && title) {
            stories.push({
              id,
              title,
              hot,
              timestamp: void 0,
              url: url || `${baseUrl}/item?id=${id}`,
              mobileUrl: url || `${baseUrl}/item?id=${id}`
            });
          }
        });
        return {
          ...result,
          data: stories
        };
      } catch (error) {
        throw new Error(`Failed to parse HackerNews HTML: ${error}`);
      }
    };
    handleRoute20 = async (c, noCache) => {
      const sort = c.req.query("sort") || "featured";
      const listData = await getList19({ sort }, noCache);
      const routeData = {
        name: "hellogithub",
        title: "HelloGitHub",
        type: "\u70ED\u95E8\u4ED3\u5E93",
        description: "\u5206\u4EAB GitHub \u4E0A\u6709\u8DA3\u3001\u5165\u95E8\u7EA7\u7684\u5F00\u6E90\u9879\u76EE",
        params: {
          sort: {
            name: "\u6392\u884C\u699C\u5206\u533A",
            type: {
              featured: "\u7CBE\u9009",
              all: "\u5168\u90E8"
            }
          }
        },
        link: "https://hellogithub.com/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList19 = async (options, noCache) => {
      const { sort } = options;
      const url = `https://abroad.hellogithub.com/v1/?sort_by=${sort}&tid=&page=1`;
      const result = await get({ url, noCache });
      const list = result.data.data;
      return {
        ...result,
        data: list.map((v) => ({
          id: v.item_id,
          title: v.title,
          desc: v.summary,
          author: v.author,
          timestamp: getTime(v.updated_at),
          hot: v.clicks_total,
          url: `https://hellogithub.com/repository/${v.item_id}`,
          mobileUrl: `https://hellogithub.com/repository/${v.item_id}`
        }))
      };
    };
    handleRoute21 = async (c, noCache) => {
      const day = c.req.query("day") || getCurrentDateTime(true).day;
      const month = c.req.query("month") || getCurrentDateTime(true).month;
      const listData = await getList20({ month, day }, noCache);
      const routeData = {
        name: "history",
        title: "\u5386\u53F2\u4E0A\u7684\u4ECA\u5929",
        type: `${month}-${day}`,
        params: {
          month: "\u6708\u4EFD",
          day: "\u65E5\u671F"
        },
        link: "https://baike.baidu.com/calendar",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList20 = async (options, noCache) => {
      const { month, day } = options;
      const monthStr = month?.toString().padStart(2, "0");
      const dayStr = day?.toString().padStart(2, "0");
      const url = `https://baike.baidu.com/cms/home/eventsOnHistory/${monthStr}.json`;
      const result = await get({
        url,
        noCache,
        params: {
          _: (/* @__PURE__ */ new Date()).getTime()
        }
      });
      const list = monthStr ? result.data[monthStr][monthStr + dayStr] : [];
      return {
        ...result,
        data: list.map((v, index) => ({
          id: index,
          title: load6(v.title).text().trim(),
          cover: v.cover ? v.pic_share : void 0,
          desc: load6(v.desc).text().trim(),
          year: v.year,
          timestamp: void 0,
          hot: void 0,
          url: v.link,
          mobileUrl: v.link
        }))
      };
    };
    handleRoute22 = async (c, noCache) => {
      const type = c.req.query("type") || "1";
      const listData = await getList21({ type }, noCache);
      const routeData = {
        name: "honkai",
        title: "\u5D29\u574F3",
        type: "\u6700\u65B0\u52A8\u6001",
        params: {
          type: {
            name: "\u699C\u5355\u5206\u7C7B",
            type: {
              1: "\u516C\u544A",
              2: "\u6D3B\u52A8",
              3: "\u8D44\u8BAF"
            }
          }
        },
        link: "https://www.miyoushe.com/bh3/home/6",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList21 = async (options, noCache) => {
      const { type } = options;
      const url = `https://bbs-api-static.miyoushe.com/painter/wapi/getNewsList?client_type=4&gids=1&last_id=&page_size=20&type=${type}`;
      const result = await get({ url, noCache });
      const list = result.data.data.list;
      return {
        ...result,
        data: list.map((v) => {
          const data = v.post;
          return {
            id: data.post_id,
            title: data.subject,
            desc: data.content,
            cover: data.cover || data?.images?.[0],
            author: v.user?.nickname || void 0,
            timestamp: getTime(data.created_at),
            hot: data.view_status,
            url: `https://www.miyoushe.com/bh3/article/${data.post_id}`,
            mobileUrl: `https://m.miyoushe.com/bh3/#/article/${data.post_id}`
          };
        })
      };
    };
    typeMap7 = {
      hot: "\u6700\u65B0\u70ED\u95E8",
      digest: "\u6700\u65B0\u7CBE\u534E",
      new: "\u6700\u65B0\u56DE\u590D",
      newthread: "\u6700\u65B0\u53D1\u8868"
    };
    handleRoute23 = async (c, noCache) => {
      const type = c.req.query("type") || "hot";
      const listData = await getList22({ type }, noCache);
      const routeData = {
        name: "hostloc",
        title: "\u5168\u7403\u4E3B\u673A\u4EA4\u6D41",
        type: typeMap7[type],
        params: {
          type: {
            name: "\u699C\u5355\u5206\u7C7B",
            type: typeMap7
          }
        },
        link: "https://hostloc.com/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList22 = async (options, noCache) => {
      const { type } = options;
      const url = `https://hostloc.com/forum.php?mod=guide&view=${type}&rss=1`;
      const result = await get({
        url,
        noCache,
        headers: {
          userAgent: "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36"
        }
      });
      const list = await parseRSS(result.data);
      return {
        ...result,
        data: list.map((v, i) => ({
          id: v.guid || i,
          title: v.title || "",
          desc: v.content || "",
          author: v.author || "",
          timestamp: getTime(v.pubDate || 0),
          hot: void 0,
          url: v.link || "",
          mobileUrl: v.link || ""
        }))
      };
    };
    handleRoute24 = async (c, noCache) => {
      const type = c.req.query("type") || "1";
      const listData = await getList23({ type }, noCache);
      const routeData = {
        name: "hupu",
        title: "\u864E\u6251",
        type: "\u6B65\u884C\u8857\u70ED\u5E16",
        params: {
          type: {
            name: "\u699C\u5355\u5206\u7C7B",
            type: {
              1: "\u4E3B\u5E72\u9053",
              6: "\u604B\u7231\u533A",
              11: "\u6821\u56ED\u533A",
              12: "\u5386\u53F2\u533A",
              612: "\u6444\u5F71\u533A"
            }
          }
        },
        link: "https://bbs.hupu.com/all-gambia",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList23 = async (options, noCache) => {
      const { type } = options;
      const url = `https://m.hupu.com/api/v2/bbs/topicThreads?topicId=${type}&page=1`;
      const result = await get({ url, noCache });
      const list = result.data.data.topicThreads;
      return {
        ...result,
        data: list.map((v) => ({
          id: v.tid,
          title: v.title,
          author: v.username,
          hot: v.replies,
          timestamp: void 0,
          url: `https://bbs.hupu.com/${v.tid}.html`,
          mobileUrl: v.url
        }))
      };
    };
    handleRoute25 = async (_, noCache) => {
      const listData = await getList24(noCache);
      const routeData = {
        name: "huxiu",
        title: "\u864E\u55C5",
        type: "24\u5C0F\u65F6",
        link: "https://www.huxiu.com/moment/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList24 = async (noCache) => {
      const url = `https://moment-api.huxiu.com/web-v3/moment/feed?platform=www`;
      const res = await axios2.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Referer: "https://www.huxiu.com/moment/"
        },
        timeout: 1e4
      });
      const list = res.data?.data?.moment_list?.datalist || [];
      return {
        fromCache: false,
        updateTime: (/* @__PURE__ */ new Date()).toISOString(),
        data: list.map((v) => {
          const content = (v.content || "").replace(/<br\s*\/?>/gi, "\n");
          const [titleLine, ...rest] = content.split("\n").map((s) => s.trim()).filter(Boolean);
          const title = titleLine?.replace(/。$/, "") || "";
          const intro = rest.join("\n");
          const momentId = v.object_id;
          return {
            id: momentId,
            title,
            desc: intro,
            author: v.user_info?.username || "",
            timestamp: getTime(v.publish_time),
            hot: v.count_info?.agree_num,
            url: `https://www.huxiu.com/moment/${momentId}.html`,
            mobileUrl: `https://m.huxiu.com/moment/${momentId}.html`
          };
        })
      };
    };
    handleRoute26 = async (_, noCache) => {
      const listData = await getList25(noCache);
      const routeData = {
        name: "ifanr",
        title: "\u7231\u8303\u513F",
        type: "\u5FEB\u8BAF",
        description: "15\u79D2\u4E86\u89E3\u5168\u7403\u65B0\u9C9C\u4E8B",
        link: "https://www.ifanr.com/digest/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList25 = async (noCache) => {
      const url = "https://sso.ifanr.com/api/v5/wp/buzz/?limit=20&offset=0";
      const result = await get({ url, noCache });
      const list = result.data.objects;
      return {
        ...result,
        data: list.map((v) => ({
          id: v.id,
          title: v.post_title,
          desc: v.post_content,
          timestamp: getTime(v.created_at),
          hot: v.like_count || v.comment_count,
          url: v.buzz_original_url || `https://www.ifanr.com/${v.post_id}`,
          mobileUrl: v.buzz_original_url || `https://www.ifanr.com/digest/${v.post_id}`
        }))
      };
    };
    handleRoute27 = async (_, noCache) => {
      const listData = await getList26(noCache);
      const routeData = {
        name: "ithome-xijiayi",
        title: "IT\u4E4B\u5BB6\u300C\u559C\u52A0\u4E00\u300D",
        type: "\u6700\u65B0\u52A8\u6001",
        description: "\u6700\u65B0\u6700\u5168\u7684\u300C\u559C\u52A0\u4E00\u300D\u6E38\u620F\u52A8\u6001\u5C3D\u5728\u8FD9\u91CC\uFF01",
        link: "https://www.ithome.com/zt/xijiayi",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    replaceLink = (url, getId = false) => {
      const match = url.match(/https:\/\/www\.ithome\.com\/0\/(\d+)\/(\d+)\.htm/);
      if (match && match[1] && match[2]) {
        return getId ? match[1] + match[2] : `https://m.ithome.com/html/${match[1]}${match[2]}.htm`;
      }
      return url;
    };
    getList26 = async (noCache) => {
      const url = `https://www.ithome.com/zt/xijiayi`;
      const result = await get({ url, noCache });
      const $ = load7(result.data);
      const listDom = $(".newslist li");
      const listData = listDom.toArray().map((item) => {
        const dom = $(item);
        const href = dom.find("a").attr("href");
        const time = dom.find("span.time").text().trim();
        const match = time.match(/'([^']+)'/);
        const dateTime = match ? match[1] : void 0;
        return {
          id: href ? Number(replaceLink(href, true)) : 1e5,
          title: dom.find(".newsbody h2").text().trim(),
          desc: dom.find(".newsbody p").text().trim(),
          cover: dom.find("img").attr("data-original"),
          timestamp: getTime(dateTime || 0),
          hot: Number(dom.find(".comment").text().replace(/\D/g, "")),
          url: href || "",
          mobileUrl: href ? replaceLink(href) : ""
        };
      });
      return {
        ...result,
        data: listData
      };
    };
    handleRoute28 = async (_, noCache) => {
      const listData = await getList27(noCache);
      const routeData = {
        name: "ithome",
        title: "IT\u4E4B\u5BB6",
        type: "\u70ED\u699C",
        description: "\u7231\u79D1\u6280\uFF0C\u7231\u8FD9\u91CC - \u524D\u6CBF\u79D1\u6280\u65B0\u95FB\u7F51\u7AD9",
        link: "https://m.ithome.com/rankm/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    replaceLink2 = (url, getId = false) => {
      const match = url.match(/[html|live]\/(\d+)\.htm/);
      if (match && match[1]) {
        return getId ? match[1] : `https://www.ithome.com/0/${match[1].slice(0, 3)}/${match[1].slice(3)}.htm`;
      }
      return url;
    };
    getList27 = async (noCache) => {
      const url = `https://m.ithome.com/rankm/`;
      const result = await get({ url, noCache });
      const $ = load8(result.data);
      const listDom = $(".rank-box .placeholder");
      const listData = listDom.toArray().map((item) => {
        const dom = $(item);
        const href = dom.find("a").attr("href");
        return {
          id: href ? Number(replaceLink2(href, true)) : 1e5,
          title: dom.find(".plc-title").text().trim(),
          cover: dom.find("img").attr("data-original"),
          timestamp: getTime(dom.find("span.post-time").text().trim()),
          hot: Number(dom.find(".review-num").text().replace(/\D/g, "")),
          url: href ? replaceLink2(href) : "",
          mobileUrl: href ? replaceLink2(href) : ""
        };
      });
      return {
        ...result,
        data: listData
      };
    };
    handleRoute29 = async (_, noCache) => {
      const listData = await getList28(noCache);
      const routeData = {
        name: "jianshu",
        title: "\u7B80\u4E66",
        type: "\u70ED\u95E8\u63A8\u8350",
        description: "\u4E00\u4E2A\u4F18\u8D28\u7684\u521B\u4F5C\u793E\u533A",
        link: "https://www.jianshu.com/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getID = (url) => {
      if (!url) return "undefined";
      const match = url.match(/([^/]+)$/);
      return match ? match[1] : "undefined";
    };
    getList28 = async (noCache) => {
      const url = `https://www.jianshu.com/`;
      const result = await get({
        url,
        noCache,
        headers: {
          Referer: "https://www.jianshu.com"
        }
      });
      const $ = load9(result.data);
      const listDom = $("ul.note-list li");
      const listData = listDom.toArray().map((item) => {
        const dom = $(item);
        const href = dom.find("a").attr("href") || "";
        return {
          id: getID(href),
          title: dom.find("a.title").text()?.trim(),
          cover: dom.find("img").attr("src"),
          desc: dom.find("p.abstract").text()?.trim(),
          author: dom.find("a.nickname").text()?.trim(),
          hot: void 0,
          timestamp: void 0,
          url: `https://www.jianshu.com${href}`,
          mobileUrl: `https://www.jianshu.com${href}`
        };
      });
      return {
        ...result,
        data: listData
      };
    };
    headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Sec-Ch-Ua": '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1"
    };
    category_url = "https://api.juejin.cn/tag_api/v1/query_category_briefs";
    getCategory = async () => {
      const res = await get({
        url: category_url,
        headers
      });
      const data = res?.data?.data || [];
      const typeObj = {};
      typeObj["1"] = "\u7EFC\u5408";
      data.forEach((c) => {
        typeObj[c.category_id] = c.category_name;
      });
      return typeObj;
    };
    handleRoute30 = async (c, noCache) => {
      const type = c.req.query("type") || 1;
      const listData = await getList29(noCache, type);
      const typeMaps = await getCategory();
      const routeData = {
        name: "juejin",
        title: "\u7A00\u571F\u6398\u91D1",
        type: "\u6587\u7AE0\u699C",
        params: {
          type: {
            name: "\u6392\u884C\u699C\u5206\u533A",
            type: typeMaps
          }
        },
        link: "https://juejin.cn/hot/articles",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList29 = async (noCache, type = 1) => {
      const url = `https://api.juejin.cn/content_api/v1/content/article_rank?category_id=${type}&type=hot`;
      const result = await get({ url, noCache, headers });
      const list = result.data.data;
      return {
        ...result,
        data: list.map((v) => ({
          id: v.content.content_id,
          title: v.content.title,
          author: v.author.name,
          hot: v.content_counter.hot_rank,
          timestamp: void 0,
          url: `https://juejin.cn/post/${v.content.content_id}`,
          mobileUrl: `https://juejin.cn/post/${v.content.content_id}`
        }))
      };
    };
    parseChineseNumber = (chineseNumber) => {
      const units = {
        \u4EBF: 1e8,
        \u4E07: 1e4,
        \u5343: 1e3,
        \u767E: 100
      };
      for (const unit in units) {
        if (chineseNumber.includes(unit)) {
          const numberPart = parseFloat(chineseNumber.replace(unit, ""));
          return numberPart * units[unit];
        }
      }
      return parseFloat(chineseNumber);
    };
    APOLLO_STATE_PREFIX = "window.__APOLLO_STATE__=";
    handleRoute31 = async (_, noCache) => {
      const listData = await getList30(noCache);
      const routeData = {
        name: "kuaishou",
        title: "\u5FEB\u624B",
        type: "\u70ED\u699C",
        description: "\u5FEB\u624B\uFF0C\u62E5\u62B1\u6BCF\u4E00\u79CD\u751F\u6D3B",
        link: "https://www.kuaishou.com/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList30 = async (noCache) => {
      const url = `https://www.kuaishou.com/?isHome=1`;
      const userAgent = new UserAgent({
        deviceCategory: "desktop"
      });
      const result = await get({
        url,
        noCache,
        headers: {
          "User-Agent": userAgent.toString()
        }
      });
      const listData = [];
      const html4 = result.data || "";
      const start = html4.indexOf(APOLLO_STATE_PREFIX);
      if (start === -1) {
        throw new Error("\u5FEB\u624B\u9875\u9762\u7ED3\u6784\u53D8\u66F4\uFF0C\u672A\u627E\u5230 APOLLO_STATE");
      }
      const scriptSlice = html4.slice(start + APOLLO_STATE_PREFIX.length);
      const sentinelA = scriptSlice.indexOf(";(function(");
      const sentinelB = scriptSlice.indexOf("</script>");
      const cutIndex = sentinelA !== -1 && sentinelB !== -1 ? Math.min(sentinelA, sentinelB) : Math.max(sentinelA, sentinelB);
      if (cutIndex === -1) {
        throw new Error("\u5FEB\u624B\u9875\u9762\u7ED3\u6784\u53D8\u66F4\uFF0C\u672A\u627E\u5230 APOLLO_STATE \u7ED3\u675F\u6807\u8BB0");
      }
      const raw = scriptSlice.slice(0, cutIndex).trim().replace(/;$/, "");
      let jsonObject;
      try {
        const lastBrace = raw.lastIndexOf("}");
        const cleanRaw = lastBrace !== -1 ? raw.slice(0, lastBrace + 1) : raw;
        jsonObject = JSON.parse(cleanRaw)["defaultClient"];
      } catch (err) {
        const msg = err instanceof Error ? `${err.message} | snippet=${raw.slice(0, 200)}...` : "\u672A\u77E5\u9519\u8BEF";
        throw new Error(`\u5FEB\u624B\u6570\u636E\u89E3\u6790\u5931\u8D25: ${msg}`);
      }
      const allItems = jsonObject['$ROOT_QUERY.visionHotRank({"page":"home"})']?.items || jsonObject['$ROOT_QUERY.visionHotRank({"page":"home","platform":"web"})']?.items || [];
      allItems.forEach((item) => {
        const hotItem = jsonObject[item.id];
        if (!hotItem) return;
        const id = hotItem.photoIds?.json?.[0];
        const hotValue = hotItem.hotValue ?? "";
        const poster = hotItem.poster ? decodeURIComponent(hotItem.poster) : void 0;
        listData.push({
          id: hotItem.id,
          title: hotItem.name,
          cover: poster,
          hot: parseChineseNumber(String(hotValue)),
          timestamp: void 0,
          url: `https://www.kuaishou.com/short-video/${id}`,
          mobileUrl: `https://www.kuaishou.com/short-video/${id}`
        });
      });
      return {
        ...result,
        data: listData
      };
    };
    handleRoute32 = async (_, noCache) => {
      const listData = await getList31(noCache);
      const routeData = {
        name: "linuxdo",
        title: "Linux.do",
        type: "\u70ED\u95E8\u6587\u7AE0",
        description: "Linux \u6280\u672F\u793E\u533A\u70ED\u641C",
        link: "https://linux.do/top/weekly",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList31 = async (noCache) => {
      const url = "https://linux.do/top.rss?period=weekly";
      const result = await get({
        url,
        noCache,
        headers: {
          "Accept": "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
        }
      });
      const items = await parseRSS(result.data);
      const list = items.map((item, index) => {
        const link = item.link || "";
        return {
          id: item.guid || link || index,
          title: item.title || "",
          desc: item.contentSnippet?.trim() || item.content?.trim() || "",
          author: item.author,
          timestamp: getTime(item.pubDate || 0),
          url: link,
          mobileUrl: link,
          hot: void 0
        };
      });
      return {
        ...result,
        data: list
      };
    };
    handleRoute33 = async (_, noCache) => {
      const listData = await getList32(noCache);
      const routeData = {
        name: "lol",
        title: "\u82F1\u96C4\u8054\u76DF",
        type: "\u66F4\u65B0\u516C\u544A",
        link: "https://lol.qq.com/gicp/news/423/2/1334/1.html",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList32 = async (noCache) => {
      const url = "https://apps.game.qq.com/cmc/zmMcnTargetContentList?r0=json&page=1&num=30&target=24&source=web_pc";
      const result = await get({ url, noCache });
      const list = result.data.data.result;
      return {
        ...result,
        data: list.map((v) => ({
          id: v.iDocID,
          title: v.sTitle,
          cover: `https:${v.sIMG}`,
          author: v.sAuthor,
          hot: Number(v.iTotalPlay),
          timestamp: getTime(v.sCreated),
          url: `https://lol.qq.com/news/detail.shtml?docid=${encodeURIComponent(v.iDocID)}`,
          mobileUrl: `https://lol.qq.com/news/detail.shtml?docid=${encodeURIComponent(v.iDocID)}`
        }))
      };
    };
    gameMap = {
      "1": "\u5D29\u574F3",
      "2": "\u539F\u795E",
      "3": "\u5D29\u574F\u5B66\u56ED2",
      "4": "\u672A\u5B9A\u4E8B\u4EF6\u7C3F",
      "5": "\u5927\u522B\u91CE",
      "6": "\u5D29\u574F\uFF1A\u661F\u7A79\u94C1\u9053",
      "7": "\u6682\u65E0",
      "8": "\u7EDD\u533A\u96F6"
    };
    typeMap8 = {
      "1": "\u516C\u544A",
      "2": "\u6D3B\u52A8",
      "3": "\u8D44\u8BAF"
    };
    handleRoute34 = async (c, noCache) => {
      const game = c.req.query("game") || "1";
      const type = c.req.query("type") || "1";
      const listData = await getList33({ game, type }, noCache);
      const routeData = {
        name: "miyoushe",
        title: `\u7C73\u6E38\u793E \xB7 ${gameMap[game]}`,
        type: `\u6700\u65B0${typeMap8[type]}`,
        params: {
          game: {
            name: "\u6E38\u620F\u5206\u7C7B",
            type: gameMap
          },
          type: {
            name: "\u699C\u5355\u5206\u7C7B",
            type: typeMap8
          }
        },
        link: "https://www.miyoushe.com/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList33 = async (options, noCache) => {
      const { game, type } = options;
      const url = `https://bbs-api-static.miyoushe.com/painter/wapi/getNewsList?client_type=4&gids=${game}&last_id=&page_size=30&type=${type}`;
      const result = await get({ url, noCache });
      const list = result.data.data.list;
      return {
        ...result,
        data: list.map((v) => {
          const data = v.post;
          return {
            id: data.post_id,
            title: data.subject,
            desc: data.content,
            cover: data.cover || data?.images?.[0],
            author: v.user?.nickname || void 0,
            timestamp: getTime(data.created_at),
            hot: data.view_status || 0,
            url: `https://www.miyoushe.com/ys/article/${data.post_id}`,
            mobileUrl: `https://m.miyoushe.com/ys/#/article/${data.post_id}`
          };
        })
      };
    };
    handleRoute35 = async (_, noCache) => {
      const listData = await getList34(noCache);
      const routeData = {
        name: "netease-news",
        title: "\u7F51\u6613\u65B0\u95FB",
        type: "\u70ED\u70B9\u699C",
        link: "https://m.163.com/hot",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList34 = async (noCache) => {
      const url = `https://m.163.com/fe/api/hot/news/flow`;
      const result = await get({ url, noCache });
      const list = result.data.data.list;
      return {
        ...result,
        data: list.map((v) => ({
          id: v.docid,
          title: v.title,
          cover: v.imgsrc,
          author: v.source,
          hot: void 0,
          timestamp: getTime(v.ptime),
          url: `https://www.163.com/dy/article/${v.docid}.html`,
          mobileUrl: `https://m.163.com/dy/article/${v.docid}.html`
        }))
      };
    };
    handleRoute36 = async (_, noCache) => {
      const listData = await getList35(noCache);
      const routeData = {
        name: "newsmth",
        title: "\u6C34\u6728\u793E\u533A",
        type: "\u70ED\u95E8\u8BDD\u9898",
        description: "\u6C34\u6728\u793E\u533A\u662F\u4E00\u4E2A\u6E90\u4E8E\u6E05\u534E\u7684\u9AD8\u77E5\u793E\u7FA4\u3002",
        link: "https://www.newsmth.net/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList35 = async (noCache) => {
      const url = `https://wap.newsmth.net/wap/api/hot/global`;
      const result = await get({ url, noCache });
      const list = result.data.data.topics;
      return {
        ...result,
        data: list.map((v) => {
          const post2 = v.article;
          const url2 = `https://wap.newsmth.net/article/${post2.topicId}?title=${v.board?.title}&from=home`;
          return {
            id: v.firstArticleId,
            title: post2.subject,
            desc: post2.body,
            cover: void 0,
            author: post2?.account?.name,
            hot: void 0,
            timestamp: getTime(post2.postTime),
            url: url2,
            mobileUrl: url2
          };
        })
      };
    };
    handleRoute37 = async (_, noCache) => {
      const listData = await getList36(noCache);
      const routeData = {
        name: "ngabbs",
        title: "NGA",
        type: "\u8BBA\u575B\u70ED\u5E16",
        description: "\u7CBE\u82F1\u73A9\u5BB6\u4FF1\u4E50\u90E8",
        link: "https://ngabbs.com/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList36 = async (noCache) => {
      const url = `https://ngabbs.com/nuke.php?__lib=load_topic&__act=load_topic_reply_ladder2&opt=1&all=1`;
      const result = await post({
        url,
        noCache,
        headers: {
          Accept: "*/*",
          Host: "ngabbs.com",
          Referer: "https://ngabbs.com/",
          Connection: "keep-alive",
          "Content-Length": "11",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "zh-Hans-CN;q=1",
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
          "X-User-Agent": "NGA_skull/7.3.1(iPhone13,2;iOS 17.2.1)"
        },
        body: {
          __output: "14"
        }
      });
      const list = result.data.result[0];
      return {
        ...result,
        data: list.map((v) => ({
          id: v.tid,
          title: v.subject,
          author: v.author,
          hot: v.replies,
          timestamp: getTime(v.postdate),
          url: `https://bbs.nga.cn${v.tpcurl}`,
          mobileUrl: `https://bbs.nga.cn${v.tpcurl}`
        }))
      };
    };
    handleRoute38 = async (_, noCache) => {
      const listData = await getList37(noCache);
      const routeData = {
        name: "nodeseek",
        title: "NodeSeek",
        type: "\u6700\u65B0",
        params: {
          type: {
            name: "\u5206\u7C7B",
            type: {
              all: "\u6240\u6709"
            }
          }
        },
        link: "https://www.nodeseek.com/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList37 = async (noCache) => {
      const url = `https://rss.nodeseek.com/`;
      const result = await get({ url, noCache });
      const list = await parseRSS(result.data);
      return {
        ...result,
        data: list.map((v, i) => ({
          id: v.guid || i,
          title: v.title || "",
          desc: v.content?.trim() || "",
          author: v.author,
          timestamp: getTime(v.pubDate || 0),
          hot: void 0,
          url: v.link || "",
          mobileUrl: v.link || ""
        }))
      };
    };
    areaMap = {
      china: "\u4E2D\u6587\u7F51",
      global: "\u5168\u7403\u7248"
    };
    handleRoute39 = async (c, noCache) => {
      const area = c.req.query("type") || "china";
      const listData = await getList38({ area }, noCache);
      const routeData = {
        name: "nytimes",
        title: "\u7EBD\u7EA6\u65F6\u62A5",
        type: areaMap[area],
        params: {
          area: {
            name: "\u5730\u533A\u5206\u7C7B",
            type: areaMap
          }
        },
        link: "https://www.nytimes.com/",
        total: listData?.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList38 = async (options, noCache) => {
      const { area } = options;
      const url = area === "china" ? "https://cn.nytimes.com/rss/" : "https://rss.nytimes.com/services/xml/rss/nyt/World.xml";
      const result = await get({
        url,
        noCache,
        headers: {
          userAgent: "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36"
        }
      });
      const list = await parseRSS(result.data);
      return {
        ...result,
        data: list.map((v, i) => ({
          id: v.guid || i,
          title: v.title || "",
          desc: v.content?.trim() || "",
          author: v.author,
          timestamp: getTime(v.pubDate || 0),
          hot: void 0,
          url: v.link || "",
          mobileUrl: v.link || ""
        }))
      };
    };
    handleRoute40 = async (_, noCache) => {
      const listData = await getList39(noCache);
      const routeData = {
        name: "producthunt",
        title: "Product Hunt",
        type: "Today",
        description: "The best new products, every day",
        link: "https://www.producthunt.com/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList39 = async (noCache) => {
      const baseUrl = "https://www.producthunt.com";
      const result = await get({
        url: baseUrl,
        noCache,
        headers: {
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      });
      try {
        const $ = load10(result.data);
        const stories = [];
        $("[data-test=homepage-section-0] [data-test^=post-item]").each((_, el) => {
          const a = $(el).find("a").first();
          const path2 = a.attr("href");
          const title = $(el).find("a[data-test^=post-name]").text().trim();
          const id = $(el).attr("data-test")?.replace("post-item-", "");
          const vote = $(el).find("[data-test=vote-button]").text().trim();
          if (path2 && id && title) {
            stories.push({
              id,
              title,
              hot: parseInt(vote) || void 0,
              timestamp: void 0,
              url: `${baseUrl}${path2}`,
              mobileUrl: `${baseUrl}${path2}`
            });
          }
        });
        return {
          ...result,
          data: stories
        };
      } catch (error) {
        throw new Error(`Failed to parse Product Hunt HTML: ${error}`);
      }
    };
    handleRoute41 = async (_, noCache) => {
      const listData = await getList40(noCache);
      const routeData = {
        name: "qq-news",
        title: "\u817E\u8BAF\u65B0\u95FB",
        type: "\u70ED\u70B9\u699C",
        link: "https://news.qq.com/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList40 = async (noCache) => {
      const url = `https://r.inews.qq.com/gw/event/hot_ranking_list?page_size=50`;
      const result = await get({ url, noCache });
      const list = result.data.idlist[0].newslist.slice(1);
      return {
        ...result,
        data: list.map((v) => ({
          id: v.id,
          title: v.title,
          desc: v.abstract,
          cover: v.miniProShareImage,
          author: v.source,
          hot: v.hotEvent.hotScore,
          timestamp: getTime(v.timestamp),
          url: `https://new.qq.com/rain/a/${v.id}`,
          mobileUrl: `https://view.inews.qq.com/k/${v.id}`
        }))
      };
    };
    listType = {
      "1": {
        name: "\u603B\u6392\u884C",
        www: "news",
        params: "www_www_all_suda_suda"
      },
      "2": {
        name: "\u89C6\u9891\u6392\u884C",
        www: "news",
        params: "video_news_all_by_vv"
      },
      "3": {
        name: "\u56FE\u7247\u6392\u884C",
        www: "news",
        params: "total_slide_suda"
      },
      "4": {
        name: "\u56FD\u5185\u65B0\u95FB",
        www: "news",
        params: "news_china_suda"
      },
      "5": {
        name: "\u56FD\u9645\u65B0\u95FB",
        www: "news",
        params: "news_world_suda"
      },
      "6": {
        name: "\u793E\u4F1A\u65B0\u95FB",
        www: "news",
        params: "news_society_suda"
      },
      "7": {
        name: "\u4F53\u80B2\u65B0\u95FB",
        www: "sports",
        params: "sports_suda"
      },
      "8": {
        name: "\u8D22\u7ECF\u65B0\u95FB",
        www: "finance",
        params: "finance_0_suda"
      },
      "9": {
        name: "\u5A31\u4E50\u65B0\u95FB",
        www: "ent",
        params: "ent_suda"
      },
      "10": {
        name: "\u79D1\u6280\u65B0\u95FB",
        www: "tech",
        params: "tech_news_suda"
      },
      "11": {
        name: "\u519B\u4E8B\u65B0\u95FB",
        www: "news",
        params: "news_mil_suda"
      }
    };
    handleRoute42 = async (c, noCache) => {
      const type = c.req.query("type") || "1";
      const listData = await getList41({ type }, noCache);
      const routeData = {
        name: "sina-news",
        title: "\u65B0\u6D6A\u65B0\u95FB",
        type: listType[type].name,
        params: {
          type: {
            name: "\u699C\u5355\u5206\u7C7B",
            type: Object.fromEntries(Object.entries(listType).map(([key, value]) => [key, value.name]))
          }
        },
        link: "https://sinanews.sina.cn/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    parseData = (data) => {
      if (!data) throw new Error("Input data is empty or invalid");
      const prefix = "var data = ";
      if (!data.startsWith(prefix))
        throw new Error("Input data does not start with the expected prefix");
      let jsonString = data.slice(prefix.length).trim();
      if (jsonString.endsWith(";")) {
        jsonString = jsonString.slice(0, -1).trim();
      } else {
        throw new Error("Input data does not end with a semicolon");
      }
      if (jsonString.startsWith("{") && jsonString.endsWith("}")) {
        try {
          const jsonData = JSON.parse(jsonString);
          return jsonData;
        } catch (error) {
          throw new Error("Failed to parse JSON: " + error);
        }
      } else {
        throw new Error("Invalid JSON format");
      }
    };
    getList41 = async (options, noCache) => {
      const { type } = options;
      const { params, www } = listType[type];
      const { year, month, day } = getCurrentDateTime(true);
      const url = `https://top.${www}.sina.com.cn/ws/GetTopDataList.php?top_type=day&top_cat=${params}&top_time=${year + month + day}&top_show_num=50`;
      const result = await get({ url, noCache });
      const list = parseData(result.data).data;
      return {
        ...result,
        data: list.map((v) => ({
          id: v.id,
          title: v.title,
          author: v.media || void 0,
          hot: parseFloat(v.top_num.replace(/,/g, "")),
          timestamp: getTime(v.create_date + " " + v.create_time),
          url: v.url,
          mobileUrl: v.url
        }))
      };
    };
    typeMap9 = {
      all: "\u65B0\u6D6A\u70ED\u699C",
      hotcmnt: "\u70ED\u8BAE\u699C",
      minivideo: "\u89C6\u9891\u70ED\u699C",
      ent: "\u5A31\u4E50\u70ED\u699C",
      ai: "AI\u70ED\u699C",
      auto: "\u6C7D\u8F66\u70ED\u699C",
      mother: "\u80B2\u513F\u70ED\u699C",
      fashion: "\u65F6\u5C1A\u70ED\u699C",
      travel: "\u65C5\u6E38\u70ED\u699C",
      esg: "ESG\u70ED\u699C"
    };
    handleRoute43 = async (c, noCache) => {
      const type = c.req.query("type") || "all";
      const listData = await getList42({ type }, noCache);
      const routeData = {
        name: "sina",
        title: "\u65B0\u6D6A\u7F51",
        type: typeMap9[type],
        description: "\u70ED\u699C\u592A\u591A\uFF0C\u4E00\u4E2A\u5C31\u591F",
        params: {
          type: {
            name: "\u699C\u5355\u5206\u7C7B",
            type: typeMap9
          }
        },
        link: "https://sinanews.sina.cn/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList42 = async (options, noCache) => {
      const { type } = options;
      const url = `https://newsapp.sina.cn/api/hotlist?newsId=HB-1-snhs%2Ftop_news_list-${type}`;
      const result = await get({ url, noCache });
      const list = result.data.data.hotList;
      return {
        ...result,
        data: list.map((v) => {
          const base = v.base;
          const info = v.info;
          return {
            id: base.base.uniqueId,
            title: info.title,
            desc: void 0,
            author: void 0,
            timestamp: void 0,
            hot: parseChineseNumber(info.hotValue),
            url: base.base.url,
            mobileUrl: base.base.url
          };
        })
      };
    };
    typeMap10 = {
      "1": "\u4ECA\u65E5\u70ED\u95E8",
      "7": "\u5468\u70ED\u95E8",
      "30": "\u6708\u70ED\u95E8"
    };
    handleRoute44 = async (c, noCache) => {
      const type = c.req.query("type") || "1";
      const listData = await getList43({ type }, noCache);
      const routeData = {
        name: "smzdm",
        title: "\u4EC0\u4E48\u503C\u5F97\u4E70",
        type: typeMap10[type],
        description: "\u4EC0\u4E48\u503C\u5F97\u4E70\u662F\u4E00\u4E2A\u4E2D\u7ACB\u7684\u3001\u81F4\u529B\u4E8E\u5E2E\u52A9\u5E7F\u5927\u7F51\u53CB\u4E70\u5230\u66F4\u6709\u6027\u4EF7\u6BD4\u7F51\u8D2D\u4EA7\u54C1\u7684\u6700\u70ED\u95E8\u63A8\u8350\u7F51\u7AD9\u3002",
        link: "https://www.smzdm.com/top/",
        params: {
          type: {
            name: "\u6587\u7AE0\u5206\u7C7B",
            type: typeMap10
          }
        },
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList43 = async (options, noCache) => {
      const { type } = options;
      const url = `https://post.smzdm.com/rank/json_more/?unit=${type}`;
      const result = await get({ url, noCache });
      const list = result.data.data;
      return {
        ...result,
        data: list.map((v) => ({
          id: v.article_id,
          title: v.title,
          desc: v.content,
          cover: v.pic_url,
          author: v.nickname,
          hot: Number(v.collection_count),
          timestamp: getTime(v.time_sort),
          url: v.jump_link,
          mobileUrl: v.jump_link
        }))
      };
    };
    handleRoute45 = async (c, noCache) => {
      const type = c.req.query("type") || "\u70ED\u95E8\u6587\u7AE0";
      const listData = await getList44({ type }, noCache);
      const routeData = {
        name: "sspai",
        title: "\u5C11\u6570\u6D3E",
        type: "\u70ED\u699C",
        params: {
          type: {
            name: "\u5206\u7C7B",
            type: ["\u70ED\u95E8\u6587\u7AE0", "\u5E94\u7528\u63A8\u8350", "\u751F\u6D3B\u65B9\u5F0F", "\u6548\u7387\u6280\u5DE7", "\u5C11\u6570\u6D3E\u64AD\u5BA2"]
          }
        },
        link: "https://sspai.com/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList44 = async (options, noCache) => {
      const { type } = options;
      const url = `https://sspai.com/api/v1/article/tag/page/get?limit=40&tag=${type}`;
      const result = await get({ url, noCache });
      const list = result.data.data;
      return {
        ...result,
        data: list.map((v) => ({
          id: v.id,
          title: v.title,
          desc: v.summary,
          cover: v.banner,
          author: v.author.nickname,
          timestamp: getTime(v.released_time),
          hot: v.like_count,
          url: `https://sspai.com/post/${v.id}`,
          mobileUrl: `https://sspai.com/post/${v.id}`
        }))
      };
    };
    handleRoute46 = async (c, noCache) => {
      const type = c.req.query("type") || "1";
      const listData = await getList45({ type }, noCache);
      const routeData = {
        name: "starrail",
        title: "\u5D29\u574F\uFF1A\u661F\u7A79\u94C1\u9053",
        type: "\u6700\u65B0\u52A8\u6001",
        params: {
          type: {
            name: "\u699C\u5355\u5206\u7C7B",
            type: {
              1: "\u516C\u544A",
              2: "\u6D3B\u52A8",
              3: "\u8D44\u8BAF"
            }
          }
        },
        link: "https://www.miyoushe.com/sr/home/53",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList45 = async (options, noCache) => {
      const { type } = options;
      const url = `https://bbs-api-static.miyoushe.com/painter/wapi/getNewsList?client_type=4&gids=6&page_size=20&type=${type}`;
      const result = await get({ url, noCache });
      const list = result.data.data.list;
      return {
        ...result,
        data: list.map((v) => {
          const data = v.post;
          return {
            id: data.post_id,
            title: data.subject,
            desc: data.content,
            cover: data.cover || data?.images?.[0],
            author: v.user?.nickname || void 0,
            timestamp: getTime(data.created_at),
            hot: data.view_status,
            url: `https://www.miyoushe.com/sr/article/${data.post_id}`,
            mobileUrl: `https://m.miyoushe.com/sr/#/article/${data.post_id}`
          };
        })
      };
    };
    handleRoute47 = async (_, noCache) => {
      const listData = await getList46(noCache);
      const routeData = {
        name: "thepaper",
        title: "\u6F8E\u6E43\u65B0\u95FB",
        type: "\u70ED\u699C",
        link: "https://www.thepaper.cn/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList46 = async (noCache) => {
      const url = `https://cache.thepaper.cn/contentapi/wwwIndex/rightSidebar`;
      const result = await get({ url, noCache });
      const list = result.data.data.hotNews;
      return {
        ...result,
        data: list.map((v) => ({
          id: v.contId,
          title: v.name,
          cover: v.pic,
          hot: Number(v.praiseTimes),
          timestamp: getTime(v.pubTimeLong),
          url: `https://www.thepaper.cn/newsDetail_forward_${v.contId}`,
          mobileUrl: `https://m.thepaper.cn/newsDetail_forward_${v.contId}`
        }))
      };
    };
    handleRoute48 = async (_, noCache) => {
      const listData = await getList47(noCache);
      const routeData = {
        name: "tieba",
        title: "\u767E\u5EA6\u8D34\u5427",
        type: "\u70ED\u8BAE\u699C",
        description: "\u5168\u7403\u9886\u5148\u7684\u4E2D\u6587\u793E\u533A",
        link: "https://tieba.baidu.com/hottopic/browse/topicList",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList47 = async (noCache) => {
      const url = `https://tieba.baidu.com/hottopic/browse/topicList`;
      const result = await get({ url, noCache });
      const list = result.data.data.bang_topic.topic_list;
      return {
        ...result,
        data: list.map((v) => ({
          id: v.topic_id,
          title: v.topic_name,
          desc: v.topic_desc,
          cover: v.topic_pic,
          hot: v.discuss_num,
          timestamp: getTime(v.create_time),
          url: v.topic_url,
          mobileUrl: v.topic_url
        }))
      };
    };
    handleRoute49 = async (_, noCache) => {
      const listData = await getList48(noCache);
      const routeData = {
        name: "toutiao",
        title: "\u4ECA\u65E5\u5934\u6761",
        type: "\u70ED\u699C",
        link: "https://www.toutiao.com/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList48 = async (noCache) => {
      const url = `https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc`;
      const result = await get({ url, noCache });
      const list = result.data.data;
      return {
        ...result,
        data: list.map((v) => ({
          id: v.ClusterIdStr,
          title: v.Title,
          cover: v.Image.url,
          timestamp: getTime(v.ClusterIdStr),
          hot: Number(v.HotValue),
          url: `https://www.toutiao.com/trending/${v.ClusterIdStr}/`,
          mobileUrl: `https://api.toutiaoapi.com/feoffline/amos_land/new/html/main/index.html?topic_id=${v.ClusterIdStr}`
        }))
      };
    };
    handleRoute50 = async (c, noCache) => {
      const type = c.req.query("type") || "hot";
      const listData = await getList49({ type }, noCache);
      const routeData = {
        name: "v2ex",
        title: "V2EX",
        type: "\u4E3B\u9898\u699C",
        params: {
          type: {
            name: "\u699C\u5355\u5206\u7C7B",
            type: {
              hot: "\u6700\u70ED\u4E3B\u9898",
              latest: "\u6700\u65B0\u4E3B\u9898"
            }
          }
        },
        link: "https://www.v2ex.com/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList49 = async (options, noCache) => {
      const { type } = options;
      const url = `https://www.v2ex.com/api/topics/${type}.json`;
      const result = await get({ url, noCache });
      const list = result.data;
      return {
        ...result,
        data: list.map((v) => ({
          id: v.id,
          title: v.title,
          desc: v.content,
          author: v.member.username,
          timestamp: void 0,
          hot: v.replies,
          url: v.url,
          mobileUrl: v.url
        }))
      };
    };
    handleRoute51 = async (c, noCache) => {
      const province = c.req.query("province") || "";
      const listData = await getList50({ province }, noCache);
      const routeData = {
        name: "weatheralarm",
        title: "\u4E2D\u592E\u6C14\u8C61\u53F0",
        type: `${province || "\u5168\u56FD"}\u6C14\u8C61\u9884\u8B66`,
        params: {
          province: {
            name: "\u9884\u8B66\u533A\u57DF",
            value: "\u7701\u4EFD\u540D\u79F0\uFF08 \u4F8B\u5982\uFF1A\u5E7F\u4E1C\u7701 \uFF09"
          }
        },
        link: "http://nmc.cn/publish/alarm.html",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList50 = async (options, noCache) => {
      const { province } = options;
      const url = `http://www.nmc.cn/rest/findAlarm?pageNo=1&pageSize=20&signaltype=&signallevel=&province=${encodeURIComponent(province || "")}`;
      const result = await get({ url, noCache });
      const list = result.data.data.page.list;
      return {
        ...result,
        data: list.map((v) => ({
          id: v.alertid,
          title: v.title,
          desc: v.issuetime + " " + v.title,
          cover: v.pic,
          timestamp: getTime(v.issuetime),
          hot: void 0,
          url: `http://nmc.cn${v.url}`,
          mobileUrl: `http://nmc.cn${v.url}`
        }))
      };
    };
    handleRoute52 = async (_, noCache) => {
      const listData = await getList51(noCache);
      const routeData = {
        name: "weibo",
        title: "\u5FAE\u535A",
        type: "\u70ED\u641C\u699C",
        description: "\u5B9E\u65F6\u70ED\u70B9\uFF0C\u6BCF\u5206\u949F\u66F4\u65B0\u4E00\u6B21",
        link: "https://s.weibo.com/top/summary/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList51 = async (noCache) => {
      const url = "https://weibo.com/ajax/side/hotSearch";
      const result = await get({
        url,
        noCache,
        ttl: 60,
        headers: {
          Referer: "https://weibo.com/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      });
      if (!result.data?.data?.realtime) {
        return { ...result, data: [] };
      }
      const list = result.data.data.realtime;
      return {
        ...result,
        data: list.map((v, index) => {
          const title = v.word || v.word_scheme || `\u70ED\u641C${index + 1}`;
          return {
            id: v.mid || v.word_scheme || `weibo-${index}`,
            title,
            desc: v.word_scheme || `#${title}#`,
            hot: void 0,
            timestamp: getTime(v.onboard_time || Date.now()),
            url: `https://s.weibo.com/weibo?q=${encodeURIComponent(title)}`,
            mobileUrl: `https://s.weibo.com/weibo?q=${encodeURIComponent(title)}`
          };
        })
      };
    };
    getWereadID = (bookId) => {
      try {
        const hash = crypto.createHash("md5");
        hash.update(bookId);
        const str = hash.digest("hex");
        let strSub = str.substring(0, 3);
        let fa;
        if (/^\d*$/.test(bookId)) {
          const chunks = [];
          for (let i = 0; i < bookId.length; i += 9) {
            const chunk = bookId.substring(i, i + 9);
            chunks.push(parseInt(chunk).toString(16));
          }
          fa = ["3", chunks];
        } else {
          let hexStr = "";
          for (let i = 0; i < bookId.length; i++) {
            hexStr += bookId.charCodeAt(i).toString(16);
          }
          fa = ["4", [hexStr]];
        }
        strSub += fa[0];
        strSub += "2" + str.substring(str.length - 2);
        for (let i = 0; i < fa[1].length; i++) {
          const sub = fa[1][i];
          const subLength = sub.length.toString(16);
          const subLengthPadded = subLength.length === 1 ? "0" + subLength : subLength;
          strSub += subLengthPadded + sub;
          if (i < fa[1].length - 1) {
            strSub += "g";
          }
        }
        if (strSub.length < 20) {
          strSub += str.substring(0, 20 - strSub.length);
        }
        const finalHash = crypto.createHash("md5");
        finalHash.update(strSub);
        const finalStr = finalHash.digest("hex");
        strSub += finalStr.substring(0, 3);
        return strSub;
      } catch (error) {
        console.error("\u5904\u7406\u5FAE\u4FE1\u8BFB\u4E66 ID \u65F6\u51FA\u73B0\u9519\u8BEF\uFF1A" + error);
        return void 0;
      }
    };
    weread_default = getWereadID;
    typeMap11 = {
      rising: "\u98D9\u5347\u699C",
      hot_search: "\u70ED\u641C\u699C",
      newbook: "\u65B0\u4E66\u699C",
      general_novel_rising: "\u5C0F\u8BF4\u699C",
      all: "\u603B\u699C"
    };
    handleRoute53 = async (c, noCache) => {
      const type = c.req.query("type") || "rising";
      const listData = await getList52(noCache, type);
      const routeData = {
        name: "weread",
        title: "\u5FAE\u4FE1\u8BFB\u4E66",
        type: `${typeMap11[type]}`,
        params: {
          type: {
            name: "\u6392\u884C\u699C\u5206\u533A",
            type: typeMap11
          }
        },
        link: "https://weread.qq.com/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList52 = async (noCache, type = "rising") => {
      const url = `https://weread.qq.com/web/bookListInCategory/${type}?rank=1`;
      const result = await get({
        url,
        noCache,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.67"
        }
      });
      const list = result.data.books;
      return {
        ...result,
        data: list.map((v) => {
          const data = v.bookInfo;
          return {
            id: data.bookId,
            title: data.title,
            author: data.author,
            desc: data.intro,
            cover: data.cover.replace("s_", "t9_"),
            timestamp: getTime(data.publishTime),
            hot: v.readingCount,
            url: `https://weread.qq.com/web/bookDetail/${weread_default(data.bookId)}`,
            mobileUrl: `https://weread.qq.com/web/bookDetail/${weread_default(data.bookId)}`
          };
        })
      };
    };
    handleRoute54 = async (_, noCache) => {
      const listData = await getList53(noCache);
      const routeData = {
        name: "yystv",
        title: "\u6E38\u7814\u793E",
        type: "\u5168\u90E8\u6587\u7AE0",
        description: "\u6E38\u7814\u793E\u662F\u4EE5\u6E38\u620F\u5185\u5BB9\u4E3A\u4E3B\u7684\u65B0\u5A92\u4F53\uFF0C\u51FA\u54C1\u5185\u5BB9\u5305\u62EC\u5927\u91CF\u6E38\u620F\u3001\u52A8\u6F2B\u6709\u5173\u7684\u7814\u7A76\u6587\u7AE0\u548C\u793E\u957F\u804A\u8857\u673A\u3001\u793E\u957F\u8BF4\u3001\u6E38\u7814\u5267\u573A\u3001\u8001\u56DB\u5F3A\u7B49\u7CFB\u5217\u89C6\u9891\u5185\u5BB9\u3002",
        link: "https://www.yystv.cn/docs",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList53 = async (noCache) => {
      const url = "https://www.yystv.cn/home/get_home_docs_by_page";
      const result = await get({ url, noCache });
      const list = result.data.data;
      return {
        ...result,
        data: list.map((v) => ({
          id: v.id,
          title: v.title,
          cover: v.cover,
          author: v.author,
          hot: void 0,
          timestamp: getTime(v.createtime),
          url: `https://www.yystv.cn/p/${v.id}`,
          mobileUrl: `https://www.yystv.cn/p/${v.id}`
        }))
      };
    };
    handleRoute55 = async (_, noCache) => {
      const listData = await getList54(noCache);
      const routeData = {
        name: "zhihu-daily",
        title: "\u77E5\u4E4E\u65E5\u62A5",
        type: "\u63A8\u8350\u699C",
        description: "\u6BCF\u5929\u4E09\u6B21\uFF0C\u6BCF\u6B21\u4E03\u5206\u949F",
        link: "https://daily.zhihu.com/",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList54 = async (noCache) => {
      const url = `https://daily.zhihu.com/api/4/news/latest`;
      const result = await get({
        url,
        noCache,
        headers: {
          Referer: "https://daily.zhihu.com/api/4/news/latest",
          Host: "daily.zhihu.com"
        }
      });
      const list = result.data.stories.filter((el) => el.type === 0);
      return {
        ...result,
        data: list.map((v) => ({
          id: v.id,
          title: v.title,
          cover: v.images?.[0] ?? void 0,
          author: v.hint,
          hot: void 0,
          timestamp: void 0,
          url: v.url,
          mobileUrl: v.url
        }))
      };
    };
    handleRoute56 = async (_, noCache) => {
      const listData = await getList55(noCache);
      const routeData = {
        name: "zhihu",
        title: "\u77E5\u4E4E",
        type: "\u70ED\u699C",
        link: "https://www.zhihu.com/hot",
        total: listData.data?.length || 0,
        ...listData
      };
      return routeData;
    };
    getList55 = async (noCache) => {
      const url = `https://api.zhihu.com/topstory/hot-lists/total?limit=50`;
      const result = await get({
        url,
        noCache,
        ...config.ZHIHU_COOKIE && {
          headers: {
            Cookie: config.ZHIHU_COOKIE
          }
        }
      });
      const list = result.data.data;
      return {
        ...result,
        data: list.map((v) => {
          const data = v.target;
          const questionId = data.url.split("/").pop();
          return {
            id: data.id,
            title: data.title,
            desc: data.excerpt,
            cover: v.children[0].thumbnail,
            timestamp: getTime(data.created),
            hot: parseFloat(v.detail_text.split(" ")[0]) * 1e4,
            url: `https://www.zhihu.com/question/${questionId}`,
            mobileUrl: `https://www.zhihu.com/question/${questionId}`
          };
        })
      };
    };
    routeHandlers = {
      "36kr": handleRoute,
      "51cto": handleRoute2,
      "52pojie": handleRoute3,
      acfun: handleRoute4,
      baidu: handleRoute5,
      bilibili: handleRoute6,
      coolapk: handleRoute7,
      csdn: handleRoute8,
      dgtle: handleRoute9,
      "douban-group": handleRoute10,
      "douban-movie": handleRoute11,
      douyin: handleRoute12,
      earthquake: handleRoute13,
      gameres: handleRoute14,
      geekpark: handleRoute15,
      genshin: handleRoute16,
      github: handleRoute17,
      guokr: handleRoute18,
      hackernews: handleRoute19,
      hellogithub: handleRoute20,
      history: handleRoute21,
      honkai: handleRoute22,
      hostloc: handleRoute23,
      hupu: handleRoute24,
      huxiu: handleRoute25,
      ifanr: handleRoute26,
      "ithome-xijiayi": handleRoute27,
      ithome: handleRoute28,
      jianshu: handleRoute29,
      juejin: handleRoute30,
      kuaishou: handleRoute31,
      linuxdo: handleRoute32,
      lol: handleRoute33,
      miyoushe: handleRoute34,
      "netease-news": handleRoute35,
      newsmth: handleRoute36,
      ngabbs: handleRoute37,
      nodeseek: handleRoute38,
      nytimes: handleRoute39,
      producthunt: handleRoute40,
      "qq-news": handleRoute41,
      "sina-news": handleRoute42,
      sina: handleRoute43,
      smzdm: handleRoute44,
      sspai: handleRoute45,
      starrail: handleRoute46,
      thepaper: handleRoute47,
      tieba: handleRoute48,
      toutiao: handleRoute49,
      v2ex: handleRoute50,
      weatheralarm: handleRoute51,
      weibo: handleRoute52,
      weread: handleRoute53,
      yystv: handleRoute54,
      "zhihu-daily": handleRoute55,
      zhihu: handleRoute56
    };
    app = new Hono();
    for (const [name, handleRoute57] of Object.entries(routeHandlers)) {
      const listApp = app.basePath(`/${name}`);
      listApp.get("/", async (c) => {
        const noCache = c.req.query("cache") === "false";
        const limit = c.req.query("limit");
        const rssEnabled = c.req.query("rss") === "true";
        const listData = await handleRoute57(c, noCache);
        if (limit && listData?.data?.length > parseInt(limit)) {
          listData.total = parseInt(limit);
          listData.data = listData.data.slice(0, parseInt(limit));
        }
        if (rssEnabled || config.RSS_MODE) {
          const rss = getRSS_default(listData);
          if (typeof rss === "string") {
            c.header("Content-Type", "application/xml; charset=utf-8");
            return c.body(rss);
          } else {
            return c.json({ code: 500, message: "RSS generation failed" }, 500);
          }
        }
        return c.json({ code: 200, ...listData });
      });
      listApp.all("*", (c) => c.json({ code: 405, message: "Method Not Allowed" }, 405));
    }
    app.get(
      "/all",
      (c) => c.json(
        {
          code: 200,
          count: Object.keys(routeHandlers).length,
          routes: Object.keys(routeHandlers).map((path2) => ({
            name: path2,
            path: `/${path2}`
          }))
        },
        200
      )
    );
    registry_default = app;
    handler = (c) => {
      if (config.DISALLOW_ROBOT) {
        return c.text("User-agent: *\nDisallow: /");
      } else {
        c.status(404);
        return c.text("");
      }
    };
    robots_txt_default = handler;
    Layout = (props) => {
      const globalClass = css`
    :-hono-global {
      * {
        margin: 0;
        padding: 0;
        user-select: none;
        box-sizing: border-box;
        -webkit-user-drag: none;
      }
      :root {
        --text-color: #000;
        --text-color-gray: #cbcbcb;
        --text-color-hover: #fff;
        --icon-color: #444;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --text-color: #fff;
          --text-color-gray: #cbcbcb;
          --text-color-hover: #3c3c3c;
          --icon-color: #cbcbcb;
        }
      }
      a {
        text-decoration: none;
        color: var(--text-color);
      }
      body {
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        color: var(--text-color);
        background-color: var(--text-color-hover);
        font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei";
        transition:
          color 0.3s,
          background-color 0.3s;
      }
      main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        margin: 20px;
        height: 100%;
      }
      .img {
        width: 120px;
        height: 120px;
        margin-bottom: 20px;
      }
      .img img,
      .img svg {
        width: 100%;
        height: 100%;
      }
      .title {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 40px;
      }
      .title .title-text {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 12px;
        text-align: center;
      }
      .title .title-tip {
        font-size: 20px;
        opacity: 0.8;
      }
      .title .content {
        margin-top: 30px;
        display: flex;
        padding: 20px;
        border-radius: 12px;
        border: 1px dashed var(--text-color);
        user-select: text;
      }
      .control {
        display: flex;
        flex-direction: row;
        align-items: center;
      }
      .control button {
        display: flex;
        flex-direction: row;
        align-items: center;
        color: var(--text-color);
        border: var(--text-color) solid;
        background-color: var(--text-color-hover);
        border-radius: 8px;
        padding: 8px 12px;
        margin: 0 8px;
        transition:
          color 0.3s,
          background-color 0.3s;
        cursor: pointer;
      }
      .control button .btn-icon {
        width: 22px;
        height: 22px;
        margin-right: 8px;
      }
      .control button .btn-text {
        font-size: 14px;
      }
      .control button:hover {
        border: var(--text-color) solid;
        background: var(--text-color);
        color: var(--text-color-hover);
      }
      .control button i {
        margin-right: 6px;
      }
      footer {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        line-height: 30px;
        padding: 20px;
      }
      .social {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 8px;
      }
      .social .link {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: 0 4px;
      }
      .social .link::after {
        content: "";
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background-color: var(--text-color);
        opacity: 0.4;
        margin-left: 8px;
      }
      .social .link:last-child::after {
        display: none;
      }
      .social .link svg {
        width: 22px;
        height: 22px;
      }
      footer .power,
      footer .icp {
        font-size: 14px;
      }
      footer a {
        color: var(--text-color-gray);
        transition: color 0.3s;
      }
      footer a:hover {
        color: var(--text-color);
      }
    }
  `;
      return /* @__PURE__ */ jsxs("html", { lang: "zh-CN", children: [
        /* @__PURE__ */ jsxs("head", { children: [
          /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width,initial-scale=1" }),
          /* @__PURE__ */ jsx("meta", { charset: "utf-8" }),
          /* @__PURE__ */ jsx("title", { children: props.title }),
          /* @__PURE__ */ jsx("link", { rel: "icon", href: "/favicon.ico" }),
          /* @__PURE__ */ jsx("meta", { name: "description", content: "\u4ECA\u65E5\u70ED\u699C API\uFF0C\u4E00\u4E2A\u805A\u5408\u70ED\u95E8\u6570\u636E\u7684 API \u63A5\u53E3" }),
          /* @__PURE__ */ jsx(Style, { children: globalClass })
        ] }),
        /* @__PURE__ */ jsxs("body", { children: [
          props.children,
          /* @__PURE__ */ jsxs("footer", { children: [
            /* @__PURE__ */ jsxs("div", { class: "social", children: [
              /* @__PURE__ */ jsx("a", { href: "https://github.com/imsyy/DailyHotApi", className: "link", target: "_blank", children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "32", height: "32", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx(
                "path",
                {
                  fill: "currentColor",
                  d: "M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
                }
              ) }) }),
              /* @__PURE__ */ jsx("a", { href: "https://www.imsyy.top", className: "link", target: "_blank", children: /* @__PURE__ */ jsx(
                "svg",
                {
                  className: "btn-icon",
                  xmlns: "http://www.w3.org/2000/svg",
                  width: "32",
                  height: "32",
                  viewBox: "0 0 24 24",
                  children: /* @__PURE__ */ jsx(
                    "path",
                    {
                      fill: "currentColor",
                      d: "M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1"
                    }
                  )
                }
              ) }),
              /* @__PURE__ */ jsx("a", { href: "mailto:one@imsyy.top", className: "link", children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "32", height: "32", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx(
                "path",
                {
                  fill: "currentColor",
                  d: "m20 8l-8 5l-8-5V6l8 5l8-5m0-2H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2"
                }
              ) }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { class: "power", children: [
              "Copyright\xA0\xA9\xA0",
              /* @__PURE__ */ jsx("a", { href: "https://www.imsyy.top/", target: "_blank", children: "\u7121\u540D" }),
              "\xA0|\xA0Power by\xA0",
              /* @__PURE__ */ jsx("a", { href: "https://github.com/honojs/hono/", target: "_blank", children: "Hono" })
            ] }),
            /* @__PURE__ */ jsx("div", { class: "icp", children: /* @__PURE__ */ jsx("a", { href: "https://beian.miit.gov.cn/", target: "_blank", children: "\u8C6BICP\u59072022018134\u53F7-1" }) })
          ] })
        ] })
      ] });
    };
    Layout_default = Layout;
    NotFound = () => {
      return /* @__PURE__ */ jsxs2(Layout_default, { title: "404 Not Found | DailyHot API", children: [
        /* @__PURE__ */ jsxs2("main", { className: "not-found", children: [
          /* @__PURE__ */ jsx2("div", { className: "img", children: /* @__PURE__ */ jsx2("svg", { xmlns: "http://www.w3.org/2000/svg", width: "32", height: "32", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx2(
            "path",
            {
              fill: "currentColor",
              d: "M12 17q.425 0 .713-.288Q13 16.425 13 16t-.287-.713Q12.425 15 12 15t-.712.287Q11 15.575 11 16t.288.712Q11.575 17 12 17Zm0 5q-2.075 0-3.9-.788q-1.825-.787-3.175-2.137q-1.35-1.35-2.137-3.175Q2 14.075 2 12t.788-3.9q.787-1.825 2.137-3.175q1.35-1.35 3.175-2.138Q9.925 2 12 2t3.9.787q1.825.788 3.175 2.138q1.35 1.35 2.137 3.175Q22 9.925 22 12t-.788 3.9q-.787 1.825-2.137 3.175q-1.35 1.35-3.175 2.137Q14.075 22 12 22Zm0-9q.425 0 .713-.288Q13 12.425 13 12V8q0-.425-.287-.713Q12.425 7 12 7t-.712.287Q11 7.575 11 8v4q0 .425.288.712q.287.288.712.288Z"
            }
          ) }) }),
          /* @__PURE__ */ jsxs2("div", { className: "title", children: [
            /* @__PURE__ */ jsx2("h1", { className: "title-text", children: "404 Not Found" }),
            /* @__PURE__ */ jsx2("span", { className: "title-tip", children: "\u8BF7\u68C0\u67E5\u60A8\u7684\u8DEF\u5F84" })
          ] }),
          /* @__PURE__ */ jsx2("div", { class: "control", children: /* @__PURE__ */ jsxs2("button", { id: "home-button", children: [
            /* @__PURE__ */ jsx2(
              "svg",
              {
                className: "btn-icon",
                xmlns: "http://www.w3.org/2000/svg",
                width: "32",
                height: "32",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx2(
                  "path",
                  {
                    fill: "currentColor",
                    d: "M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx2("span", { className: "btn-text", children: "\u56DE\u5230\u9996\u9875" })
          ] }) })
        ] }),
        html`
        <script>
          document.getElementById("home-button").addEventListener("click", () => {
            window.location.href = "/";
          });
        </script>
      `
      ] });
    };
    NotFound_default = NotFound;
    Home = () => {
      return /* @__PURE__ */ jsxs3(Layout_default, { title: "DailyHot API", children: [
        /* @__PURE__ */ jsxs3("main", { className: "home", children: [
          /* @__PURE__ */ jsx3("div", { className: "img", children: /* @__PURE__ */ jsx3(
            "img",
            {
              src: "data:image/png;base64,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",
              alt: "logo"
            }
          ) }),
          /* @__PURE__ */ jsxs3("div", { className: "title", children: [
            /* @__PURE__ */ jsx3("h1", { className: "title-text", children: "DailyHot API" }),
            /* @__PURE__ */ jsx3("span", { className: "title-tip", children: "\u670D\u52A1\u5DF2\u6B63\u5E38\u8FD0\u884C" })
          ] }),
          /* @__PURE__ */ jsxs3("div", { class: "control", children: [
            /* @__PURE__ */ jsxs3("button", { id: "all-button", children: [
              /* @__PURE__ */ jsx3(
                "svg",
                {
                  className: "btn-icon",
                  xmlns: "http://www.w3.org/2000/svg",
                  width: "32",
                  height: "32",
                  viewBox: "0 0 24 24",
                  children: /* @__PURE__ */ jsx3(
                    "path",
                    {
                      fill: "currentColor",
                      d: "M7.71 6.71a.996.996 0 0 0-1.41 0L1.71 11.3a.996.996 0 0 0 0 1.41L6.3 17.3a.996.996 0 1 0 1.41-1.41L3.83 12l3.88-3.88c.38-.39.38-1.03 0-1.41m8.58 0a.996.996 0 0 0 0 1.41L20.17 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L17.7 6.7c-.38-.38-1.02-.38-1.41.01M8 13c.55 0 1-.45 1-1s-.45-1-1-1s-1 .45-1 1s.45 1 1 1m4 0c.55 0 1-.45 1-1s-.45-1-1-1s-1 .45-1 1s.45 1 1 1m4-2c-.55 0-1 .45-1 1s.45 1 1 1s1-.45 1-1s-.45-1-1-1"
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsx3("span", { className: "btn-text", children: "\u5168\u90E8\u63A5\u53E3" })
            ] }),
            /* @__PURE__ */ jsxs3("button", { id: "docs-button", children: [
              /* @__PURE__ */ jsx3(
                "svg",
                {
                  className: "btn-icon",
                  xmlns: "http://www.w3.org/2000/svg",
                  width: "32",
                  height: "32",
                  viewBox: "0 0 24 24",
                  children: /* @__PURE__ */ jsx3(
                    "path",
                    {
                      fill: "currentColor",
                      d: "M3 6c-.55 0-1 .45-1 1v13c0 1.1.9 2 2 2h13c.55 0 1-.45 1-1s-.45-1-1-1H5c-.55 0-1-.45-1-1V7c0-.55-.45-1-1-1m17-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m-2 9h-8c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1m-4 4h-4c-.55 0-1-.45-1-1s.45-1 1-1h4c.55 0 1 .45 1 1s-.45 1-1 1m4-8h-8c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1"
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsx3("span", { className: "btn-text", children: "\u9879\u76EE\u6587\u6863" })
            ] })
          ] })
        ] }),
        html2`
        <script>
          document.getElementById("all-button").addEventListener("click", () => {
            window.location.href = "/all";
          });
          document.getElementById("docs-button").addEventListener("click", () => {
            window.open("https://blog.imsyy.top/posts/2024/0408");
          });
        </script>
      `
      ] });
    };
    Home_default = Home;
    Error2 = (props) => {
      return /* @__PURE__ */ jsxs4(Layout_default, { title: "Error | DailyHot API", children: [
        /* @__PURE__ */ jsxs4("main", { className: "error", children: [
          /* @__PURE__ */ jsx4("div", { className: "img", children: /* @__PURE__ */ jsxs4("svg", { xmlns: "http://www.w3.org/2000/svg", width: "32", height: "32", viewBox: "0 0 36 36", children: [
            /* @__PURE__ */ jsx4(
              "path",
              {
                fill: "currentColor",
                d: "M30 13.5a7.49 7.49 0 0 1-6.78-4.3H4V7h18.57a7.52 7.52 0 0 1-.07-1a7.52 7.52 0 0 1 .07-1H4a2 2 0 0 0-2 2v22a2 2 0 0 0 2 2h28a2 2 0 0 0 2-2V12.34a7.46 7.46 0 0 1-4 1.16m-13.2 6.33l-10 4.59v-2.64l6.51-3l-6.51-3v-2.61l10 4.59Zm6.6 5.57H17V23h6.4Z",
                class: "clr-i-solid--badged clr-i-solid-path-1--badged"
              }
            ),
            /* @__PURE__ */ jsx4(
              "circle",
              {
                cx: "30",
                cy: "6",
                r: "5",
                fill: "currentColor",
                class: "clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge"
              }
            ),
            /* @__PURE__ */ jsx4("path", { fill: "none", d: "M0 0h36v36H0z" })
          ] }) }),
          /* @__PURE__ */ jsxs4("div", { className: "title", children: [
            /* @__PURE__ */ jsx4("h1", { className: "title-text", children: "Looks like something went wrong" }),
            /* @__PURE__ */ jsx4("span", { className: "title-tip", children: "\u7A0B\u5E8F\u6267\u884C\u51FA\u9519" }),
            props?.error ? /* @__PURE__ */ jsx4("p", { className: "content", children: props.error }) : null
          ] }),
          /* @__PURE__ */ jsx4("div", { class: "control", children: /* @__PURE__ */ jsxs4("button", { id: "reload-button", children: [
            /* @__PURE__ */ jsx4(
              "svg",
              {
                className: "btn-icon",
                xmlns: "http://www.w3.org/2000/svg",
                width: "32",
                height: "32",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx4(
                  "path",
                  {
                    fill: "currentColor",
                    d: "M17.65 6.35a7.95 7.95 0 0 0-6.48-2.31c-3.67.37-6.69 3.35-7.1 7.02C3.52 15.91 7.27 20 12 20a7.98 7.98 0 0 0 7.21-4.56c.32-.67-.16-1.44-.9-1.44c-.37 0-.72.2-.88.53a5.994 5.994 0 0 1-6.8 3.31c-2.22-.49-4.01-2.3-4.48-4.52A6.002 6.002 0 0 1 12 6c1.66 0 3.14.69 4.22 1.78l-1.51 1.51c-.63.63-.19 1.71.7 1.71H19c.55 0 1-.45 1-1V6.41c0-.89-1.08-1.34-1.71-.71z"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx4("span", { className: "btn-text", children: "\u5237\u65B0\u91CD\u8BD5" })
          ] }) })
        ] }),
        html3`
        <script>
          document.getElementById("reload-button").addEventListener("click", () => {
            window.location.reload();
          });
        </script>
      `
      ] });
    };
    Error_default = Error2;
    app2 = new Hono2();
    app2.use(compress());
    app2.use(prettyJSON());
    app2.use(trimTrailingSlash());
    app2.use(
      "*",
      cors({
        // 可写为数组
        origin: (origin) => {
          const isSame = config.ALLOWED_HOST && origin.endsWith(config.ALLOWED_HOST);
          return isSame ? origin : config.ALLOWED_DOMAIN;
        },
        allowMethods: ["POST", "GET", "OPTIONS"],
        allowHeaders: ["X-Custom-Header", "Upgrade-Insecure-Requests"],
        credentials: true
      })
    );
    app2.use(
      "/*",
      serveStatic({
        root: "./public",
        rewriteRequestPath: (path2) => path2 === "/favicon.ico" ? "/favicon.png" : path2
      })
    );
    app2.route("/", registry_default);
    app2.get("/robots.txt", robots_txt_default);
    app2.get("/", (c) => c.html(/* @__PURE__ */ jsx5(Home_default, {})));
    app2.notFound((c) => c.html(/* @__PURE__ */ jsx5(NotFound_default, {}), 404));
    app2.onError((err, c) => {
      logger_default.error(`\u274C [ERROR] ${err?.message}`);
      return c.html(/* @__PURE__ */ jsx5(Error_default, { error: err?.message }), 500);
    });
    app_default = app2;
  }
});

// api/index.ts
import { Hono as Hono3 } from "hono";
var wrapper = new Hono3();
var bundleLoadError = null;
var bundleApp = null;
try {
  const mod = await Promise.resolve().then(() => (init_app(), app_exports));
  bundleApp = mod.default;
} catch (e) {
  bundleLoadError = e instanceof Error ? e : new Error(String(e));
}
if (bundleLoadError || !bundleApp) {
  wrapper.all(
    "*",
    (c) => c.text(
      `Failed to load _app.js bundle.
Error: ${bundleLoadError?.message ?? "unknown"}

Stack:
${bundleLoadError?.stack ?? "(no stack)"}`,
      500
    )
  );
} else {
  wrapper.all("*", async (c) => {
    try {
      return await bundleApp.fetch(c.req.raw, c.env);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      return c.text(`Handler error: ${err.message}

${err.stack ?? ""}`, 500);
    }
  });
}
var index_default = wrapper;
export {
  index_default as default
};
