import { Button } from "@airin/ui/button";
import { Loading03Icon } from "hugeicons-react";
import { useState } from "react";
import { getDesignModel } from "@/lib/design/models";
import { filterDesignPrompts } from "@/lib/design/prompt-library";
import type {
  DesignPendingGeneration,
  DesignPrompt,
  DesignResult,
} from "@/lib/design/types";
import { RecommendedCard } from "@/pages/design/design-page-cards";

export function DesignLibraryPanel({
  onPick,
}: {
  onPick: (item: DesignPrompt) => void;
}) {
  return (
    <section className="design-page__section" style={{ marginTop: 0 }}>
      <h1 className="design-page__hero-title">Library</h1>
      <ul className="design-page__grid" style={{ marginTop: "1rem" }}>
        {filterDesignPrompts("").map((item) => (
          <li key={item.id}>
            <RecommendedCard
              item={item}
              onPick={() => onPick(item)}
              showPlay={false}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function DesignPendingCard({ pending }: { pending: DesignPendingGeneration }) {
  const modelName = getDesignModel(pending.model)?.name ?? pending.model;

  return (
    <li className="design-page__card" style={{ cursor: "default" }}>
      <div
        aria-busy="true"
        aria-live="polite"
        className="design-page__card-media design-page__card-media--pending"
      >
        <span className="design-page__media-shimmer" />
        <span className="design-page__media-loading">
          <Loading03Icon
            aria-hidden
            className="size-5 motion-safe:animate-spin"
          />
        </span>
      </div>
      <div className="design-page__card-title">
        <div className="line-clamp-2 text-muted-foreground">
          {pending.prompt}
        </div>
        <div className="mt-1">{modelName}</div>
      </div>
    </li>
  );
}

function DesignResultCard({ item }: { item: DesignResult }) {
  const mediaUrl = item.videoUrl ?? item.imageUrl;
  const [mediaReady, setMediaReady] = useState(!mediaUrl);

  const modelName =
    item.modelName ?? getDesignModel(item.model)?.name ?? item.model;

  return (
    <li className="design-page__card" style={{ cursor: "default" }}>
      <div className="design-page__card-media">
        {mediaUrl ? (
          <>
            {mediaReady ? null : (
              <span className="design-page__media-shimmer" />
            )}
            {mediaReady ? null : (
              <span className="design-page__media-loading">
                <Loading03Icon
                  aria-hidden
                  className="size-5 motion-safe:animate-spin"
                />
              </span>
            )}
            {item.kind === "video" ? (
              <video
                className={
                  mediaReady
                    ? "design-page__media-ready"
                    : "design-page__media-pending"
                }
                controls
                onLoadedData={() => setMediaReady(true)}
                preload="metadata"
                src={mediaUrl}
              />
            ) : (
              <img
                alt=""
                className={
                  mediaReady
                    ? "design-page__media-ready"
                    : "design-page__media-pending"
                }
                onLoad={() => setMediaReady(true)}
                src={mediaUrl}
              />
            )}
          </>
        ) : (
          <div className="design-page__empty flex h-full items-center justify-center">
            No preview
          </div>
        )}
      </div>
      <div className="design-page__card-title">
        <div className="line-clamp-2 text-muted-foreground">{item.prompt}</div>
        <div className="mt-1">
          {modelName} · {new Date(item.createdAt).toLocaleString()}
        </div>
      </div>
    </li>
  );
}

export function DesignResultsPanel({
  onClear,
  pendingGeneration,
  results,
}: {
  onClear: () => void;
  pendingGeneration: DesignPendingGeneration | null;
  results: DesignResult[];
}) {
  const empty = results.length === 0 && pendingGeneration == null;

  return (
    <section className="design-page__section" style={{ marginTop: 0 }}>
      <h1 className="design-page__hero-title">Results</h1>
      {results.length > 0 && pendingGeneration == null ? (
        <div className="design-page__results-toolbar">
          <Button onClick={onClear} size="sm" type="button" variant="outline">
            Clear saved results
          </Button>
        </div>
      ) : null}
      {empty ? (
        <p className="design-page__empty">No saved results yet.</p>
      ) : (
        <ul className="design-page__grid" style={{ marginTop: "1rem" }}>
          {pendingGeneration ? (
            <DesignPendingCard pending={pendingGeneration} />
          ) : null}
          {results.map((item) => (
            <DesignResultCard item={item} key={item.id} />
          ))}
        </ul>
      )}
    </section>
  );
}
