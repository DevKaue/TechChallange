# Linguagem Ubíqua — Gestão de Clientes

> **Subdomínio:** Supporting Domain  
> **Domínio Principal:** Manutenção de Veículos  
> **Bounded Context:** Contexto Administrativo (Core Data)

---

## Glossário

| Termo | Definição |
|---|---|
| **Cliente** | Pessoa física (CPF) ou jurídica (CNPJ) que contrata os serviços da oficina. Um Cliente pode possuir um ou mais Veículos e ter diversas Ordens de Serviço vinculadas ao longo do tempo. |
| **CPF/CNPJ** | Documento de identificação fiscal único do Cliente. CPF para pessoa física (11 dígitos) e CNPJ para pessoa jurídica (14 dígitos). É o campo obrigatório utilizado pelo Atendente para **identificar o Cliente** na recepção da oficina. |
| **Nome do Cliente** | Nome completo (pessoa física) ou razão social (pessoa jurídica). Campo obrigatório no cadastro. |
| **E-mail de Contato** | Endereço de e-mail do Cliente, utilizado para envio de notificações sobre orçamentos e status de serviço. Campo opcional. |
| **Telefone de Contato** | Número de telefone do Cliente para comunicação direta (ligações, SMS, WhatsApp). Campo opcional. |
| **Identificação do Cliente** | Processo de localizar um Cliente já cadastrado no sistema através do CPF/CNPJ. Realizado pelo Atendente na recepção como primeiro passo antes da abertura de uma OS. Caso o Cliente não seja encontrado, o cadastro deve ser realizado. |
| **Cadastro do Cliente** | Ato de registrar um novo Cliente no sistema, informando CPF/CNPJ, nome e, opcionalmente, e-mail e telefone. Não é permitido cadastrar dois Clientes com o mesmo CPF/CNPJ. |
| **Atualização dos Dados do Cliente** | Ato de modificar as informações cadastrais de um Cliente existente (nome, e-mail, telefone). O CPF/CNPJ não pode ser alterado após o cadastro. |
| **Consulta de Cliente** | Ato de buscar um Cliente no sistema por ID interno ou por CPF/CNPJ para visualizar suas informações cadastrais, veículos e histórico de Ordens de Serviço. |
| **Remoção de Cliente** | Ato de excluir o registro de um Cliente da base. Só é permitido quando o Cliente não possui Ordens de Serviço ativas. |
| **Histórico do Cliente** | Conjunto de todas as Ordens de Serviço e Veículos vinculados a um Cliente ao longo do tempo. Permite rastreabilidade completa do relacionamento com a oficina. |
| **Cliente Duplicado** | Situação em que se tenta cadastrar um Cliente com um CPF/CNPJ já existente na base. O sistema rejeita e informa o conflito. |
| **Atendente** | Ator (usuário do sistema) responsável por identificar e cadastrar Clientes na recepção da oficina. |

---

## Regras de Negócio

| # | Regra |
|---|---|
| RN-01 | CPF/CNPJ é o identificador único do Cliente. Não é permitido duplicidade. |
| RN-02 | CPF deve ter 11 dígitos; CNPJ deve ter 14 dígitos. Validação de formato é obrigatória. |
| RN-03 | Nome é campo obrigatório. Cadastro sem nome deve ser rejeitado. |
| RN-04 | E-mail e telefone são opcionais, porém recomendados para receber notificações. |
| RN-05 | E-mail, quando informado, deve ter formato válido. |
| RN-06 | CPF/CNPJ é imutável após o cadastro. |
| RN-07 | Cliente com Ordem de Serviço ativa não pode ser removido do sistema. |
| RN-08 | A identificação do Cliente (por CPF/CNPJ) é pré-requisito obrigatório para a criação de uma OS. |

---

*Documento elaborado como parte da documentação DDD — Tech Challenge Fase 1.*
