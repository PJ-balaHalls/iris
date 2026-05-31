"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, GripVertical, Type, Heading, Minus, Trash2 } from "lucide-react";
import type { ContentBlock, BlockType } from "../../types";

interface ContentBlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export function ContentBlockEditor({ blocks, onChange }: ContentBlockEditorProps) {
  
  const addBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: crypto.randomUUID(),
      type,
      data: type === "heading" ? { text: "", level: 2 } : { text: "" }
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, newData: any) => {
    onChange(blocks.map(b => b.id === id ? { ...b, data: { ...b.data, ...newData } } : b));
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div key={block.id} className="group flex items-start gap-3 relative">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1 pt-2 cursor-grab text-foreground-muted">
              <GripVertical className="size-4" />
            </div>
            
            <div className="flex-1 bg-surface border border-border rounded-xl overflow-hidden transition-all focus-within:ring-1 focus-within:ring-accent focus-within:border-accent">
              {block.type === "paragraph" && (
                <Textarea 
                  value={block.data.text} 
                  onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                  placeholder="Comece a escrever..."
                  className="border-0 focus-visible:ring-0 resize-y min-h-[100px] text-foreground-secondary leading-relaxed p-4"
                />
              )}
              {block.type === "heading" && (
                <Input 
                  value={block.data.text} 
                  onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                  placeholder="Título principal"
                  className="border-0 focus-visible:ring-0 text-xl font-bold p-4 h-auto"
                />
              )}
              {block.type === "divider" && (
                <div className="h-12 flex items-center justify-center">
                  <div className="w-full max-w-[200px] h-px bg-border" />
                </div>
              )}
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => removeBlock(block.id)}
              className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-opacity shrink-0 mt-2"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 p-2 border border-dashed border-border rounded-xl bg-surface/30">
        <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider ml-2 mr-4">Adicionar Bloco:</span>
        <Button type="button" variant="outline" size="sm" onClick={() => addBlock("paragraph")} className="h-8 gap-1.5 border-border text-foreground-secondary">
          <Type className="size-3.5" /> Texto
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => addBlock("heading")} className="h-8 gap-1.5 border-border text-foreground-secondary">
          <Heading className="size-3.5" /> Título
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => addBlock("divider")} className="h-8 gap-1.5 border-border text-foreground-secondary">
          <Minus className="size-3.5" /> Divisor
        </Button>
      </div>
    </div>
  );
}