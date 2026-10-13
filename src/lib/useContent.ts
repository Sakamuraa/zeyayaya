import { useEffect, useState } from "react";

export type ContentItem = {
  videoId: string;
  url: string;
  title: string;
  thumbnail: string;
  live: boolean;
  viewers: number | null;
  /** "5 jam lalu", as the channel's own grid writes it. */
  age: string | null;
  /**
   * Absolute publish instant behind `age`.
   *
   * The API path sends this so the label can be re-derived from it rather than
   * read verbatim. The string alone is a snapshot of one moment -- an edge cache
   * happily serves the same payload for an hour, and a card that prints the
   * cached string keeps claiming "6 jam lalu" long after the stream is nine hours
   * old. Measuring from an instant cannot go stale that way.
   */
  publishedAt?: string | null;
  /** Runtime of a finished video, e.g. "2.03.50". Null on a broadcast. */
  duration: string | null;
  /** Publishing channel, on the clips tab only. */
  channel?: string;
  /** Scheduled but not started. Separate from live: one is now, one is later. */
  upcoming?: boolean;
  /** Scheduled start as unix seconds, for the countdown. Null when unknown. */
  scheduledStart?: number | null;
};

type ApiPayload = {
  fetchedAt: string;
  liveCount: number;
  sources: Record<"streams" | "videos" | "clips", boolean>;
  streams: ContentItem[];
  videos: ContentItem[];
  clips: ContentItem[];
  /** Scheduled broadcast, or null. */
  upcoming?: ContentItem | null;
};

type State = {
  streams: ContentItem[];
  videos: ContentItem[];
  clips: ContentItem[];
  /** Scheduled but not started, when there is one. */
  upcoming: ContentItem | null;
  /** True when at least one broadcast is confirmed live. */
  live: boolean;
  /** "api" once a response lands, "snapshot" while on the bundled copy. */
  source: "api" | "snapshot" | "loading";
  error: string | null;
};

/** When the snapshot's ages were measured, so the client can keep them honest. */
const SNAPSHOT_AT = "2026-10-13T06:55:33.810Z";

/**
 * Bundled copies of the three lists, taken from /api/content on 2026-10-13.
 *
 * The fallback for a static host with no serverless runtime, and for the window
 * before the fetch resolves. Every item keeps its own `publishedAt`, so age
 * labels are measured from the instant of publish rather than quoted from the
 * capture: a snapshot that keeps saying "1 jam lalu" a week later would be
 * lying, and this is the only part of the page that can go stale with no server
 * to refresh it.
 */
