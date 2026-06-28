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
| T01 | Login cliente válido | `POST /auth/login` | Seed aplicado | e-mail/senha do cliente | `200` + `accessToken` | Auth/T01 |
| T02 | Login admin válido | `POST /auth/login` | Seed aplicado | e-mail/senha do admin | `200` + `accessToken` | Auth/T02 |
| T03 | Login inválido | `POST /auth/login` | Seed aplicado | senha errada | `401` + erro padrão | Auth/T03 |
| T04 | Acesso sem token | `GET /auth/me` | API rodando | sem token | `401` | Auth/T04 |
| T05 | Listar unidades | `GET /unidades` | Seed aplicado | sem body | `200` + lista | Catálogo/T05 |
| T06 | Listar produtos | `GET /produtos?page=1&limit=10` | Seed aplicado | query `page`/`limit` | `200` + lista paginada | Catálogo/T06 |
| T07 | Criar pedido válido | `POST /pedidos` | Cliente logado, unidade/produto salvos | `canalPedido`, unidade e itens | `201` + `AGUARDANDO_PAGAMENTO` | Pedidos e Pagamento/T07 |
| T08 | Filtrar pedidos por canal | `GET /pedidos?canalPedido=APP` | Admin logado, pedido criado | query `canalPedido` | `200` + lista | Pedidos e Pagamento/T08 |
| T09 | Pagamento mock aprovado | `POST /pagamentos/mock` | Pedido aguardando pagamento | `pedidoId`, `aprovado=true` | `201` + `APROVADO` e `PAGO` | Pedidos e Pagamento/T09 |
| T10 | Criar pedido para pagamento negado | `POST /pedidos` | Cliente logado | pedido válido | `201` | Pedidos e Pagamento/T10 |
| T11 | Pagamento mock negado | `POST /pagamentos/mock` | Pedido criado no T10 e aguardando pagamento | `pedidoId`, `aprovado=false` | `201` + `NEGADO` e `PAGAMENTO_NEGADO` | Pedidos e Pagamento/T11 |
| T12 | Consultar saldo fidelidade | `GET /fidelidade/saldo` | Cliente logado | token cliente | `200` + pontos | Fidelidade, Auditoria e Erros/T12 |
| T13 | Consultar auditoria | `GET /auditoria?limit=20` | Admin logado | token admin | `200` + registros | Fidelidade, Auditoria e Erros/T13 |
| T14 | Pedido sem `canalPedido` | `POST /pedidos` | Cliente logado | body sem canal | `400` + `VALIDACAO_INVALIDA` | Fidelidade, Auditoria e Erros/T14 |
| T15 | Estoque insuficiente | `POST /pedidos` | Cliente logado | quantidade muito alta | `409` + `CONFLITO_REGRA_NEGOCIO` | Fidelidade, Auditoria e Erros/T15 |
| T16 | Perfil sem permissão | `POST /produtos` | Cliente logado | token cliente | `403` | Fidelidade, Auditoria e Erros/T16 |
| T17 | Quantidade inválida | `POST /pedidos` | Cliente logado | quantidade negativa | `400` + `VALIDACAO_INVALIDA` | Fidelidade, Auditoria e Erros/T17 |
| T18 | Produto inexistente | `POST /pedidos` | Cliente logado e unidade existente | produto inexistente | `404` + `RECURSO_NAO_ENCONTRADO` | Fidelidade, Auditoria e Erros/T18 |

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
- Auditoria.
- Quantidade inválida.
- Produto inexistente.
