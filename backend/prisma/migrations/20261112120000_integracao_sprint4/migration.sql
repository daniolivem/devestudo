-- Sprint 4 (Integração) - campos necessários para as telas de grupos e mentoria
-- O campo availability permite exibir/filtrar a disponibilidade real do grupo.
ALTER TABLE "Group"
ADD COLUMN "availability" VARCHAR(100);

-- A mensagem enviada pelo aluno na solicitação de mentoria passa a ser persistida.
ALTER TABLE "Mentorship"
ADD COLUMN "message" VARCHAR(500);