const SNAPSHOT_STREAMS: ContentItem[] = [
{"videoId":"miayQZR1Oeo","url":"https://www.youtube.com/watch?v=miayQZR1Oeo","title":"【GIVEAWAY TIKET CF23】SIAPAKAH 14 ORANG BERUNTUNG ITU? (Sponsored)","thumbnail":"https://i.ytimg.com/vi/miayQZR1Oeo/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLA7I7gk94VO-Am911Py4lbTXv3y7Q","live":false,"viewers":null,"age":"3 hari lalu","publishedAt":"2026-10-10T06:55:33.445Z","duration":null,"scheduledStart":null},
{"videoId":"MG_pfNrml_o","url":"https://www.youtube.com/watch?v=MG_pfNrml_o","title":"【HOW TO FISH】GAJADI OPEN POV, SINYAL JELEK","thumbnail":"https://i.ytimg.com/vi/MG_pfNrml_o/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCmvpTw2lIs6jY-BFK0eV_LPKqCAQ","live":false,"viewers":null,"age":"6 hari lalu","publishedAt":"2026-10-07T06:55:33.446Z","duration":null,"scheduledStart":null},
{"videoId":"abQVvG_6kd8","url":"https://www.youtube.com/watch?v=abQVvG_6kd8","title":"【HANDCAM | COUNTDOWN】LAST DAY PRE-ORDER MERCH CF23!","thumbnail":"https://i.ytimg.com/vi/abQVvG_6kd8/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAb9RfAYivuwoaQq4ena9dvMnN4sQ","live":false,"viewers":null,"age":"8 hari lalu","publishedAt":"2026-10-05T06:55:33.446Z","duration":null,"scheduledStart":null},
{"videoId":"nUNocm-2RWI","url":"https://www.youtube.com/watch?v=nUNocm-2RWI","title":"【MEMBER 2ND ANNIV & DEBUT 1ST ANNIV】BANGUN, ADA YANG BARU!","thumbnail":"https://i.ytimg.com/vi/nUNocm-2RWI/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBU0rldfFZwU4CwYKWExfmAVA8f1g","live":false,"viewers":null,"age":"10 hari lalu","publishedAt":"2026-10-03T06:55:33.446Z","duration":null,"scheduledStart":null},
{"videoId":"PJg6E_2rdTc","url":"https://www.youtube.com/watch?v=PJg6E_2rdTc","title":"【BOMBANANA!】SOAL KALAH, KITA MENANG!","thumbnail":"https://i.ytimg.com/vi/PJg6E_2rdTc/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBQU4P2yuOHWivfh9kes9lgbpihcw","live":false,"viewers":null,"age":"2 minggu lalu","publishedAt":"2026-09-29T06:55:33.446Z","duration":null,"scheduledStart":null},
{"videoId":"YXxuijMbskg","url":"https://www.youtube.com/watch?v=YXxuijMbskg","title":"【LAST RESTOCK MERCH CF23】Sebenarnya...","thumbnail":"https://i.ytimg.com/vi/YXxuijMbskg/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBtFdkiPp8DvYGd9hXX2gCkjJ_0cQ","live":false,"viewers":null,"age":"2 minggu lalu","publishedAt":"2026-09-29T06:55:33.446Z","duration":null,"scheduledStart":null},
{"videoId":"TougeMmn0iA","url":"https://www.youtube.com/watch?v=TougeMmn0iA","title":"【OPEN PO MERCH CF23】Sekalian test PC (aku abis pasang ram sendiri!)","thumbnail":"https://i.ytimg.com/vi/TougeMmn0iA/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBAhKdpCdTfBDkhG-bm7NKi-Ywqqw","live":false,"viewers":null,"age":"3 minggu lalu","publishedAt":"2026-09-22T06:55:33.446Z","duration":null,"scheduledStart":null},
{"videoId":"pekUBbH6dBo","url":"https://www.youtube.com/watch?v=pekUBbH6dBo","title":"【RANDOM】Hi? It's been a while...","thumbnail":"https://i.ytimg.com/vi/pekUBbH6dBo/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBH24734HKuaQbS-ri8s9Vk_Ko6vA","live":false,"viewers":null,"age":"1 bulan lalu","publishedAt":"2026-09-13T06:55:33.446Z","duration":null,"scheduledStart":null},
];

const SNAPSHOT_VIDEOS: ContentItem[] = [
{"videoId":"Wr0ECpPObac","url":"https://www.youtube.com/watch?v=Wr0ECpPObac","title":"【DEBUT TEASER】Zeya Haize [Zeyayaya]","thumbnail":"https://i.ytimg.com/vi/Wr0ECpPObac/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLC-SSHnK0GDcjU9epuWpZZ60cIiCA","live":false,"viewers":null,"age":"1 tahun lalu","publishedAt":null,"duration":null,"scheduledStart":null},
];

