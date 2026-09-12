/*
  Migration: corrigir_avaliacao_mentoria

  Objetivo:
  - Ajustar a regra de avaliação das mentorias para aceitar notas de 1 a 5.
  - Alterar o campo "comment" da tabela "Mentorship"
    de TEXT para VARCHAR(255).

  Contexto:
  - A migration anterior permitia avaliações entre 1 e 10.
  - A documentação do projeto define avaliação entre 1 e 5 estrelas.
  - O limite de 255 caracteres para "comment" é uma decisão do projeto,
    diferente do limite original de 50 caracteres da documentação.

  Garantias:
  - A migration é cancelada se existir comentário com mais de 255 caracteres.
  - A migration é cancelada se existir avaliação fora do intervalo de 1 a 5.
  - Nenhum dado incompatível é alterado automaticamente.
  - As alterações são executadas dentro de uma transação.
*/

BEGIN;

-- Impede a migration caso exista comentário maior que 255 caracteres.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "Mentorship"
        WHERE "comment" IS NOT NULL
          AND char_length("comment") > 255
    ) THEN
        RAISE EXCEPTION
            'Migration cancelada: existem comentários com mais de 255 caracteres.';
    END IF;
END;
$$;

-- Impede a migration caso exista avaliação fora da nova regra de 1 a 5.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "Mentorship"
        WHERE "rating" IS NOT NULL
          AND ("rating" < 1 OR "rating" > 5)
    ) THEN
        RAISE EXCEPTION
            'Migration cancelada: existem avaliações fora do intervalo de 1 a 5.';
    END IF;
END;
$$;

-- Altera o comentário de TEXT para VARCHAR(255).
ALTER TABLE "Mentorship"
ALTER COLUMN "comment" TYPE VARCHAR(255);

-- Remove a regra antiga de 1 a 10.
ALTER TABLE "Mentorship"
DROP CONSTRAINT IF EXISTS "Mentorship_rating_check";

-- Cria a nova regra de avaliação de 1 a 5.
ALTER TABLE "Mentorship"
ADD CONSTRAINT "Mentorship_rating_check"
CHECK (
    "rating" IS NULL
    OR "rating" BETWEEN 1 AND 5
);

COMMIT;
