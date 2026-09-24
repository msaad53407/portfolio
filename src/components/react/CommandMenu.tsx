import { useCallback, useEffect, useState } from "react";
import {
  Award,
  Briefcase,
  Clock,
  Copy,
  CornerDownLeft,
  ExternalLink,
  FileText,
  FolderGit,
  Layers,
  Mail,
  Search,
  User,
} from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import site from "@/data/site.json";
import projectsData from "@/data/projects.json";
import contact from "@/data/contact.json";
import type { Project } from "./types";

const projects = projectsData as Project[];

interface Entry {
  id: string;
  label: string;
  hint?: string;
  keywords: string;
  icon: React.ReactNode;
  run: () => void;
}

function scrollTo(selector: string) {
  if (selector === "#top") {
    if (document.querySelector(selector)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.href = `/${selector}`;
    }
    return;
  }
  const el = document.querySelector(selector);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    // section lives on the homepage (e.g. palette used from /work/*)
    window.location.href = `/${selector}`;
  }
}

function openProject(id: string) {
  window.dispatchEvent(new CustomEvent<string>("portfolio:open-project", { detail: id }));
  // no grid on this page (e.g. /work/*) — fall through to the dedicated page
  window.setTimeout(() => {
    if (!document.querySelector('[data-slot="dialog-content"]')) {
      window.location.href = `/work/${id}/`;
    }
  }, 200);
}

export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const run = useCallback((fn: () => void) => {
    setOpen(false);
    setQuery("");
    requestAnimationFrame(() => requestAnimationFrame(fn));
  }, []);

  const sections: Entry[] = [
    { id: "about", label: "About", keywords: "about whoami bio", icon: <User className="size-4 text-dim" />, run: () => run(() => scrollTo("#about")) },
    { id: "work", label: "Selected Work", keywords: "work projects featured case study", icon: <Briefcase className="size-4 text-dim" />, run: () => run(() => scrollTo("#work")) },
    { id: "more-work", label: "More Work", keywords: "more work side projects", icon: <FolderGit className="size-4 text-dim" />, run: () => run(() => scrollTo("#more-work")) },
    { id: "stack", label: "Skills & Stack", keywords: "skills stack technologies", icon: <Layers className="size-4 text-dim" />, run: () => run(() => scrollTo("#stack")) },
    { id: "experience", label: "Experience", keywords: "experience work history timeline jobs", icon: <Clock className="size-4 text-dim" />, run: () => run(() => scrollTo("#experience")) },
    { id: "certs", label: "Certifications", keywords: "certifications badges anthropic", icon: <Award className="size-4 text-dim" />, run: () => run(() => scrollTo("#certs")) },
    { id: "contact", label: "Contact", keywords: "contact hire email socials", icon: <Mail className="size-4 text-dim" />, run: () => run(() => scrollTo("#contact")) },
  ];

  const projectEntries: Entry[] = projects.map((p) => ({
    id: `project-${p.id}`,
    label: p.title,
    hint: p.tag,
    keywords: `${p.title} ${p.tag} ${p.stack.join(" ")}`,
    icon: <FileText className="size-4 text-dim" />,
    run: () => run(() => openProject(p.id)),
  }));

  const actions: Entry[] = [
    {
      id: "copy-email",
      label: "Copy email address",
      hint: contact.email,
      keywords: "copy email address clipboard",
      icon: <Copy className="size-4 text-dim" />,
      run: () => run(() => void navigator.clipboard?.writeText(contact.email)),
    },
    ...contact.links.map((l) => ({
      id: `open-${l.label}`,
      label: `Open ${l.label}`,
      hint: l.href,
      keywords: `${l.label} profile link social`,
      icon: <ExternalLink className="size-4 text-dim" />,
      run: () => run(() => window.open(l.href, "_blank", "noopener")),
    })),
  ];

  const groups: { heading: string; entries: Entry[] }[] = [
    { heading: "Sections", entries: sections },
    { heading: "Projects", entries: projectEntries },
    { heading: "Actions", entries: actions },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-outline hidden items-center gap-2 px-3 py-1.5 text-code md:inline-flex"
      >
        <Search className="size-3.5" />
        <span className="text-fog">Search</span>
        <kbd className="rounded-terminal border border-edge bg-raise px-1 font-mono text-tiny text-fog">⌘K</kbd>
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search (Ctrl+K)"
        className="icon-btn md:hidden"
      >
        <Search className="size-4" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen} title={`Search ${site.name}'s portfolio`} className="border-edge bg-panel">
        <Command label="Site search" value={query} onValueChange={setQuery} className="bg-transparent">
          <CommandInput placeholder="$ search sections, projects, actions…" className="font-mono" />
          <CommandList className="p-2">
            <CommandEmpty className="font-mono text-micro text-dim">no results for "{query}"</CommandEmpty>
            {groups.map((g) => (
              <CommandGroup key={g.heading} heading={g.heading} className="font-mono [&_[cmdk-group-heading]]:text-micro [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-dim">
                {g.entries.map((e) => (
                  <CommandItem key={e.id} value={e.keywords} keywords={[e.label]} onSelect={e.run} className="font-mono text-code text-fog data-selected:bg-raise data-selected:text-mist">
                    {e.icon}
                    <span>{e.label}</span>
                    {e.hint && <span className="ml-auto truncate pl-4 text-tiny text-dim">{e.hint}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
          <div className="flex items-center gap-4 border-t border-edge px-3 py-2 font-mono text-tiny text-dim">
            <span className="inline-flex items-center gap-1"><CornerDownLeft className="size-3" /> select</span>
            <span>↑↓ navigate</span>
            <span className="ml-auto">esc close</span>
          </div>
        </Command>
      </CommandDialog>
    </>
  );
}
