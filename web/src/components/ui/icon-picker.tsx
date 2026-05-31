// web/src/components/ui/icon-picker.tsx
"use client";

import * as React from "react";
import { Search, ChevronDown } from "lucide-react";
import * as LucideIcons from "lucide-react";

// Uma seleção curada de ícones úteis para documentação
const COMMON_ICONS = [
  "Book", "BookOpen", "Terminal", "TerminalSquare", "Code", "Braces", 
  "Database", "Server", "Globe", "Shield", "ShieldCheck", "Lock", "Unlock", 
  "Key", "Zap", "Sparkles", "Star", "Flame", "Droplet", "Leaf", "Sprout", 
  "Settings", "Cog", "Wrench", "Hammer", "Users", "User", "Building2", 
  "Briefcase", "Scale", "FileText", "Files", "Folder", "FolderOpen", 
  "MessageSquare", "MessageCircle", "Bell", "Inbox", "Send", "CreditCard", 
  "Wallet", "Banknote", "Coins", "LineChart", "PieChart", "BarChart", 
  "Activity", "AlertCircle", "AlertTriangle", "Info", "HelpCircle"
];

type IconPickerProps = {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
};

export function IconPicker({ value, onChange, label }: IconPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredIcons = React.useMemo(() => {
    if (!search) return COMMON_ICONS;
    return COMMON_ICONS.filter(name => name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  // @ts-ignore
  const SelectedIcon = value && LucideIcons[value] ? LucideIcons[value] : LucideIcons.FileText;

  return (
    <div className="relative flex flex-col gap-2">
      {label && <label className="text-xs font-medium text-[#444444] dark:text-[#C0C0C0]">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-[#E0DDD6] bg-white px-3 py-2 text-sm text-[#111111] transition hover:border-[#006D4E]/50 dark:border-[#2A2A2A] dark:bg-[#1C1C1C] dark:text-[#FAF7F2]"
      >
        <div className="flex items-center gap-2">
          <SelectedIcon className="size-4 text-[#006D4E]" />
          <span>{value || "Selecione um ícone"}</span>
        </div>
        <ChevronDown className="size-4 text-[#8A8A8A]" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[calc(100%+4px)] z-50 flex w-full max-w-[280px] flex-col overflow-hidden rounded-2xl border border-[#E0DDD6] bg-white shadow-xl dark:border-[#2A2A2A] dark:bg-[#1C1C1C]">
            <div className="border-b border-[#E0DDD6] p-2 dark:border-[#2A2A2A]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#8A8A8A]" />
                <input
                  type="text"
                  placeholder="Buscar ícone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg bg-[#FAF7F2] py-1.5 pl-8 pr-3 text-xs outline-none focus:ring-2 focus:ring-[#006D4E]/20 dark:bg-[#111111] dark:text-white"
                />
              </div>
            </div>
            
            <div className="grid max-h-48 grid-cols-5 gap-2 overflow-y-auto p-2">
              {filteredIcons.map((iconName) => {
                // @ts-ignore
                const IconCmp = LucideIcons[iconName];
                if (!IconCmp) return null;
                
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      onChange(iconName);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    title={iconName}
                    className="grid aspect-square place-items-center rounded-xl border border-transparent text-[#666666] transition hover:border-[#006D4E]/20 hover:bg-[#006D4E]/5 hover:text-[#006D4E] dark:text-[#A0A0A0]"
                  >
                    <IconCmp className="size-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
