import { useEffect, useRef, useState } from "react";import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  CodeXml,
  Image as ImageIcon,
  User,
} from "lucide-react";
import type { Project } from "./types";

function isSet(url: string | undefined): url is string {
  return !!url && url !== "#";
}

function SafeImage({ src, alt, className, eager }: { src: string; alt: string; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // catch images that already failed before hydration attached onError
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, [src]);
  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 border border-dashed border-edge bg-void p-8 text-center ${className ?? ""}`}
      >
        <ImageIcon className="size-6 text-dim" />
        <p className="font-mono text-micro text-dim">placeholder</p>
        <p className="font-mono text-micro text-glow/80">{src}</p>
        <p className="font-mono text-tiny text-dim">replace with showcase image</p>
      </div>
    );
  }
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      width={800}
      height={350}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "auto"}
      onError={() => setFailed(true)}
      className={`border border-edge bg-void object-cover ${className ?? ""}`}
    />
  );
}

function ProjectModal({ project, open, onOpenChange }: { project: Project; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [idx, setIdx] = useState(0);
  const gallery = project.gallery.length ? project.gallery : [project.cover];
  const prev = () => setIdx((i) => (i - 1 + gallery.length) % gallery.length);
  const next = () => setIdx((i) => (i + 1) % gallery.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dialog-scroll dialog-wide overflow-y-auto border-edge bg-panel p-0">
        <div className="border-b border-edge px-5 py-3 font-mono text-micro text-fog">
          <span className="text-glow">$</span> cat ./case-study/{project.id}.md
        </div>
        <div className="space-y-5 p-5">
          <DialogHeader>
            <Badge variant="outline" className="w-fit border-edge font-mono text-tiny text-glow">
              {project.tag}
            </Badge>
            <DialogTitle className="font-mono text-xl text-slate-100">{project.title}</DialogTitle>
            <DialogDescription className="text-sm text-fog">{project.oneLiner}</DialogDescription>
          </DialogHeader>

          <div>
            <div className="relative">
              <SafeImage src={gallery[idx]} alt={`${project.title} — ${project.tag} screenshot ${idx + 1} of ${gallery.length}`} className="cover-ratio w-full" />
              {gallery.length > 1 && (
                <>
                  <Button size="icon-sm" variant="outline" onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 border-edge bg-void/90" aria-label={`Previous image for ${project.title}`}>
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button size="icon-sm" variant="outline" onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 border-edge bg-void/90" aria-label={`Next image for ${project.title}`}>
                    <ChevronRight className="size-4" />
                  </Button>
                </>
              )}
            </div>
            <div className="mt-2 flex gap-2">
              {gallery.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`View ${project.title} screenshot ${i + 1}`}
                  className={`h-12 w-20 overflow-hidden border font-mono text-tiny ${i === idx ? "border-glow" : "border-edge opacity-60 hover:opacity-100"}`}
                >
                  <SafeImage src={g} alt={`${project.title} thumbnail ${i + 1}`} className="h-full w-full" />
                </button>
              ))}
              <span className="ml-auto self-center font-mono text-micro text-dim">
                {idx + 1}/{gallery.length}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-micro text-fog">
            <span className="inline-flex items-center gap-1.5 border border-edge px-2 py-1">
              <User className="size-3 text-glow" /> {project.role}
            </span>
            {project.metrics.map((m) => (
              <span key={m.label} className="border border-edge px-2 py-1">
                <span className="text-dim">{m.label}:</span> <span className="text-slate-200">{m.value}</span>
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((s) => (
              <Badge key={s} variant="secondary" className="border border-edge bg-raise font-mono text-tiny text-fog">
                {s}
              </Badge>
            ))}
          </div>

          <Separator className="bg-edge" />

          <div className="grid gap-4 text-sm leading-relaxed text-slate-300">
            <div>
              <h4 className="mb-1 font-mono text-micro uppercase tracking-widest text-glow">{"// situation"}</h4>
              <p>{project.caseStudy.situation}</p>
            </div>
            <div>
              <h4 className="mb-1 font-mono text-micro uppercase tracking-widest text-glow">{"// task"}</h4>
              <p>{project.caseStudy.task}</p>
            </div>
            <div>
              <h4 className="mb-1 font-mono text-micro uppercase tracking-widest text-glow">{"// action"}</h4>
              <ul className="list-none space-y-1.5">
                {project.caseStudy.action.map((a, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-mono text-glow">›</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-1 font-mono text-micro uppercase tracking-widest text-glow">{"// results"}</h4>
              <ul className="list-none space-y-1.5">
                {project.caseStudy.results.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-mono text-glow">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProjectGrid({ projects, layout }: { projects: Project[]; layout: "large" | "compact" }) {
  const [active, setActive] = useState<Project | null>(null);

  // cross-island bridge: CommandMenu dispatches this to open a case study directly
  useEffect(() => {
    const onOpen = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      const found = projects.find((p) => p.id === id);
      if (found) setActive(found);
    };
    window.addEventListener("portfolio:open-project", onOpen);
    return () => window.removeEventListener("portfolio:open-project", onOpen);
  }, [projects]);

  return (
    <>
      <div className={layout === "large" ? "grid gap-5" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
        {projects.map((p, i) => (
          <article
            key={p.id}
            id={`project-${p.id}`}
            className={
              layout === "large"
                ? "reveal panel group grid scroll-mt-20 transition-colors hover:border-glow/40 md:grid-cols-2"
                : "reveal panel group flex scroll-mt-20 flex-col transition-colors hover:border-glow/40"
            }
          >
            {layout === "large" ? (
              <SafeImage src={p.cover} alt={`${p.title} — ${p.tag}: ${p.oneLiner}`} eager={i === 0} className="block h-auto w-full border-b border-edge md:border-b-0 md:border-r" />
            ) : (
              <SafeImage src={p.cover} alt={`${p.title} — ${p.tag}: ${p.oneLiner}`} className="cover-ratio block w-full border-b border-edge" />
            )}
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-center justify-between font-mono text-micro">
                <span className="text-glow">[{p.tag}]</span>
                <span className="text-dim">0{i + 1}</span>
              </div>
              <h3 className="font-mono text-lg font-semibold text-slate-100">
                <a href={`/work/${p.id}/`} className="transition-colors hover:text-glow">
                  {p.title}
                </a>
              </h3>
              <p className="text-body-sm font-medium leading-snug text-slate-300">{p.oneLiner}</p>
              <p className="text-body-sm leading-relaxed text-fog">{p.body}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.stack.slice(0, layout === "large" ? 6 : 4).map((s) => (
                  <Badge key={s} variant="secondary" className="border border-edge bg-raise font-mono text-tiny text-fog">
                    {s}
                  </Badge>
                ))}
                {p.stack.length > (layout === "large" ? 6 : 4) && (
                  <span className="font-mono text-tiny text-dim">+{p.stack.length - (layout === "large" ? 6 : 4)}</span>
                )}
              </div>
              <div className="mt-auto flex items-center gap-2 pt-2">
                <Button
                  onClick={() => setActive(p)}
                  className="bg-glow font-mono text-code text-void hover:bg-glow/85"
                >
                  <FileText className="size-3.5" />
                  View case study
                </Button>
                <a
                  href={`/work/${p.id}/`}
                  aria-label={`${p.title} full case study page`}
                  className="icon-btn"
                >
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
                {isSet(p.links.github) && (
                  <a href={p.links.github} aria-label={`${p.title} source code on GitHub`} rel="noopener noreferrer" className="icon-btn">
                    <CodeXml className="size-4" aria-hidden="true" />
                  </a>
                )}
                {isSet(p.links.live) && (
                  <a href={p.links.live} aria-label={`${p.title} live demo`} rel="noopener noreferrer" className="icon-btn">
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      {active && <ProjectModal project={active} open={!!active} onOpenChange={(v) => !v && setActive(null)} />}
    </>
  );
}
