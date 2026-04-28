# Backend

API em Express com Prisma conectando no Supabase.

## Configuração

1. Crie um projeto no Supabase.
2. Copie a connection string direta do banco e preencha o arquivo `.env` com as variáveis abaixo.
3. Instale as dependências.
4. Gere o client do Prisma.
5. Execute as migrações.

## Variáveis de ambiente

```bash
DATABASE_URL="postgresql://postgres:<senha>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require"
PORT=3000
```

## Comandos

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Observações

- `DATABASE_URL` é a URL usada pelo Prisma em runtime.
- Se você trocar o schema, rode `npx prisma generate` novamente.
