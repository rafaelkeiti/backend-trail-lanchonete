# Plano de Testes da API

## Como executar

1. Instalar as dependências: `npm install`.
2. Na primeira execução, preparar o banco: `npm run db:setup`.
3. Iniciar a API: `npm run start:dev`.
4. Importar a coleção `docs/postman/trail-lanchonete.postman_collection.json` no Postman.
5. Executar as requisições na ordem apresentada, preferencialmente pelo Collection Runner.

Base URL padrão:

```text
http://localhost:3000/api
```

## Cenários

| ID | Cenário em questão | Endpoint usado | Condição necessária | Entrada | Esperado | Evidência |
| --- | --- | --- | --- | --- | --- | --- |
| T01 | Cliente realiza login válido | `POST /auth/login` | Seed aplicado | e-mail/senha do cliente | `200` + `accessToken` | Auth/T01 - Cliente realiza login válido |
| T02 | Administrador realiza login válido | `POST /auth/login` | Seed aplicado | e-mail/senha do administrador | `200` + `accessToken` | Auth/T02 - Administrador realiza login válido |
| T03 | Usuário tenta login com senha inválida | `POST /auth/login` | Seed aplicado | senha errada | `401` + erro padrão | Auth/T03 - Usuário tenta login com senha inválida |
| T04 | Usuário acessa perfil sem token | `GET /auth/me` | API rodando | sem token | `401` | Auth/T04 - Usuário acessa perfil sem token |
| T05 | Consulta pública de unidades | `GET /unidades` | Seed aplicado | sem body | `200` + lista | Catálogo/T05 - Consulta pública de unidades |
| T06 | Consulta pública de produtos | `GET /produtos?page=1&limit=10` | Seed aplicado | query `page`/`limit` | `200` + lista paginada | Catálogo/T06 - Consulta pública de produtos |
| T07 | Cliente cria pedido válido | `POST /pedidos` | Cliente logado, unidade/produto salvos | `canalPedido`, unidade e itens | `201` + `AGUARDANDO_PAGAMENTO` | Pedidos e Pagamento/T07 - Cliente cria pedido válido |
| T08 | Administrador filtra pedidos por canal | `GET /pedidos?canalPedido=APP` | Administrador logado, pedido criado | query `canalPedido` | `200` + lista | Pedidos e Pagamento/T08 - Administrador filtra pedidos por canal |
| T09 | Cliente tenta filtrar pedidos por canal | `GET /pedidos?canalPedido=APP` | Cliente logado, pedido criado | query `canalPedido` | `403` + `SEM_PERMISSAO` | Pedidos e Pagamento/T09 - Cliente tenta filtrar pedidos por canal |
| T10 | Cliente realiza pagamento mock aprovado | `POST /pagamentos/mock` | Cliente logado, pedido aguardando pagamento | `pedidoId`, `aprovado=true` | `201` + `APROVADO` e `PAGO` | Pedidos e Pagamento/T10 - Cliente realiza pagamento mock aprovado |
| T11 | Cliente cria pedido para pagamento negado | `POST /pedidos` | Cliente logado | pedido válido | `201` | Pedidos e Pagamento/T11 - Cliente cria pedido para pagamento negado |
| T12 | Cliente realiza pagamento mock negado | `POST /pagamentos/mock` | Cliente logado, pedido criado no T11 | `pedidoId`, `aprovado=false` | `201` + `NEGADO` e `PAGAMENTO_NEGADO` | Pedidos e Pagamento/T12 - Cliente realiza pagamento mock negado |
| T13 | Cliente consulta saldo de fidelidade | `GET /fidelidade/saldo` | Cliente logado | token cliente | `200` + pontos | Fidelidade, Auditoria e Erros/T13 - Cliente consulta saldo de fidelidade |
| T14 | Administrador consulta auditoria | `GET /auditoria?limit=20` | Administrador logado e ações sensíveis executadas | token administrador | `200` + registro de ação sensível | Fidelidade, Auditoria e Erros/T14 - Administrador consulta auditoria |
| T15 | Cliente tenta consultar auditoria | `GET /auditoria?limit=20` | Cliente logado | token cliente | `403` + `SEM_PERMISSAO` | Fidelidade, Auditoria e Erros/T15 - Cliente tenta consultar auditoria |
| T16 | Cliente tenta criar pedido sem canal | `POST /pedidos` | Cliente logado | body sem `canalPedido` | `400` + `VALIDACAO_INVALIDA` | Fidelidade, Auditoria e Erros/T16 - Cliente tenta criar pedido sem canal |
| T17 | Cliente tenta criar pedido sem estoque | `POST /pedidos` | Cliente logado | quantidade muito alta | `409` + `CONFLITO_REGRA_NEGOCIO` | Fidelidade, Auditoria e Erros/T17 - Cliente tenta criar pedido sem estoque |
| T18 | Cliente tenta criar produto sem permissão | `POST /produtos` | Cliente logado | token cliente | `403` + `SEM_PERMISSAO` | Fidelidade, Auditoria e Erros/T18 - Cliente tenta criar produto sem permissão |
| T19 | Cliente tenta criar pedido com quantidade inválida | `POST /pedidos` | Cliente logado | quantidade negativa | `400` + `VALIDACAO_INVALIDA` | Fidelidade, Auditoria e Erros/T19 - Cliente tenta criar pedido com quantidade inválida |
| T20 | Cliente tenta criar pedido com produto inexistente | `POST /pedidos` | Cliente logado e unidade existente | produto inexistente | `404` + `RECURSO_NAO_ENCONTRADO` | Fidelidade, Auditoria e Erros/T20 - Cliente tenta criar pedido com produto inexistente |
| T21 | Gerente realiza login válido | `POST /auth/login` | Seed aplicado | e-mail/senha do gerente | `200` + `accessToken` | Perfis e Permissões/T21 - Gerente realiza login válido |
| T22 | Gerente consulta estoque da unidade | `GET /estoque?unidadeId={id}` | Gerente logado e unidade salva | token gerente e `unidadeId` | `200` + estoque da unidade | Perfis e Permissões/T22 - Gerente consulta estoque da unidade |
| T23 | Cliente tenta consultar estoque da unidade | `GET /estoque?unidadeId={id}` | Cliente logado e unidade salva | token cliente e `unidadeId` | `403` + `SEM_PERMISSAO` | Perfis e Permissões/T23 - Cliente tenta consultar estoque da unidade |
| T24 | Administrador lista usuários | `GET /usuarios` | Administrador logado | token administrador | `200` + usuários sem `senhaHash` | Perfis e Permissões/T24 - Administrador lista usuários |
| T25 | Cliente tenta listar usuários | `GET /usuarios` | Cliente logado | token cliente | `403` + `SEM_PERMISSAO` | Perfis e Permissões/T25 - Cliente tenta listar usuários |
| T26 | Cozinha realiza login válido | `POST /auth/login` | Seed aplicado | e-mail/senha da cozinha | `200` + `accessToken` | Cozinha/T26 - Cozinha realiza login válido |
| T27 | Cozinha lista pedidos pagos | `GET /pedidos?status=PAGO` | Cozinha logada e pagamento aprovado no T10 | token cozinha e filtro de status | `200` + pedido aprovado | Cozinha/T27 - Cozinha lista pedidos pagos |
| T28 | Cozinha inicia preparo do pedido | `PATCH /pedidos/{id}/status` | Pedido do T10 com status `PAGO` | status `EM_PREPARO` | `200` + `EM_PREPARO` | Cozinha/T28 - Cozinha inicia preparo do pedido |
| T29 | Cozinha marca pedido como pronto | `PATCH /pedidos/{id}/status` | Pedido com status `EM_PREPARO` | status `PRONTO` | `200` + `PRONTO` | Cozinha/T29 - Cozinha marca pedido como pronto |
| T30 | Cozinha marca pedido como entregue | `PATCH /pedidos/{id}/status` | Pedido com status `PRONTO` | status `ENTREGUE` | `200` + `ENTREGUE` | Cozinha/T30 - Cozinha marca pedido como entregue |

## Cobertura mínima atendida

- Autenticação com token válido.
- Acesso sem token.
- Perfil sem permissão.
- Validação de campo obrigatório.
- Regra de negócio de estoque insuficiente.
- Criação de pedido com `canalPedido`.
- Filtro de pedido por canal.
- Pagamento mock aprovado.
- Pagamento mock negado.
- Fidelidade.
- Auditoria com registro de ação sensível.
- Acesso do gerente ao estoque da unidade.
- Proteção da consulta de estoque contra clientes.
- Listagem administrativa de usuários sem exposição de `senhaHash`.
- Proteção da listagem de usuários contra clientes.
- Autenticação e consulta de pedidos pela cozinha.
- Atualização sequencial do pedido para `EM_PREPARO`, `PRONTO` e `ENTREGUE`.
- Quantidade inválida.
- Produto inexistente.