const SNAPSHOT_CLIPS: ContentItem[] = [
{"videoId":"v34B0HCCfFo","url":"https://www.youtube.com/watch?v=v34B0HCCfFo","title":"Zeya Meracik Bumbu Cinta Antara Pingu Dan Bang Al 😂 [Zeyayaya]","thumbnail":"https://i.ytimg.com/vi/v34B0HCCfFo/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDHboyFxDDXY3P3OSJf9cH8uZjMEw","live":false,"viewers":null,"age":"6 bulan lalu","publishedAt":"2026-04-16T06:55:33.810Z","duration":"2.10","channel":"Exile Syahputra"},
{"videoId":"6BJ-cFONSII","url":"https://www.youtube.com/watch?v=6BJ-cFONSII","title":"Hayoo Sesama Botol Yakult Gak Boleh Saling Roasting Yaa [Lucia Seraphina & Zeyayaya]","thumbnail":"https://i.ytimg.com/vi/6BJ-cFONSII/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBJwcKjgQxDbPc1wUOMIpkpsaGOLQ","live":false,"viewers":null,"age":"1 tahun lalu","publishedAt":null,"duration":"2.06","channel":"Fuutaba Clips"},
{"videoId":"UvoimYvfdQ0","url":"https://www.youtube.com/watch?v=UvoimYvfdQ0","title":"Dapet Kombo Kiss Kakak Adek Gini Bang [Zeyayaya]","thumbnail":"https://i.ytimg.com/vi/UvoimYvfdQ0/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBtR8pvYVvV9tTYj9nt62vM7plNjA","live":false,"viewers":null,"age":"1 tahun lalu","publishedAt":null,"duration":"2.04","channel":"Fuutaba Clips"},
{"videoId":"v4BCguhN71Q","url":"https://www.youtube.com/watch?v=v4BCguhN71Q","title":"Guru Pembimbingnya Udah Capek Ngurus ni Adek-Adek [Vanta, Zeyayaya & Gui]","thumbnail":"https://i.ytimg.com/vi/v4BCguhN71Q/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBeXZtFCEfcZ6ue7zsmxhVDGproZA","live":false,"viewers":null,"age":"2 tahun lalu","publishedAt":null,"duration":"2.13","channel":"Fuutaba Clips"},
{"videoId":"zGwTM0j-bXs","url":"https://www.youtube.com/watch?v=zGwTM0j-bXs","title":"Marah Kecil🤏  Adek Satu ini [Zeyayaya]","thumbnail":"https://i.ytimg.com/vi/zGwTM0j-bXs/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDuefDEOYCb9_6hqREqJMgzAHWczw","live":false,"viewers":null,"age":"1 tahun lalu","publishedAt":null,"duration":"2.15","channel":"Fuutaba Clips"},
{"videoId":"M2-PH54jykQ","url":"https://www.youtube.com/watch?v=M2-PH54jykQ","title":"Bu Rimu Lagi Ngurus Anak Kecil [Pinku Rimu/Re:Memories & Zeyayaya]","thumbnail":"https://i.ytimg.com/vi/M2-PH54jykQ/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDa_XFeUzh3HuWhb8r5KFUr8caJlw","live":false,"viewers":null,"age":"2 tahun lalu","publishedAt":null,"duration":"2.10","channel":"Fuutaba Clips"},
{"videoId":"HCVtTYzG0aQ","url":"https://www.youtube.com/watch?v=HCVtTYzG0aQ","title":"Ini Kah Adek Lucu yang Ada Di Anime-Anime itu? [Zeyayaya]","thumbnail":"https://i.ytimg.com/vi/HCVtTYzG0aQ/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDRvPhZhdHNCJUh-XN5lmkQXRGGkg","live":false,"viewers":null,"age":"1 tahun lalu","publishedAt":null,"duration":"2.13","channel":"Fuutaba Clips"},
{"videoId":"Sm5TJ8ls0mI","url":"https://www.youtube.com/watch?v=Sm5TJ8ls0mI","title":"Ehh Zeya Gak Boleh Ngomong Gitu [Zeyayaya]","thumbnail":"https://i.ytimg.com/vi/Sm5TJ8ls0mI/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAug71R3zO3YGfXKr1hxJwnywbjHg","live":false,"viewers":null,"age":"1 tahun lalu","publishedAt":null,"duration":"2.15","channel":"Fuutaba Clips"},
{"videoId":"XuLo_r1JCjE","url":"https://www.youtube.com/watch?v=XuLo_r1JCjE","title":"Meja jadi korban, salting sampe mw endstream 2x |Zeyayaya x Naplive 【CLIP】","thumbnail":"https://i.ytimg.com/vi/XuLo_r1JCjE/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAm2rnyieiKyXoFb41EsuDxNvkFsQ","live":false,"viewers":null,"age":"1 tahun lalu","publishedAt":null,"duration":"18.30","channel":"Vendouw 07 Ch."},
{"videoId":"T0TqxS424ak","url":"https://www.youtube.com/watch?v=T0TqxS424ak","title":"Momen bang AL ngucapin ulang tahun ke Zeya.. | 【zeyayaya Clip】","thumbnail":"https://i.ytimg.com/vi/T0TqxS424ak/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCKh2vmiIkPST2G0xZxBXdj9amt6w","live":false,"viewers":null,"age":"2 tahun lalu","publishedAt":null,"duration":"1.40","channel":"Vendouw 07 Ch."},
{"videoId":"sXyP6RGs4jA","url":"https://www.youtube.com/watch?v=sXyP6RGs4jA","title":"Zeya terpaksa naikin harga donate, minimal 1.000.000? 😮 | Zeya Haize [Clip]","thumbnail":"https://i.ytimg.com/vi/sXyP6RGs4jA/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBQyEXt7lm7id-zLZUMN6gEPm12WQ","live":false,"viewers":null,"age":"2 tahun lalu","publishedAt":null,"duration":"4.03","channel":"putra 🥚 clip"},
{"videoId":"vGq0TSOA2dw","url":"https://www.youtube.com/watch?v=vGq0TSOA2dw","title":"Zeya Sang Penjaga Mimpi Mu Kini Telah Hadir! 😍 [Zeyayaya]","thumbnail":"https://i.ytimg.com/vi/vGq0TSOA2dw/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAqXLty_JJVr1L7NcGFku5aL9zPrg","live":false,"viewers":null,"age":"1 tahun lalu","publishedAt":null,"duration":"3.34","channel":"Exile Syahputra"},
];

