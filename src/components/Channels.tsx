import { ArrowUpRight } from "@phosphor-icons/react";

import { channels } from "@/content/site";
import { Reveal } from "@/lib/reveal";

/**
 * Channel links as a full-bleed band. Layout family: one wide statement row per
 * channel, not cards. Kept separate from the upload grid above so the page does
 * not repeat a card layout twice in a row.
 *
 * Generated from the channel table rather than listed out, for the same reason
 * ChannelButtons is: the /channel page and the footer cannot disagree about
 * which accounts she has. All five rows come from places she or her channel
 * declared -- YouTube and X from her bio, Instagram, Trakteer and Pond of Dream
 * from the channel's own JSON-LD sameAs block.
 *
 * No email row. Her X bio routes business inquiries through her M-san rather
 * than publishing an address, and an invented one renders as a dead row rather
 * than as an absence.
 */
const ROWS = (Object.keys(channels) as (keyof typeof channels)[]).map((key) => ({
  key,
  label: channels[key].label,
  handle: channels[key].handle,
  note: channels[key].note,
  url: channels[key].url,
}));

/**
 * Channel links.
 *
 * `standalone` promotes the heading to an h1 and pads the top, for when this is
 * the whole page rather than the closing block of the home page. Two headings
 * on one page is the thing this flag exists to prevent.
 */
export function Channels({ standalone = false }: { standalone?: boolean } = {}) {
  const Heading = standalone ? "h1" : "h2";

  return (
    <section
      id={standalone ? "isi-channel" : "channel"}
      aria-labelledby="channels-heading"
      // See the note in Profile: pt- swaps the top gap only. The bottom gap has
      // to stay, or the last channel row touches the footer.
      className={standalone ? "pb-24 pt-24 md:pb-32 md:pt-32" : "py-24 md:py-32"}
    >
      <div className="shell">
        <Reveal amount={0.3}>
          <Heading
            id="channels-heading"
            className="max-w-[18ch] text-3xl font-semibold leading-tight tracking-tight md:text-4xl"
          >
            Di mana Zeya bisa ditemukan
          </Heading>
        </Reveal>

        <Reveal delay={0.06} amount={0.2}>
          <ul className="mt-12 border-t border-line">
            {ROWS.map((row) => (
              <li key={row.key} className="border-b border-line">
                <a
                  href={row.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid items-baseline gap-x-8 gap-y-1 py-7 transition-colors duration-200 hover:bg-surface sm:grid-cols-[11rem_1fr_auto]"
                >
                  <span className="font-display text-xl font-semibold tracking-tight text-fg">
                    {row.label}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-mono text-sm text-fg-muted">{row.handle}</span>
                    <span className="mt-1 block text-sm text-fg-subtle">{row.note}</span>
                  </span>
                  <ArrowUpRight
                    size={22}
                    aria-hidden="true"
                    className="shrink-0 self-center text-fg-subtle transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
                  />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}