// web/src/app/dashboard/docs/editor/page.tsx
import { ArticleForm } from "@/components/admin/docs/article-form";

export const dynamic = "force-dynamic";

export default function DocsEditorPage() {
  // Num cenário real, você buscaria os dados do banco aqui caso houvesse um ?id= na URL
  // para permitir a edição de documentos existentes.
  
  return (
    <div className="mx-auto max-w-7xl">
      <ArticleForm />
    </div>
  );
}
