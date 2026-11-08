# Frontend DevEstudo

Aplicação em React, JavaScript e CSS. Para iniciar o frontend:

```sh
npm install
cp .env.example .env
npm run dev
```

`VITE_API_URL` define a URL base da API, incluindo o prefixo `/api`. Se omitida,
o cliente usa `http://localhost:3000/api`.

O cliente Axios envia automaticamente o JWT armazenado em `localStorage` como
Bearer token. Respostas `401` encerram a sessão local; mensagens de validação
(`400`) e permissão (`403`) são preservadas para exibição pela interface.

O Swagger da API está disponível em `http://localhost:3000/api-docs`.
