import { useEffect, useMemo, useState } from "react";
import { Network } from "lucide-react";

export interface GraphNode {
  id: string;
  label: string;
  sub: string;
  layer: number;
}

interface Props {
  title: string;
  nodes: GraphNode[];
  edges: [string, string][];
  steps: string[];
}

const W = 480;
const H = 360;
const BOX_W = 104;
const BOX_H = 44;
const STEP_MS = 950;
const HOLD_MS = 2200;

interface Placed extends GraphNode {
  x: number;
  y: number;
}

export default function AgentGraph({ title, nodes, edges, steps }: Props) {
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"run" | "done">("run");

  useEffect(() => {
    if (reduced) {
      setStep(nodes.length - 1);
      setPhase("done");
      return;
    }
    let t = 0;
    const tick = () => {
      setStep((s) => {
        if (s >= nodes.length - 1) {
          setPhase("done");
          t = window.setTimeout(() => {
            setStep(0);
            setPhase("run");
            t = window.setTimeout(tick, STEP_MS);
          }, HOLD_MS);
          return s;
        }
        t = window.setTimeout(tick, STEP_MS);
        return s + 1;
      });
    };
    t = window.setTimeout(tick, STEP_MS);
    return () => window.clearTimeout(t);
  }, [nodes.length, reduced]);

  const placed = useMemo<Placed[]>(() => {
    const layers = new Map<number, GraphNode[]>();
    nodes.forEach((n) => {
      const arr = layers.get(n.layer) ?? [];
      arr.push(n);
      layers.set(n.layer, arr);
    });
    const maxLayer = Math.max(...nodes.map((n) => n.layer));
    const out: Placed[] = [];
    layers.forEach((arr, layer) => {
      const x = BOX_W / 2 + 12 + (layer / Math.max(maxLayer, 1)) * (W - BOX_W - 24);
      arr.forEach((n, i) => {
        const y = arr.length > 1 ? 180 + (i - (arr.length - 1) / 2) * 140 : 180;
        out.push({ ...n, x, y });
      });
    });
    return out;
  }, [nodes]);

  const byId = useMemo(() => new Map(placed.map((p) => [p.id, p])), [placed]);
  const visited = (i: number) => (phase === "done" ? true : i <= step);
  const activeId = phase === "run" ? nodes[step]?.id : null;

  const edgePath = (a: Placed, b: Placed) => {
    const x1 = a.x + BOX_W / 2;
    const x2 = b.x - BOX_W / 2;
    const mx = (x1 + x2) / 2;
    return `M ${x1} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${x2} ${b.y}`;
  };

  return (
    <div className="terminal-scanline rounded-terminal border border-edge bg-terminal/95 shadow-glow overflow-hidden">
      <div className="flex items-center gap-2 border-b border-edge px-3 py-2">
        <span className="flex gap-1.5">
          <i className="block size-2.5 rounded-full bg-dim-dot" />
          <i className="block size-2.5 rounded-full bg-dim-dot" />
          <i className="block size-2.5 rounded-full bg-glow animate-status" />
        </span>
        <span className="ml-2 flex items-center gap-1.5 font-mono text-micro text-fog">
          <Network className="size-3.5" />
          {title}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Agent execution trace">
        {edges.map(([from, to], i) => {
          const a = byId.get(from);
          const b = byId.get(to);
          if (!a || !b) return null;
          const d = edgePath(a, b);
          const firing = to === activeId;
          return (
            <g key={`${from}-${to}`}>
              <path d={d} fill="none" strokeWidth={1.5} className={firing ? "stroke-glow" : "stroke-edge"} />
              {!reduced && (
                <circle
                  r={3}
                  className="graph-pulse fill-glow"
                  style={{ offsetPath: `path("${d}")`, animationDelay: `${i * 0.4}s`, animationDuration: "2.4s" }}
                />
              )}
            </g>
          );
        })}

        {placed.map((n, i) => {
          const isActive = n.id === activeId;
          const isVisited = visited(i);
          return (
            <g key={n.id}>
              <rect
                x={n.x - BOX_W / 2}
                y={n.y - BOX_H / 2}
                width={BOX_W}
                height={BOX_H}
                rx={4}
                className={isActive ? "fill-raise stroke-glow" : "fill-panel stroke-edge"}
                strokeWidth={isActive ? 1.5 : 1}
              />
              <circle
                cx={n.x - BOX_W / 2 + 11}
                cy={n.y - 9}
                r={3}
                className={isActive ? "fill-glow animate-status" : isVisited ? "fill-glow" : "fill-dim-dot"}
              />
              <text x={n.x + 5} y={n.y - 5} textAnchor="middle" className="fill-mist font-mono text-tiny">
                {n.label}
              </text>
              <text x={n.x} y={n.y + 11} textAnchor="middle" className="fill-dim font-mono text-tiny">
                {n.sub}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="min-h-12 border-t border-edge px-4 py-2.5 font-mono text-code leading-relaxed">
        {phase === "run" ? (
          <p className="break-words">
            <span className="text-glow">› </span>
            <span className="text-mist">{steps[step] ?? ""}</span>
            <span className="animate-blink cursor-sm cursor ml-1" />
          </p>
        ) : (
          <p className="text-dim">
            <span className="text-glow">✓ </span>trace complete — {nodes.length}/{nodes.length} nodes · restarting…
          </p>
        )}
      </div>
    </div>
  );
}