const SNAPSHOT_AGES: Record<string, number> = {

};

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
/**
 * A year, at 365 days rather than 365.25.
 *
 * The same figure api/content.ts uses for `tahun`, so a label the API is able to
 * produce is one this can render. The labels are coarse either way -- "1 tahun
 * lalu" on YouTube covers anything from 12 to 24 months -- so the extra precision
 * would be precision the source does not have.
 */
const YEAR = 365 * DAY;

/**
 * Re-render a duration as the age label the card shows.
 *
 * Boundaries match YouTube's own grids closely enough to read the same: they drop
 * to days around a day, to weeks around a week, to months around a month, and to
 * years around a year. A value under a minute reads as "beberapa detik", which is
 * what YouTube says for that window rather than the number zero.
 *
 * The year tier exists because two of the endpoints can return "tahun" and this
 * could not say it: an eleven-year-old clip came out as "133 bulan lalu", which is
 * a true number and a meaningless one. Every bundled snapshot also holds entries
 * older than a year, so the same label appeared on those without any API involved.
 */
export function formatAge(ms: number): string {
  if (ms < MINUTE) return "beberapa detik lalu";
  if (ms < HOUR) return `${Math.floor(ms / MINUTE)} menit lalu`;
  if (ms < DAY) return `${Math.floor(ms / HOUR)} jam lalu`;
  if (ms < WEEK) return `${Math.floor(ms / DAY)} hari lalu`;
  if (ms < MONTH) return `${Math.floor(ms / WEEK)} minggu lalu`;
  if (ms < YEAR) return `${Math.floor(ms / MONTH)} bulan lalu`;
  return `${Math.floor(ms / YEAR)} tahun lalu`;
}

/**
 * The age to render for one item, from whichever source supplied it.
 *
 * The API path is measured, not quoted. `publishedAt` is a wall-clock instant, so
 * the label is re-derived from it every render and stays correct however long the
 * payload sat in a cache. The `age` string is kept only as a fallback for a
 * response that predates the field.
 *
 * The snapshot path carries the measured duration instead, so its label advances
 * the same way -- a copy that keeps saying "1 jam lalu" a week later would be
 * lying, and caching is the only part of this page that can go stale with no
 * server to refresh it.
 */
