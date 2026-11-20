import { Button } from "@airin/ui/button";
import { getDesignModel } from "@/lib/design/models";
import { filterDesignPrompts } from "@/lib/design/prompt-library";
import type { DesignPrompt, DesignResult } from "@/lib/design/types";
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

export function DesignResultsPanel({
  onClear,
  results,
}: {
  onClear: () => void;
  results: DesignResult[];
}) {
  return (
    <section className="design-page__section" style={{ marginTop: 0 }}>
      <h1 className="design-page__hero-title">Results</h1>
      {results.length > 0 ? (
        <div className="design-page__results-toolbar">
          <Button onClick={onClear} size="sm" type="button" variant="outline">
            Clear saved results
          </Button>
        </div>
      ) : null}
      {results.length === 0 ? (
        <p className="design-page__empty">No saved results yet.</p>
      ) : (
        <ul className="design-page__grid" style={{ marginTop: "1rem" }}>
          {results.map((item) => {
            const mediaUrl = item.videoUrl ?? item.imageUrl;

            const modelName =
              item.modelName ?? getDesignModel(item.model)?.name ?? item.model;

            return (
              <li
                className="design-page__card"
                key={item.id}
                style={{ cursor: "default" }}
              >
                <div className="design-page__card-media">
                  {mediaUrl ? (
                    item.kind === "video" ? (
                      <video
                        controls
                        preload="metadata"
                        src={mediaUrl}
                        style={{
                          height: "100%",
                          objectFit: "cover",
                          width: "100%",
                        }}
                      />
                    ) : (
                      <img alt="" src={mediaUrl} />
                    )
                  ) : (
                    <div className="design-page__empty flex h-full items-center justify-center">
                      No preview
                    </div>
                  )}
                </div>
                <div className="design-page__card-title">
                  <div className="line-clamp-2 text-muted-foreground">
                    {item.prompt}
                  </div>
                  <div className="mt-1">
                    {modelName} · {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
