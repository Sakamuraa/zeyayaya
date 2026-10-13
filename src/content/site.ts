/**
 * Identity strings, sourced from the real channel.
 *
 * Provenance, so nothing here has to be trusted on faith:
 *   - name, bio ................. YouTube channel description, verbatim, and the
 *                                 X profile display name
 *   - channel title ............. "Zeyayaya", the channel's own title
 *   - avatar .................... yt3.googleusercontent.com (channel avatar)
 *   - join date ................. channel /about page, "Bergabung pada 12 Des
 *                                 2021"
 *   - channels .................. the four links in the channel's own JSON-LD
 *                                 sameAs block (Pond of Dream, Instagram, X,
 *                                 Trakteer), plus the channel itself
 *   - character credits ......... her X bio, kept as she wrote them: "ママ:
 *                                 @Ikazu401 | パパ： @re_reinly"
 *   - hashtags .................. #haizeyart from her X bio ("🎨Art:
 *                                 #haizeyart"); #merchaizeya from her own post
 *                                 telling buyers to photo-post with it
 *   - series .................... bracket prefixes read off the feed titles
 *
 * The content lists are NOT here. They come from /api/content at request time
 * and keep only a bundled snapshot in src/lib/useContent.ts, so there is one
 * place to look for broadcast data instead of two that can drift apart.
 */

export const site = {
  /**
   * The persona's own name: "Hai, aku Zeya Haize", from her channel description.
   * The channel title is the separate thing below.
   */
  name: "Zeya Haize",
  /** Name as it appears on the primary channel, verbatim. */
  channelTitle: "Zeyayaya",
  /**
   * Her channel description, kept exactly as published. It opens with the
   * English welcome line, switches to Indonesian for the self-introduction, and
   * names the community at the end -- "Dream Dwellers" in "Pond of Dream" are
   * her words, not this page's.
   */
  bio: "✧˚· Welcome home, your dream keeper here! ·˚✧ Hai, aku Zeya Haize. Penjaga mimpimu agar tidurmu nyenyak. HAIZEYAYAYA!!!~ ☁💤 Let's be my \"Dream Dwellers\" in \"Pond of Dream\"!",
  /**
   * Production origin. The site is served from its own subdomain, so the origin
   * and the site URL are the same thing. Kept in sync with index.html,
   * robots.txt, and sitemap.xml.
   */
  url: "https://zeyayaya.vtube-info.xyz",
  locale: "id_ID",
  avatar: "/media/avatar-youtube.webp",
  avatarAlt:
    "Ilustrasi Zeya Haize: karakter dengan rambut biru langit lembut dan mata berkilau keemasan",
  /** Smaller crop used for the nav mark, where the square version is too heavy. */
  avatarSmall: "/media/avatar-x.webp",
  joined: "Bergabung pada Desember 2021",
  /**
   * Character work credits, from the creator's own X bio.
   *
   * The bio says "ママ: @Ikazu401 | パパ： @re_reinly". Those marks are kept
   * because they are how she wrote them, not normalised into job titles she did
   * not use -- "Mama" and "Papa" are the community's words for the character's
   * illustrator and rigger, and translating them into those titles here would be
   * this page's claim rather than hers.
   *
   * Her manager ("📞M-san: @verbotenviking", same bio) is deliberately not in
   * this list: the section is headed "Credit karakter", and a manager is not a
   * character credit.
   */
  credits: [
    { role: "Mama", name: "@Ikazu401" },
    { role: "Papa", name: "@re_reinly" },
  ],
} as const;

/**
 * Every place she is.
 *
 * The first two are the accounts named in her X bio and channel. The other
 * three come from the channel's own JSON-LD `sameAs` block -- the links YouTube
 * renders on the /about page under "link lainnya" -- so each row points at a
 * page the channel itself declares:
 *
 *   join.pondofdream.com ....... "Pond of Dream", the community her description
 *                                invites readers into
 *   instagram.com/zeyahaize .... declared link
 *   trakteer.id/ZeyaHaize ...... declared link, her donation page
 *
 * No email row: her X bio routes business inquiries through her M-san rather
 * than publishing an address, and an invented one renders as a dead row.
 */
