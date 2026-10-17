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

### Configuração do ambiente

1. Copie o conteúdo do arquivo `.env.example` para o arquivo .env altera a senha da url:

```bash
cp .env.example .env
```

## Comandos

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Swagger

Com o backend em execucao, acesse a documentacao interativa em:

```text
http://localhost:3000/api-docs
```

Para documentar uma nova rota, adicione um bloco `@swagger` acima da definicao da rota. Rotas protegidas podem usar `security: [{ bearerAuth: [] }]` para habilitar o botao `Authorize` da interface.

### Testando rotas protegidas

1. Execute `POST /api/auth/login` e copie o valor de `token` da resposta.
2. Clique em `Authorize` no Swagger.
3. Informe somente `<token>` e confirme em `Authorize`. O Swagger adiciona `Bearer` automaticamente.
4. O token fica persistido no Swagger e sera enviado nas demais rotas protegidas.

## Observações

- `DATABASE_URL` é a URL usada pelo Prisma em runtime.
- Se você trocar o schema, rode `npx prisma generate` novamente.
