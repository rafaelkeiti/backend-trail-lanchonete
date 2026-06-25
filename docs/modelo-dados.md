# Modelo de Dados
## Resumo das tabelas criadas
obs: o DER (Diagrama de entidade-relacionamento) será mostrado na documentação, mas o modelo abaixo já está alinhado ao `prisma/schema.prisma`.

## Tabelas principais

| Tabela | Finalidade |
| --- | --- |
| `Usuario` | Armazena os usuário do sistema, senha com hash, perfil/role e consentimento de fidelidade. |
| `Unidade` | Representa cada unidade/franquia da rede |
| `Produto` | Representa itens do cardápio com preço |
| `Estoque` | Controla saldo de cada produto por unidade |
| `MovimentacaoEstoque` | Registra entradas, saídas, reservas e estornos de estoque. |
| `Pedido` | Registra pedidos dos cliente, unidade, status, total e `canalPedido`. |
| `PedidoItem` | Registra os produtos e valores de cada item do pedido. |
| `Pagamento` | Registra a simulação de pagamento mockado e o retorno |
| `Fidelidade` | Armazena saldo dos pontos do cliente. |
| `Auditoria` | Registra ações sensíveis para rastreabilidade. |

## Enums

| Enum | Valores |
| --- | --- |
| `PerfilUsuario` | `ADMIN`, `GERENTE`, `ATENDENTE`, `CLIENTE`, `COZINHA` |
| `CanalPedido` | `APP`, `TOTEM`, `BALCAO`, `PICKUP`, `WEB` |
| `StatusPedido` | `CRIADO`, `AGUARDANDO_PAGAMENTO`, `PAGO`, `PAGAMENTO_NEGADO`, `EM_PREPARO`, `PRONTO`, `ENTREGUE`, `CANCELADO` |
| `StatusPagamento` | `PENDENTE`, `APROVADO`, `NEGADO` |
| `TipoMovimentacaoEstoque` | `ENTRADA`, `SAIDA`, `RESERVA`, `ESTORNO` |

## Relacionamentos

- Uma `Unidade` possui muitos registros de `Estoque`.
- Um `Produto` pode aparecer no estoque de várias unidades.
- Um `Pedido` pertence a um `Usuario` cliente e a uma `Unidade`.
- Um `Pedido` possui muitos `PedidoItem`.
- Um `Pedido` pode ter um `Pagamento`.
- Um `Usuario` pode ter um registro de `Fidelidade`.
- Uma `MovimentacaoEstoque` pode registrar o usuário responsável.
- Uma `Auditoria` pode registrar o usuário que executou a ação.

## Dados iniciais

O seed cria:

- usuário admin: `admin@lanchonete.com`;
- usuário gerente: `gerente@lanchonete.com`;
- usuário cliente: `cliente@exemplo.com`;
- senha padrão para todos: `Senha@123`;
- duas unidades;
- três produtos;
- saldos iniciais de estoque;
- um pedido de exemplo com pagamento mockado (aprovado);
- registros de auditoria.
