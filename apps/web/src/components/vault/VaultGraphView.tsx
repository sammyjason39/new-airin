import {
  computeForceLayout,
  FORCE_LAYOUT_CANVAS,
  nodeRadius,
} from "@airin/core";
import type {
  VaultGraphEdgeResponse,
  VaultGraphNodeResponse,
} from "@airin/core/contract";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NOTE_TYPE_COLORS } from "@/components/vault/vault-shared";
import { useVaultGraph } from "@/hooks/use-org-vault";

type Props = {
  onSelectNote: (id: string) => void;
};

type LayoutNode = VaultGraphNodeResponse & { x: number; y: number };

const GRAPH_BG = "hsl(var(--background))";

const GRAPH_EDGE = "hsl(var(--border) / 0.8)";

const GRAPH_EDGE_HI = "hsl(var(--primary) / 0.55)";

const GRAPH_LABEL = "hsl(var(--muted-foreground))";

const GRAPH_LABEL_HI = "hsl(var(--foreground))";

const ZOOM_MIN = 0.35;

const ZOOM_MAX = 4.2;

const { width: CANVAS_W, height: CANVAS_H } = FORCE_LAYOUT_CANVAS;

// oxlint-disable-next-line react-doctor/no-giant-component -- Force-layout canvas, pan/zoom, and node hit targets stay in one SVG view.
export function VaultGraphView({ onSelectNote }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [viewport, setViewport] = useState({
    height: CANVAS_H,
    width: CANVAS_W,
  });

  const [hoverId, setHoverId] = useState<string | null>(null);
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });

  const dragRef = useRef<{
    lastX: number;
    lastY: number;
    panning: boolean;
  } | null>(null);

  const { data, isLoading } = useVaultGraph();

  useEffect(() => {
    const el = containerRef.current;

    if (!el) {
      return;
    }

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;

      if (width > 0 && height > 0) {
        setViewport({ height, width });
      }
    });

    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  const positioned = useMemo((): LayoutNode[] => {
    const nodes = data?.nodes ?? [];
    const edges = data?.edges ?? [];

    if (!nodes.length) {
      return [];
    }

    const layout = computeForceLayout(
      nodes.map((n) => ({
        id: n.id,
        linkCount: n.linkCount,
        title: n.title,
        vx: 0,
        vy: 0,
      })),
      edges.map((e) => ({ source: e.source, target: e.target }))
    );

    const posMap = new Map(layout.map((n) => [n.id, n]));

    return nodes.map((n) => {
      const p = posMap.get(n.id);

      if (!p) {
        return { ...n, x: CANVAS_W / 2, y: CANVAS_H / 2 };
      }

      return { ...n, x: p.x, y: p.y };
    });
  }, [data?.edges, data?.nodes]);

  const posMap = useMemo(
    () => new Map(positioned.map((n) => [n.id, n])),
    [positioned]
  );

  const neighborSet = useMemo(() => {
    if (!(hoverId && data?.edges)) {
      return new Set<string>();
    }

    const s = new Set<string>([hoverId]);

    for (const e of data.edges) {
      if (e.source === hoverId) {
        s.add(e.target);
      }

      if (e.target === hoverId) {
        s.add(e.source);
      }
    }

    return s;
  }, [data?.edges, hoverId]);

  const clientToViewBox = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;

    if (!svg) {
      return null;
    }

    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();

    if (!ctm) {
      return null;
    }

    return pt.matrixTransform(ctm.inverse());
  }, []);

  const screenDeltaToViewBox = useCallback(
    (clientX: number, clientY: number, dx: number, dy: number) => {
      const svg = svgRef.current;

      if (!svg) {
        return { x: dx, y: dy };
      }

      const ctm = svg.getScreenCTM();

      if (!ctm) {
        return { x: dx, y: dy };
      }

      const inv = ctm.inverse();
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const a = pt.matrixTransform(inv);
      pt.x = clientX + dx;
      pt.y = clientY + dy;
      const b = pt.matrixTransform(inv);

      return { x: b.x - a.x, y: b.y - a.y };
    },
    []
  );

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const viewPt = clientToViewBox(e.clientX, e.clientY);

      if (!viewPt) {
        return;
      }

      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      setTransform((t) => {
        const newK = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, t.k * factor));
        const localX = (viewPt.x - t.x) / t.k;
        const localY = (viewPt.y - t.y) / t.k;

        return {
          k: newK,
          x: viewPt.x - localX * newK,
          y: viewPt.y - localY * newK,
        };
      });
    },
    [clientToViewBox]
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) {
      return;
    }

    // SAFETY: Pointer events on the graph surface originate from SVG subtree nodes.
    const tag = (e.target as SVGElement).tagName?.toLowerCase();

    if (tag === "circle" || tag === "text") {
      return;
    }

    dragRef.current = { lastX: e.clientX, lastY: e.clientY, panning: true };
    containerRef.current?.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const d = dragRef.current;

      if (!d?.panning) {
        return;
      }

      const dx = e.clientX - d.lastX;
      const dy = e.clientY - d.lastY;
      d.lastX = e.clientX;
      d.lastY = e.clientY;
      const viewDelta = screenDeltaToViewBox(e.clientX, e.clientY, dx, dy);
      setTransform((t) => ({
        ...t,
        x: t.x + viewDelta.x,
        y: t.y + viewDelta.y,
      }));
    },
    [screenDeltaToViewBox]
  );

  const onPointerUp = useCallback(() => {
    if (dragRef.current) {
      dragRef.current.panning = false;
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        Loading graph…
      </div>
    );
  }

  if (!data?.nodes?.length) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        No notes yet. Create a note to see the graph.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-border border-b bg-background px-4 py-2 text-muted-foreground text-xs">
        <span>
          {data.nodes.length} notes · {data.edges.length} links
        </span>
        <span className="opacity-60">Scroll to zoom · drag to pan</span>
        {Object.entries(NOTE_TYPE_COLORS).map(([type, color]) => (
          <span className="inline-flex items-center gap-1" key={type}>
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: color }}
            />
            {type}
          </span>
        ))}
      </div>

      <div
        className="relative min-h-0 flex-1 cursor-grab overflow-hidden active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerLeave={onPointerUp}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
        ref={containerRef}
        style={{ background: GRAPH_BG }}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          height={viewport.height}
          preserveAspectRatio="xMidYMid meet"
          ref={svgRef}
          viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
          width={viewport.width}
        >
          <g
            transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}
          >
            {data.edges.map((e: VaultGraphEdgeResponse) => {
              const s = posMap.get(e.source);
              const t = posMap.get(e.target);

              if (!(s && t)) {
                return null;
              }

              const highlighted =
                hoverId !== null &&
                (e.source === hoverId || e.target === hoverId);

              const dimmed = hoverId !== null && !highlighted;

              return (
                <line
                  key={e.id}
                  stroke={highlighted ? GRAPH_EDGE_HI : GRAPH_EDGE}
                  strokeOpacity={dimmed ? 0.12 : highlighted ? 0.9 : 0.4}
                  strokeWidth={highlighted ? 1.5 : 1}
                  x1={s.x}
                  x2={t.x}
                  y1={s.y}
                  y2={t.y}
                />
              );
            })}

            {positioned.map((n) => {
              const color = NOTE_TYPE_COLORS[n.noteType] ?? "#60a5fa";
              const active = hoverId === n.id;
              const neighbor = neighborSet.has(n.id);
              const dimmed = hoverId !== null && !active && !neighbor;
              const r = nodeRadius(n.linkCount, active);

              const label =
                n.title.length > 28 ? `${n.title.slice(0, 26)}…` : n.title;

              return (
                <g
                  className="cursor-pointer"
                  key={n.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectNote(n.id);
                  }}
                  onMouseEnter={() => setHoverId(n.id)}
                  onMouseLeave={() => setHoverId(null)}
                  style={{ opacity: dimmed ? 0.22 : 1 }}
                >
                  <circle
                    cx={n.x}
                    cy={n.y}
                    fill={
                      active || neighbor
                        ? color
                        : "hsl(var(--foreground) / 0.55)"
                    }
                    fillOpacity={active ? 1 : neighbor ? 0.92 : 0.75}
                    r={r}
                    stroke={active ? "hsl(var(--foreground))" : "transparent"}
                    strokeWidth={1.5}
                  />
                  <text
                    className="pointer-events-none select-none"
                    dominantBaseline="middle"
                    style={{
                      fill: active || neighbor ? GRAPH_LABEL_HI : GRAPH_LABEL,
                      fontSize: active ? 11 : 10,
                      fontWeight: active ? 600 : 400,
                    }}
                    textAnchor="start"
                    x={n.x + r + 8}
                    y={n.y + 1}
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
