/*
  Migration: ajustar_categorias_forum

  Objetivo:
  - Alterar o relacionamento entre Thread e Category de
    um-para-muitos para muitos-para-muitos.
  - Permitir que uma Thread possua várias categorias/tags.
  - Criar a tabela intermediária "ThreadCategory".

  Contexto:
  - Antes desta migration, cada Thread possuía apenas um "categoryId".
  - Os requisitos do fórum permitem de 1 a 3 categorias/tags por Thread.
  - A entidade Category será mantida e utilizada como tag do fórum.

  Preservação de dados:
  - Os relacionamentos existentes em "Thread"."categoryId"
    são copiados para "ThreadCategory" antes da remoção da coluna antiga.
  - A migration é cancelada caso algum relacionamento não seja preservado.

  Observação:
  - O limite de 1 a 3 categorias por Thread será validado
    pela camada Service da aplicação.

  Garantias:
  - A mesma Category não pode ser associada duas vezes à mesma Thread.
  - A exclusão de uma Thread remove automaticamente seus relacionamentos.
  - Uma Category vinculada não pode ser excluída diretamente.
  - As chaves estrangeiras impedem relacionamentos órfãos.
  - As alterações são executadas dentro de uma transação.
*/

BEGIN;

-- Cria a tabela intermediária do relacionamento muitos-para-muitos.
CREATE TABLE "ThreadCategory" (
    "threadId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "ThreadCategory_pkey"
    PRIMARY KEY ("threadId", "categoryId")
);

-- Relaciona ThreadCategory com Thread.
ALTER TABLE "ThreadCategory"
ADD CONSTRAINT "ThreadCategory_threadId_fkey"
FOREIGN KEY ("threadId")
REFERENCES "Thread"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Relaciona ThreadCategory com Category.
ALTER TABLE "ThreadCategory"
ADD CONSTRAINT "ThreadCategory_categoryId_fkey"
FOREIGN KEY ("categoryId")
REFERENCES "Category"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Preserva os relacionamentos existentes.
INSERT INTO "ThreadCategory" ("threadId", "categoryId")
SELECT
    "id",
    "categoryId"
FROM "Thread"
WHERE "categoryId" IS NOT NULL;

-- Confirma que nenhum relacionamento antigo deixou de ser copiado.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "Thread" t
        WHERE t."categoryId" IS NOT NULL
          AND NOT EXISTS (
              SELECT 1
              FROM "ThreadCategory" tc
              WHERE tc."threadId" = t."id"
                AND tc."categoryId" = t."categoryId"
          )
    ) THEN
        RAISE EXCEPTION
            'Migration cancelada: existem categorias de threads que não foram preservadas.';
    END IF;
END;
$$;

-- Remove a relação antiga somente após preservar os dados.
ALTER TABLE "Thread"
DROP CONSTRAINT "Thread_categoryId_fkey";

-- Remove a coluna antiga.
ALTER TABLE "Thread"
DROP COLUMN "categoryId";

COMMIT;
