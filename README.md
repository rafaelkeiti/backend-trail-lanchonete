# Backend Trail Lanchonete

O trabalho é uma API para uma rede de lanchonetes, desenvolvida como MVP da trilha Back-end. A aplicação abrange autenticação, autorização por perfis, unidades, produtos, estoque por unidade, pedidos, pagamento simulado, fidelidade, auditoria, Swagger e coleção Postman.

## Tecnologias utilizadas

- Node.js
- TypeScript
- NestJS
- Prisma ORM
- SQLite
- JWT
- bcrypt
- Swagger/OpenAPI
- Postman

## Requisitos do projeto

- Git
- Node.js 22 ou superior
- npm, instalado junto com o Node.js
- TypeScript 5
- NestJS 10
- Prisma 6
- SQLite

TypeScript, NestJS e Prisma são dependências do projeto e já vão instaladas pelo `npm install`. O SQLite utilizado pela aplicação é um arquivo local, por isso não vai exigir a instalação de um servidor de banco de dados.

## Preparação do ambiente

Na execução do projeto num computador que ainda não tem as ferramentas necessárias:

No Windows 10 ou 11, o Git, o Node.js LTS e o npm podem ser instalados diretamente pelo PowerShell ou Prompt de Comando:

```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
```

O segundo comando instala o Node.js LTS e o npm. Não é necessário usar Docker ou Chocolatey que a página de download do node oferece de opção. Depois de finalizar, feche e abra seu terminal ou editor de código.

Também podemos usar os instaladores dos sites oficiais:

1. Instalar o [Git](https://git-scm.com/downloads).
2. Instalar uma versão LTS do [Node.js](https://nodejs.org/en/download) igual ou maior que 22. O instalador do Node.js também instala o npm, então não precisa se preocupar.
3. Fechar e abrir o terminal para que possa atualizar as variáveis de ambiente.
4. Verificar as instalações:

```bash
git --version
node --version
npm --version
```

Os três comandos devem mostrar suas versões. Novamente, se não der certo, feche e abra seu editor de código e tente os comandos novamente.

### Erro de execução de scripts no PowerShell

Em alguns computadores, o PowerShell  vai informar que a execução de scripts é desabilitada quando tentar usar o `npm`. Isso acontece porque o PowerShell tenta executar o arquivo `npm.ps1` e não significa que o npm foi instalado de maneira errada

A solução mais simples, que não altera nenhuma configuração de segurança do Windows, é substituir `npm` por `npm.cmd`:

```powershell
npm.cmd --version
npm.cmd install
npm.cmd run db:setup
npm.cmd run start:dev
```

Também é possível abrir o Prompt de Comando ou o Git Bash e utilizar normalmente os comandos com `npm`.

Caso o usuário queira permitir scripts locais no PowerShell, pode alterar a política só para seu usuário:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## Instalação do projeto

```bash
git clone https://github.com/rafaelkeiti/backend-trail-lanchonete.git
cd backend-trail-lanchonete
npm install
```

## Variáveis de ambiente

É necessário criar um arquivo `.env` na raiz do projeto usando o `.env.example` como base. Você pode criar ele manualmente ou por comando. Esse arquivo vai ser necessário para executar os comandos do Prisma e iniciar a aplicação:

No PowerShell:

```powershell
Copy-Item .env.example .env
```

No Prompt de Comando do Windows:

```bat
copy .env.example .env
```

No Linux, macOS ou no Git Bash:

```bash
cp .env.example .env
```

O arquivo criado vai ter essas configurações:

```env
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET="troca-o-segredo-no-ambiente-real"
JWT_EXPIRES_IN="1h"
```

## Banco de dados e seed

Para preparar o banco SQLite local na primeira execução, com o banco ainda inexistente:

```bash
npm run db:setup
```

Esse comando vai:

1. gerar Prisma Client;
2. aplicar o SQL inicial que está no caminho `prisma/migrations/20250625124000_init/migration.sql`;
3. executar a seed.

Se o banco já existir e for só refazer os dados iniciais:

```bash
npm run prisma:seed
```

Esse comando remove os dados locais existentes e recria os dados iniciais.

Usuários criados pela seed:

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Admin | `admin@lanchonete.com` | `Senha@123` |
| Gerente | `gerente@lanchonete.com` | `Senha@123` |
| Cozinha | `cozinha@lanchonete.com` | `Senha@123` |
| Cliente | `cliente@exemplo.com` | `Senha@123` |

## Executar a API

Modo de desenvolvimento:

```bash
npm run start:dev
```

Build:

```bash
npm run build
```

Prod local após build:

```bash
npm run start:prod
```

## URLs

- Prefixo das rotas: `http://localhost:3000/api`
- Health check: `http://localhost:3000/api/health`
- Swagger: `http://localhost:3000/docs`

O endpoint de health check não era um requisito obrigatório, mas foi incluído para simular a criação real de um projeto que pode até ser incluído em portfólio posteriormente, focando em facilitar a validação local e permitir confirmar rapidamente se a API está rodando antes de testar os demais endpoints.

## Swagger e Schemas

O Swagger mostra uma seção chamada `Schemas` no final da página, que é gerada automaticamente a partir dos DTOs da aplicação.

### O que são esses DTOs?

DTOs são classes usadas para descrever o formato dos dados que a API vai receber e devolver. Aqui são usados para deixar claros os requests, responses, exemplos, códigos de status e padrões de erro. Eles ajudam o Swagger a documentar esses contratos de forma organizada.

Exemplos:

- `LoginDto`: são os dados esperados no login.
- `CreatePedidoDto`: são dados esperados para criar um pedido.
- `PedidoResponseDto`: é o formato da resposta de um pedido.
- `ErrorResponseDto`: é o formato padronizado dos erros.

## Endpoints principais

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Usuários

- `GET /api/usuarios`
- `GET /api/usuarios/:id`

### Unidades

- `POST /api/unidades`
- `GET /api/unidades`
- `GET /api/unidades/:id`

### Produtos

- `POST /api/produtos`
- `GET /api/produtos?page=1&limit=10`
- `GET /api/produtos/:id`
- `PATCH /api/produtos/:id`

### Estoque

- `GET /api/estoque?unidadeId=...`
- `POST /api/estoque/movimentacoes`

### Pedidos

- `POST /api/pedidos`
- `GET /api/pedidos?canalPedido=APP&status=AGUARDANDO_PAGAMENTO`
- `GET /api/pedidos/:id`
- `PATCH /api/pedidos/:id/status`
- `DELETE /api/pedidos/:id`

### Pagamentos

- `POST /api/pagamentos/mock`
- `GET /api/pagamentos/:id`

### Fidelidade

- `GET /api/fidelidade/saldo`
- `POST /api/fidelidade/resgatar`

### Auditoria

- `GET /api/auditoria?limit=50`

## Fluxo principal implementado

1. Usuário faz login e recebe um JWT.
2. Cliente consulta unidades e produtos.
3. Cliente cria um pedido informando `canalPedido`, unidade e itens.
4. API valida unidade, produtos e estoque disponível.
5. API cria o pedido com status `AGUARDANDO_PAGAMENTO`.
6. API baixa o estoque e registra a auditoria.
7. Cliente solicita pagamento mock.
8. API registra o pagamento aprovado ou negado.
9. Pedido muda para `PAGO` ou `PAGAMENTO_NEGADO`.
10. Se aprovado e com consentimento, pontos de fidelidade são gerados.

## Valores em centavos. Por que assim?

Após algumas pesquisas, foi decidido que os valores serão salvos em centavos, de forma genérica e de fácil compreensão: `precoCentavos`, `totalCentavos` e `subtotalCentavos`.

Essa decisão foi para evitar problemas de arredondamento com números decimais. Por exemplo:

- R$ 19,90 é salvo como `1990`;
- R$ 6,90 é salvo como `690`;
- R$ 32,80 é salvo como `3280`.

Embora pudessem ser utilizadas bibliotecas próprias para valores monetários, neste MVP os valores inteiros foram escolhidos para deixar os cálculos simples e consistentes:

```ts
subtotalCentavos = precoCentavos * quantidade;
```

## Canais disponíveis dos pedidos

O pedido possui o campo obrigatório `canalPedido`, com os seguintes valores:

- `APP`
- `TOTEM`
- `BALCAO`
- `PICKUP`
- `WEB`

Também é possível filtrar pedidos pelo canal onde foram feitos:

```http
GET /api/pedidos?canalPedido=TOTEM
```

## Padrão de erros

Todos os erros seguem o formato padrão:

```json
{
  "error": "CONFLITO_REGRA_NEGOCIO",
  "message": "Estoque insuficiente para um ou mais itens.",
  "details": [],
  "timestamp": "2026-06-25T12:00:00.000Z",
  "path": "/api/pedidos",
  "requestId": "uuid"
}
```

## Segurança e LGPD

- Senhas são armazenadas com hash `bcrypt`.
- A API usa autenticação JWT (JSON Web Token).
- Rotas administrativas usam autorização por perfis.
- O campo `senhaHash` não é retornado nas respostas.
- Consentimento de fidelidade é registrado no usuário.
- Ações sensíveis geram registros em auditoria.

## Testes e Postman

- [Plano de testes da API](docs/testes-api.md)
- [Coleção Postman](docs/postman/trail-lanchonete.postman_collection.json)

Como executar:

1. Rodar `npm run db:setup`.
2. Rodar `npm run start:dev`.
3. Importar a coleção no Postman.
4. Executar as requisições na ordem da coleção.

A coleção já possui a variável `baseUrl` configurada como `http://localhost:3000/api`. As requisições T01, T02, T21 e T26 realizam os logins e armazenam automaticamente os tokens do cliente, do administrador, do gerente e da cozinha. Por isso, a coleção precisa executada na ordem apresentada, preferencialmente pelo Collection Runner, que vai rodar todos os testes de uma vez e apresentar todas as respostas.

Antes de repetir a coleção completa, execute `npm run prisma:seed` para restaurar os dados e o estoque inicial. Esse comando apaga os dados locais anteriores.

A coleção possui 30 requisições organizadas em ordem e vai cobrir login, acesso sem token, permissões de cliente, administrador, gerente e cozinha, unidades, produtos, estoque, usuários, pedidos, pagamento mock aprovado e negado, fidelidade, auditoria, fluxo de preparo, quantidade inválida, produto inexistente e erros de validação e regra de negócio.

## Validação local

Comandos usados para revisar o projeto:

```bash
npm run build
npm run lint
```

Também foi validado manualmente:

- Swagger em `/docs`;
- health check em `/api/health`;
- login com usuários do seed;
- criação de pedido com `canalPedido`;
- pagamento mock aprovado e negado;
- consulta de auditoria;
- os 30 cenários da coleção Postman.

## Links da entrega

- Repositório: https://github.com/rafaelkeiti/backend-trail-lanchonete
- Swagger local: http://localhost:3000/docs
- [Coleção Postman](docs/postman/trail-lanchonete.postman_collection.json)
- [Plano de testes da API](docs/testes-api.md)
