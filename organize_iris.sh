#!/bin/bash

echo "--- Iniciando a refatoração do IRÍS Content Studio ---"

# 1. Mover os criadores para a nova pasta de features (se existirem)
mkdir -p web/src/features/content/creators/
mkdir -p web/src/features/content/core/components/

# 2. Remover páginas de edição legadas que foram substituídas pelo Drawer/Studio
echo "Removendo editores de página legados..."
rm -rf web/src/app/\(admin\)/dashboard/docs/editor/
rm -f web/src/components/admin/docs/article-form.tsx

# 3. Garantir que as rotas (admin) estejam limpas
# (Certifique-se de que não há arquivos duplicados)
echo "Organizando rotas do Admin..."
rm -f web/src/app/admin/page.tsx # Remove se for um resíduo antigo

# 4. Remover arquivos de testes/mocks se ainda existirem
find web/src -name "*mock*" -type f -delete
find web/src -name "*temp*" -type f -delete

# 5. Otimizar a estrutura (limpeza de pastas vazias)
find web/src -type d -empty -delete

echo "--- Estrutura organizada com sucesso! ---"
echo "Lembre-se de verificar se o import no 'article-form.tsx' (caso ainda use) foi atualizado."