export interface ProjectLink {
  github: string;
  live: string;
}

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface ProjectCaseStudy {
  situation: string;
  task: string;
  action: string[];
  results: string[];
}

export interface Project {
  id: string;
  featured: boolean;
  tag: string;
  title: string;
  oneLiner: string;
  body: string;
  role: string;
  stack: string[];
  links: ProjectLink;
  cover: string;
  gallery: string[];
  metrics: ProjectMetric[];
  caseStudy: ProjectCaseStudy;
}
