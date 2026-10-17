/*

  Origem esperada:
  - Banco criado pela migration inicial do projeto.

  Garantias:
  - Preserva PENDING e APPROVED dos membros.
  - Separa o status do grupo do status do membro.
  - Cria a categoria "Geral" somente quando já existem threads.
  - Interrompe toda a migration se houver título maior que 100 caracteres.
  - Permite várias mentorias entre o mesmo aluno e mentor.
  - Em qualquer erro, todas as alterações são revertidas.
*/

BEGIN;

-- 1. Cria um enum exclusivo para solicitações e participações nos grupos.
CREATE TYPE "MemberStatus" AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED'
);

-- 2. Converte o status existente dos membros sem apagar os valores atuais.
ALTER TABLE "GroupMember"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "GroupMember"
ALTER COLUMN "status" TYPE "MemberStatus"
USING ("status"::text::"MemberStatus");

ALTER TABLE "GroupMember"
ALTER COLUMN "status" SET DEFAULT 'PENDING'::"MemberStatus";

-- 3. O enum antigo deixa de representar membros e passa a representar grupos.
ALTER TYPE "GroupStatus" RENAME TO "GroupStatus_legacy";

CREATE TYPE "GroupStatus" AS ENUM (
  'ACTIVE',
  'CLOSED'
);

-- 4. Adiciona os novos campos dos grupos.
ALTER TABLE "Group"
ADD COLUMN "level" VARCHAR(20),
ADD COLUMN "materialsUrl" VARCHAR(255),
ADD COLUMN "status" "GroupStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "technology" VARCHAR(50);

-- O enum antigo não possui mais dependências depois da conversão dos membros.
DROP TYPE "GroupStatus_legacy";

-- 5. Permite mais de uma mentoria entre o mesmo mentor e estudante.
DROP INDEX "Mentorship_mentorId_studentId_key";

ALTER TABLE "Mentorship"
ADD COLUMN "accessUrl" VARCHAR(255);

-- ADICIONADO: permite somente avaliações entre 1 e 10.
ALTER TABLE "Mentorship"
ADD CONSTRAINT "Mentorship_rating_check"
CHECK ("rating" IS NULL OR "rating" BETWEEN 1 AND 10);

-- 6. Adiciona os novos campos de usuário.
-- Os campos específicos de aluno ou mentor permanecem opcionais no banco.
-- A obrigatoriedade conforme o perfil deve ser validada na camada de serviço.
ALTER TABLE "User"
ADD COLUMN "availability" VARCHAR(100),
ADD COLUMN "calendlyUrl" VARCHAR(255),
ADD COLUMN "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "isBlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "knowledgeLevel" VARCHAR(20),
ADD COLUMN "mentorTechnologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "photo" VARCHAR(255),
ADD COLUMN "socialNetwork" VARCHAR(255);

-- 7. Cria as categorias do fórum.
CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "name" VARCHAR(100) NOT NULL,

  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Category_name_key"
ON "Category"("name");

-- categoryId começa opcional para permitir a migração de threads existentes.
ALTER TABLE "Thread"
ADD COLUMN "categoryId" TEXT,
ADD COLUMN "resolved" BOOLEAN NOT NULL DEFAULT false;

-- 8. Protege títulos: a migration falha antes de qualquer truncamento.
DO $$
DECLARE
  quantidade_titulos_invalidos BIGINT;
  maior_titulo INTEGER;
BEGIN
  SELECT COUNT(*), MAX(char_length("title"))
  INTO quantidade_titulos_invalidos, maior_titulo
  FROM "Thread"
  WHERE char_length("title") > 100;

  IF quantidade_titulos_invalidos > 0 THEN
    RAISE EXCEPTION
      'Migration cancelada: existem % thread(s) com título acima de 100 caracteres. Maior título: % caracteres.',
      quantidade_titulos_invalidos,
      maior_titulo;
  END IF;
END;
$$;

ALTER TABLE "Thread"
ALTER COLUMN "title" TYPE VARCHAR(100);

-- 9. Cria "Geral" somente se já houver threads e associa as existentes.
INSERT INTO "Category" ("id", "name")
SELECT '00000000-0000-4000-8000-000000000001', 'Geral'
WHERE EXISTS (SELECT 1 FROM "Thread");

UPDATE "Thread"
SET "categoryId" = '00000000-0000-4000-8000-000000000001'
WHERE "categoryId" IS NULL;

ALTER TABLE "Thread"
ALTER COLUMN "categoryId" SET NOT NULL;

ALTER TABLE "Thread"
ADD CONSTRAINT "Thread_categoryId_fkey"
FOREIGN KEY ("categoryId")
REFERENCES "Category"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

COMMIT;