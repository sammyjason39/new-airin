import { PlayIcon } from "hugeicons-react";
import type { DesignPrompt } from "@/lib/design/types";

export function RecommendedCard({
  item,
  onPick,
  showPlay,
}: {
  item: DesignPrompt;
  onPick: () => void;
  showPlay: boolean;
}) {
  return (
    <button className="design-page__card" onClick={onPick} type="button">
      <span className="design-page__card-media">
        {item.thumbUrl ? (
          <img alt="" loading="lazy" src={item.thumbUrl} />
        ) : null}
        {showPlay ? (
          <span className="design-page__card-play">
            <PlayIcon aria-hidden className="size-3.5" />
          </span>
        ) : null}
      </span>
      <span className="design-page__card-title">{item.title}</span>
    </button>
  );
}
