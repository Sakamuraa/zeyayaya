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
const SNAPSHOT_AT = "2026-10-13T05:20:59.024Z";

/**
 * Bundled copies of the three lists, taken 2026-10-13.
 *
 * The fallback for a static host with no serverless runtime, and for the window
 * before the fetch resolves. Ages are the channel's own labels from that moment,
 * stored as seconds so `formatAge` can advance them: a snapshot that keeps
 * saying "1 jam lalu" a week later would be lying, and this is the only part of
 * the page that can go stale with no server to refresh it.
 */
const SNAPSHOT_STREAMS: ContentItem[] = [
{"videoId":"uTwbNPaPlKo","url":"https://www.youtube.com/watch?v=uTwbNPaPlKo","title":"【 Handcam 】Nyobain 28 Pop Ice + Tierlist","thumbnail":"https://i.ytimg.com/vi/uTwbNPaPlKo/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLD-4oMyx38zmiWQXAd5MbghJnR0hg","live":false,"viewers":null,"age":null,"duration":null},
{"videoId":"tr5mTgkiU-I","url":"https://www.youtube.com/watch?v=tr5mTgkiU-I","title":"senin pagi, enaknya tidur","thumbnail":"https://i.ytimg.com/vi/tr5mTgkiU-I/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDJh_o3nPk6qTdqBQ0WFycas3vltQ","live":false,"viewers":null,"age":null,"duration":null},
{"videoId":"CprroxCEEi0","url":"https://www.youtube.com/watch?v=CprroxCEEi0","title":"【 Overcooked2 】membuka restoran bersama @GabrielAbyssia","thumbnail":"https://i.ytimg.com/vi/CprroxCEEi0/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCNm2kHsFkzA-OnzghOMmnzsr7mrQ","live":false,"viewers":null,"age":null,"duration":null},
{"videoId":"iZa6UXNmhp4","url":"https://www.youtube.com/watch?v=iZa6UXNmhp4","title":"selamat pagi ini Senin","thumbnail":"https://i.ytimg.com/vi/iZa6UXNmhp4/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBhqDt9CKM_BkA4jTPXv89fZ-Ep_A","live":false,"viewers":null,"age":null,"duration":null},
{"videoId":"LP1gkarXSEU","url":"https://www.youtube.com/watch?v=LP1gkarXSEU","title":"【 Karaoke 】mood karaoke minggu","thumbnail":"https://i.ytimg.com/vi/LP1gkarXSEU/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCTyLThSeLBgFv6tRU_etYYkfmcVQ","live":false,"viewers":null,"age":null,"duration":null},
{"videoId":"PXGnxi5HQIw","url":"https://www.youtube.com/watch?v=PXGnxi5HQIw","title":"vtuber morning person","thumbnail":"https://i.ytimg.com/vi/PXGnxi5HQIw/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDlXOWrH2Ymy8oVZ-DK76pqfX5Fjw","live":false,"viewers":null,"age":null,"duration":null},
{"videoId":"UEs0Ye2NftY","url":"https://www.youtube.com/watch?v=UEs0Ye2NftY","title":"【 The Professional 】dulu aku rage quit main ini, mau coba lagi","thumbnail":"https://i.ytimg.com/vi/UEs0Ye2NftY/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCzb96lIjyZ2zrbyOc4DKBpk1t1Cw","live":false,"viewers":null,"age":null,"duration":null},
{"videoId":"Lvy51eBZdZs","url":"https://www.youtube.com/watch?v=Lvy51eBZdZs","title":"【 Genshin Impact 】update 7.1 Archon Quest lesgoww","thumbnail":"https://i.ytimg.com/vi/Lvy51eBZdZs/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBDf1oJt620HnN6D8Xe4K9q-wthgA","live":false,"viewers":null,"age":null,"duration":null},
];

