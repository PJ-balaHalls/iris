import * as Icons from "lucide-react";
import { createElement } from "react";

export const LUCIDE_ICONS_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles: Icons.Sparkles,
  ShieldCheck: Icons.ShieldCheck,
  LockKeyhole: Icons.LockKeyhole,
  BookOpen: Icons.BookOpen,
  Code: Icons.Code,
  Scale: Icons.Scale,
  MessageCircle: Icons.MessageCircle,
  Users: Icons.Users,
  Cpu: Icons.Cpu,
  Database: Icons.Database,
  Layers: Icons.Layers,
  GitBranch: Icons.GitBranch,
  Terminal: Icons.Terminal,
  Server: Icons.Server,
  FileCode: Icons.FileCode,
  Workflow: Icons.Workflow,
  Key: Icons.Key,
  Eye: Icons.Eye,
  Activity: Icons.Activity,
  Box: Icons.Box,
  Command: Icons.Command,
  Compass: Icons.Compass,
  FileText: Icons.FileText,
  Folder: Icons.Folder,
  Globe: Icons.Globe,
  HardDrive: Icons.HardDrive,
  HelpCircle: Icons.HelpCircle,
  History: Icons.History,
  Info: Icons.Info,
  Layout: Icons.Layout,
  Link: Icons.Link,
  List: Icons.List,
  Map: Icons.Map,
  Network: Icons.Network,
  Settings: Icons.Settings,
  Share2: Icons.Share2,
  Sliders: Icons.Sliders,
  Tag: Icons.Tag,
  Zap: Icons.Zap,
  Bookmark: Icons.Bookmark,
};

export function renderDynamicIcon(iconName: string | null | undefined, className?: string) {
  if (!iconName) return null;
  
  const IconComponent = LUCIDE_ICONS_MAP[iconName];
  if (!IconComponent) return null;
  
  // Agora usando o createElement do React
  return createElement(IconComponent, { className });
}