export const channels = {
  youtube: {
    label: "YouTube",
    handle: "@ZeyaHaize",
    url: "https://www.youtube.com/@ZeyaHaize",
    note: "Stream & upload",
  },
  x: {
    label: "X",
    handle: "@zeyahaize",
    url: "https://x.com/zeyahaize",
    note: "Update & art",
  },
  instagram: {
    label: "Instagram",
    handle: "@zeyahaize",
    url: "https://instagram.com/zeyahaize",
    note: "Foto",
  },
  trakteer: {
    label: "Trakteer",
    handle: "ZeyaHaize",
    url: "https://trakteer.id/ZeyaHaize",
    note: "Dukung Zeya",
  },
  pond: {
    label: "Pond of Dream",
    handle: "join.pondofdream.com",
    url: "https://join.pondofdream.com",
    note: "Komunitas",
  },
} as const;

/**
 * Route table.
 *
 * Owned here rather than in App.tsx so the nav and the router cannot disagree
 * about which paths exist. App imports the type; nothing else needs the list.
 */
export const ROUTES = [
  "/",
  "/tentang",
  "/konten",
  "/konten/streams",
  "/konten/video",
  "/konten/clips",
  "/tweets",
  "/fanart",
  "/channel",
] as const;

export type Route = (typeof ROUTES)[number];
/**
 * The tags shown on this site, each one sourced to a place she wrote it.
 *
 * #haizeyart is in her X bio, labelled "🎨Art" by her -- a tag she defines for
 * her art, which is why /fanart searches it rather than borrowing a community
 * tag. #merchaizeya is the tag she asked buyers to use when posting photos of
 * the merch ("foto dan posting dengan hashtag #merchaizeya").
 *
 * Event tags from the same timeline (#CF23Catalogue, #comifuro23) are left out:
 * they name a convention booth, not her, and a search on them returns every
 * seller at that booth.
 */
export const hashtags = [
  { tag: "#haizeyart", use: "Fan art" },
  { tag: "#merchaizeya", use: "Merch" },
] as const;

/**
 * Series names exactly as they appear between the brackets in the feed titles.
 * The "kind" column is a plain reading of what the title is about, not a claim
 * from the creator.
 *
 * Read off the titles rather than assumed. Her recent broadcasts open with
 * 【HANDCAM】, 【GIVEAWAY】, 【HOW TO FISH】, 【BOMBANANA!】 and 【RANDOM】 -- the
 * brackets are her own segmentation, repeated across weeks, so the column is
 * that pattern with the brackets stripped.
 *
 * Campaign-specific brackets (【OPEN PO MERCH CF23】, 【MEMBER 2ND ANNIV & DEBUT
 * 1ST ANNIV】) are not listed: they name one event each, which makes them titles
 * rather than series.
 */
export const series = [
  { name: "Handcam", kind: "Stream" },
  { name: "Giveaway", kind: "Event" },
  { name: "How to Fish", kind: "Stream" },
  { name: "Bombanana!", kind: "Game" },
  { name: "Random", kind: "Ngobrol" },
] as const;

/**
 * Colophon. A credit line naming who built the page. Kept as a footnote, not a
 * showcase section.
 */
export const colophon = {
  /** Credit line. Replaces a former tool list, which described the stack rather than the person. */
  credit: "Developed by Sakamura",
} as const;

/**
 * Nav links.
 *
 * Every href is a full route, never a bare "#anchor". That is the fix for the
 * footer bug: on /konten, "#tentang" and "#channel" resolved against a page that
 * has neither section, so both looked clickable and did nothing. A path always
 * resolves, and the nav and the router now read the same table.
 *
 * `satisfies` ties every href to the Route union, so a typo becomes a type error
 * rather than a link that quietly goes nowhere.
 */
export const navigation = [
  { label: "Tentang", href: "/tentang" },
  { label: "Konten", href: "/konten" },
  { label: "Tweets", href: "/tweets" },
  { label: "Fan Art", href: "/fanart" },
  { label: "Channel", href: "/channel" },
] as const satisfies ReadonlyArray<{ label: string; href: Route }>;
