import type { ServerResponse } from "node:http";
import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

import chatHandler from "./api/chat";
import contentHandler from "./api/content";
import fanartHandler from "./api/fanart";
import tweetsHandler from "./api/tweets";
import viewersHandler from "./api/viewers";

/**
 * The request half of what every api/*.ts handler expects.
 *
 * Each file declares its own local interface instead of importing Vercel's
 * types -- the handlers are deliberately self-contained -- so this one shape
 * stands in for all five: content/tweets/viewers read `method`, chat/fanart
 * read `query`, and nothing reads further than that.
 */
type ApiRequest = {
  method?: string;
  url?: string;
  query: Record<string, string | string[] | undefined>;
};

/**
 * The response half, matching Vercel's `res` as the handlers use it: chainable
 * `status`, `setHeader` before the body, `json` to finish. No `send`/`end` --
 * a grep of api/*.ts shows none of the five ever call them.
 */
type ApiResponse = {
  status(code: number): ApiResponse;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
};

type ApiHandler = (req: ApiRequest, res: ApiResponse) => void | Promise<void>;

/**
 * The five serverless endpoints, wired for the dev server.
 *
 * The casts are safe in both directions: each handler's local request/response
 * interface accepts this pair structurally (a request with extra fields is
 * assignable to one with fewer, and the response shapes are identical).
 */
const API_HANDLERS: Record<string, ApiHandler> = {
  chat: chatHandler as ApiHandler,
  content: contentHandler as ApiHandler,
  fanart: fanartHandler as ApiHandler,
  tweets: tweetsHandler as ApiHandler,
  viewers: viewersHandler as ApiHandler,
};

/**
 * Node's res, dressed as Vercel's.
 *
 * The status code is held locally rather than written through immediately
 * because handlers set headers first and call `status(...).json(...)` last;
 * committing the code at `json` time preserves that order.
 */
function adaptResponse(res: ServerResponse): ApiResponse {
  let code = 200;
  const api: ApiResponse = {
    status(next) {
      code = next;
      return api;
    },
    setHeader(name, value) {
      res.setHeader(name, value);
    },
    json(body) {
      res.statusCode = code;
      if (!res.hasHeader("Content-Type")) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
      }
      res.end(JSON.stringify(body));
    },
  };
  return api;
}

/**
 * Serve the real api/*.ts handlers during `vite dev`.
 *
 * Production runs them as Vercel functions. A dev server has no such runtime,
 * and Vite's extensionless resolution answers /api/content with the transformed
 * TypeScript source instead of JSON -- `res.json()` then throws on the parse,
 * every fetch lands in the bundled snapshot, and the page serves capture-time
 * data indefinitely. That is how /konten kept showing the previous channel's
 * uploads after the fork: the snapshot was stale AND the endpoint never worked
 * locally, so the stale copy was all a local visit could ever see.
 *
 * Middleware rather than a transform so the URLs keep their production shape:
 * the client fetches /api/* identically in dev and on Vercel, with no dev-only
 * branch to forget when deploying.
 */
function devApi(): Plugin {
  return {
    name: "zeyayaya:dev-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/api/")) {
          next();
          return;
        }

        const queryStart = url.indexOf("?");
        const name = url.slice(5, queryStart === -1 ? undefined : queryStart);
        const handler = API_HANDLERS[name];
        if (!handler) {
          // Unknown endpoint: hand it back so the SPA fallback still answers.
          next();
          return;
        }

        if (req.method !== "GET") {
          res.statusCode = 405;
          res.setHeader("Allow", "GET");
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: "method not allowed" }));
          return;
        }

        // Parse the query the way Vercel would hand it over: repeated keys
        // collect into an array, absent keys simply stay absent.
        const query: Record<string, string | string[] | undefined> = {};
        if (queryStart !== -1) {
          for (const [key, value] of new URLSearchParams(url.slice(queryStart + 1))) {
            const seen = query[key];
            if (seen === undefined) query[key] = value;
            else if (Array.isArray(seen)) seen.push(value);
            else query[key] = [seen, value];
          }
        }

        try {
          await handler({ method: req.method, url, query }, adaptResponse(res));
          // A handler that resolves without responding would otherwise hang
          // the request; none should, so this is a safety net, not a path.
          if (!res.writableEnded) {
            res.statusCode = 204;
            res.end();
          }
        } catch (error: unknown) {
          if (res.writableEnded) return;
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : String(error),
            }),
          );
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devApi()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    target: "es2022",
    cssMinify: "lightningcss",
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          motion: ["motion/react"],
        },
      },
    },
  },
});
