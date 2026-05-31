// web/src/features/content/types/index.ts

export type ContentStatus = "draft" | "published" | "archived";
export type ContentType = "changelog" | "legal" | "design-system" | "architecture" | "moderation" | "guide";

// --- CONFIGURAÇÕES VISUAIS ---
export interface CoverConfig {
  type: "none" | "image" | "gradient" | "solid" | "pattern";
  imageId?: string;
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  focalPoint?: { x: number; y: number };
}

export interface IconConfig {
  name: string; // Nome do ícone no Lucide
  color?: string; // Classe de cor do Tailwind
  background?: string; // Classe de background do Tailwind
}

// --- ESTRUTURA DE BLOCOS (EDITOR VISUAL) ---
export type BlockType = "paragraph" | "heading" | "image" | "callout" | "code" | "divider";

export interface ContentBlock {
  id: string; // UUID gerado no frontend para key do React
  type: BlockType;
  data: any; // O formato exato depende do type do bloco
}

// --- METADADOS ESPECÍFICOS POR CRIADOR ---

export interface ChangelogMeta {
  version: string;
  changeType: "feature" | "improvement" | "fix" | "security" | "breaking" | "deprecated";
  severity: "low" | "medium" | "high" | "critical";
  productArea: string;
}

export interface LegalMeta {
  legalType: "terms" | "privacy" | "cookies" | "community" | "security" | "contract";
  version: string;
  effectiveDate: string;
  requiresAcceptance: boolean;
  jurisdiction?: string;
}

export interface ArchitectureMeta {
  module: string;
  docType: "overview" | "database" | "api" | "auth" | "infra" | "security";
  technicalOwnerId?: string;
  riskLevel: "low" | "medium" | "high";
  dependencies: string[];
}

export interface DesignSystemMeta {
  componentName: string;
  designCategory: "foundation" | "component" | "pattern" | "motion" | "iconography";
  maturity: "draft" | "experimental" | "stable" | "deprecated";
  relatedTokens: string[];
}

// --- ENTIDADE PRINCIPAL ---
export interface ContentEntry<TMeta = any> {
  id: string;
  type: ContentType;
  slug: string;
  title: string;
  summary?: string | null;
  status: ContentStatus;
  author_id?: string | null;
  
  cover_config: CoverConfig;
  icon_config: IconConfig;
  
  blocks: ContentBlock[];
  metadata: TMeta; // Genérico, para podermos tipar dependendo do tipo do conteúdo
  
  seo_title?: string | null;
  seo_description?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}