export function ageLabel(item: ContentItem): string | null {
  if (item.publishedAt) {
    const elapsed = Date.now() - new Date(item.publishedAt).getTime();
    if (Number.isFinite(elapsed) && elapsed >= 0) return formatAge(elapsed);
  }

  if (item.age) return item.age;

  const captured = SNAPSHOT_AGES[item.videoId];
  if (captured === undefined) return null;

  const elapsed = Date.now() - new Date(SNAPSHOT_AT).getTime();
  // A clock behind the capture would produce a negative age, which is worse than
  // showing nothing.
  if (!Number.isFinite(elapsed) || elapsed < 0) return null;

  return formatAge(captured * SECOND + elapsed);
}

const INITIAL: State = {
  streams: [],
  videos: [],
  clips: [],
  // Null until the endpoint answers, and deliberately not a bundled copy. Every
  // other list falls back to the snapshot because a slightly old upload is still
  // true; a scheduled stream is a claim about a future that can be cancelled.
  upcoming: null,
  live: false,
  source: "loading",
  error: null,
};

/**
 * All three content lists.
 *
 * `/api/content` supplies the fresh lists and the one thing a bundled snapshot
 * cannot know: whether a stream is running right now. Until it answers the cards
 * come from the snapshot, so no section is ever empty. If the endpoint is missing
 * or errors, the snapshot stays and the visitor sees a correct, slightly older
 * page with no error.
 */
/**
 * How often to re-read the feed.
 *
 * Short enough that a stream starting is noticed while someone is looking at the
 * page, long enough not to hammer a serverless function. The endpoint's own edge
 * cache is what this sits behind.
 */
const POLL_MS = 60_000;

export function useContent(): State {
  const [state, setState] = useState<State>(INITIAL);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let failed = false;

    /*
     * Re-reads on a timer rather than once.
     *
     * A stream starts and ends while the page is open. Fetched once on mount, the
     * page would keep calling a finished broadcast live, or miss one that began
     * after it loaded, until the visitor reloaded by hand. The same reasoning the
     * endpoint caches for: a stale answer is worse here than a slightly late one,
     * because "live" is a claim about right now.
     *
     * Polling stops while the tab is hidden and resumes when it comes back, so a
     * tab left open in the background costs nothing.
     */
    async function load() {
      try {
        const res = await fetch("/api/content", {
          signal: controller.signal,
          // The edge holds this for minutes; without a bypass a poll would read
          // the same cached copy it just read.
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`api returned ${res.status}`);

        const payload = (await res.json()) as ApiPayload;
        if (!Array.isArray(payload.streams) || payload.streams.length === 0) {
          throw new Error("api returned no streams");
        }

        failed = false;
        setState({
          streams: payload.streams,
          videos: Array.isArray(payload.videos) ? payload.videos : [],
          clips: Array.isArray(payload.clips) ? payload.clips : [],
          // The endpoint decides whether anything is scheduled, so its answer
          // replaces any bundled copy outright: a stale upcoming card is a claim
          // about the future and must not age in place.
          upcoming: payload.upcoming ?? null,
          live: payload.streams.some((item) => item.live),
          source: "api",
          error: null,
        });
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        failed = true;
        setState({
          streams: SNAPSHOT_STREAMS,
          videos: SNAPSHOT_VIDEOS,
          clips: SNAPSHOT_CLIPS,
          // No snapshot copy on this path -- see the note on INITIAL.
          upcoming: null,
          live: false,
          source: "snapshot",
          error: error instanceof Error ? error.message : String(error),
        });
      }

      // Give up rather than retry a broken endpoint forever.
      if (!failed && !controller.signal.aborted) timer = setTimeout(load, POLL_MS);
    }

    void load();

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        if (timer) clearTimeout(timer);
        void load();
      } else if (timer) {
        clearTimeout(timer);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (timer) clearTimeout(timer);
      controller.abort();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return state;
}