const SNAPSHOT_VIDEOS: ContentItem[] = [
{"videoId":"0vNRiQRoeEc","url":"https://www.youtube.com/watch?v=0vNRiQRoeEc","title":"ノンブレス・オブリージュ Non-Breath Oblige / Astelica Kasdea & Rusami Khau 【COVER】","thumbnail":"https://i.ytimg.com/vi/0vNRiQRoeEc/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBmJGp5vY1ryW-jxT1pzXG7a9w9PQ","live":false,"viewers":null,"age":null,"duration":null},
{"videoId":"AnDt0-2t9eM","url":"https://www.youtube.com/watch?v=AnDt0-2t9eM","title":"悪魔の子 Akuma no Ko (TV size) / Astelica Kasdea 【COVER】","thumbnail":"https://i.ytimg.com/vi/AnDt0-2t9eM/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDbKb74vC5NHcE_wKrdwDTl4lWvvQ","live":false,"viewers":null,"age":null,"duration":null},
{"videoId":"KbpUmIgWP4Q","url":"https://www.youtube.com/watch?v=KbpUmIgWP4Q","title":"If I Can Stop One Heart From Breaking 【cover by Astelica Kasdea】Honkai:Star Rail","thumbnail":"https://i.ytimg.com/vi/KbpUmIgWP4Q/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAXIjso5op6AeA59AZDeeK1Yr2S1Q","live":false,"viewers":null,"age":null,"duration":null},
{"videoId":"nZ9__RuEZPE","url":"https://www.youtube.com/watch?v=nZ9__RuEZPE","title":"Behind The Screen","thumbnail":"https://i.ytimg.com/vi/nZ9__RuEZPE/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDAt-vdwWGK5CScORH8c1khOktzbw","live":false,"viewers":null,"age":null,"duration":null},
{"videoId":"dXMcrbmzCHc","url":"https://www.youtube.com/watch?v=dXMcrbmzCHc","title":"Medley - Gumilar Indonesia (Cover)","thumbnail":"https://i.ytimg.com/vi/dXMcrbmzCHc/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAIqTxZ_t3soaaYz60AyF3pOppphw","live":false,"viewers":null,"age":null,"duration":null},
{"videoId":"uCFGgazV6Ts","url":"https://www.youtube.com/watch?v=uCFGgazV6Ts","title":"デーモンロード (Demon Lord) by Kanaria / Astelica Kasdea 【COVER】","thumbnail":"https://i.ytimg.com/vi/uCFGgazV6Ts/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLA4ZmAe-2ol803rSk4b-NNgCoWXdQ","live":false,"viewers":null,"age":null,"duration":null},
{"videoId":"G3Ih8qaQZcE","url":"https://www.youtube.com/watch?v=G3Ih8qaQZcE","title":"強風オールバック (Kyoufuu All Back) / Astelica Kasdea 【COVER】","thumbnail":"https://i.ytimg.com/vi/G3Ih8qaQZcE/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCS9Li7qc01BQTn24Hr_JuFXJ-NUA","live":false,"viewers":null,"age":null,"duration":null},
{"videoId":"MeFP29Wg6J4","url":"https://www.youtube.com/watch?v=MeFP29Wg6J4","title":"CH4NGE - Giga / Astelica Kasdea 【COVER】","thumbnail":"https://i.ytimg.com/vi/MeFP29Wg6J4/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAWaqNk5aPET6aJGkftgBelNBqU5g","live":false,"viewers":null,"age":null,"duration":null},
{"videoId":"k8d7nIy0jhg","url":"https://www.youtube.com/watch?v=k8d7nIy0jhg","title":"キャットラビング (Cat Rubbing) by 香椎モイミ / Astelica Kasdea 【COVER】","thumbnail":"https://i.ytimg.com/vi/k8d7nIy0jhg/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDqB2Y3YgHUA4EmTgz5SXPXrnjKVg","live":false,"viewers":null,"age":null,"duration":null},
{"videoId":"AwdTwah78Ac","url":"https://www.youtube.com/watch?v=AwdTwah78Ac","title":"Astelica Kasdea 2.0 - Trailer","thumbnail":"https://i.ytimg.com/vi/AwdTwah78Ac/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDax9nmFAL_7RKrR7cS_sOsGM-hKw","live":false,"viewers":null,"age":null,"duration":null},
{"videoId":"ax2OP_5-CY0","url":"https://www.youtube.com/watch?v=ax2OP_5-CY0","title":"ヴァンパイア (The Vampire) by DECO*27 / Astelica Kasdea 【COVER】","thumbnail":"https://i.ytimg.com/vi/ax2OP_5-CY0/hq720.jpg?sqp=-oaymwE2CNAFEJQDSFXyq4qpAygIARUAAIhCGAFwAcABBvABAfgB_gmAAtAFigIMCAAQARh_IBMoNTAP&rs=AOn4CLDosz3Z6sRTnOf8-eCCs6DaMuvg5g","live":false,"viewers":null,"age":null,"duration":null},
{"videoId":"-hsTZguqIfY","url":"https://www.youtube.com/watch?v=-hsTZguqIfY","title":"酔いどれ知らず (Yoidore Shirazu) by Kanaria / Astelica Kasdea 【COVER】","thumbnail":"https://i.ytimg.com/vi/-hsTZguqIfY/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBxS1IolO8KDFFpqiaGXXPyhpd4rw","live":false,"viewers":null,"age":null,"duration":null},
];

const SNAPSHOT_CLIPS: ContentItem[] = [
{"videoId":"QwMjdpWVuC4","url":"https://www.youtube.com/watch?v=QwMjdpWVuC4","title":"Chemistry Antar Chef Diuji! [Gabriel Abyssia, Astelica Kasdea]","thumbnail":"https://i.ytimg.com/vi/QwMjdpWVuC4/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDZUZpNOZ3-UuCAs2zq3lg8GdgDjw","live":false,"viewers":null,"age":null,"duration":"6.23","channel":"Heyy"},
{"videoId":"8apNCXAVkUA","url":"https://www.youtube.com/watch?v=8apNCXAVkUA","title":"Kak Dea Best Moments ! [Astelica Kasdea]","thumbnail":"https://i.ytimg.com/vi/8apNCXAVkUA/hqdefault.jpg?sqp=-oaymwEcCOADEI4CSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCPZiG83ZFWFebZjcrxOSBcPLnjMA","live":false,"viewers":null,"age":null,"duration":"4.00","channel":"kasclipper"},
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