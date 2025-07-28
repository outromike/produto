
# ELGIN APP - Sistema de Gerenciamento Logístico

Bem-vindo ao **ELGIN APP**, uma aplicação web completa desenvolvida para otimizar e gerenciar processos logísticos, de inventário e de recebimento de produtos para as unidades de Itajaí (ITJ) e Joinville (JVL).

## ✨ Funcionalidades Principais

O sistema é dividido em vários módulos, com acesso controlado por um sistema de permissões granular, garantindo que cada usuário tenha acesso apenas às funcionalidades relevantes para sua função.

### 1. Autenticação e Segurança
- **Página de Login**: Acesso seguro ao sistema com usuário e senha.
- **Sessões Criptografadas**: Utiliza `iron-session` para garantir que os dados da sessão do usuário sejam mantidos de forma segura.
- **Sistema de Permissões**: Um painel de administrador robusto permite a gestão de usuários e a atribuição de permissões específicas para cada módulo da aplicação.

### 2. Dashboard Principal
- **Hub Centralizado**: Ao fazer login, o usuário é direcionado para um dashboard com cards de acesso rápido para todas as funcionalidades às quais ele tem permissão.
- **Navegação Intuitiva**: A barra de navegação superior e o menu lateral (em dispositivos móveis) também são dinâmicos, exibindo apenas os links para as seções autorizadas.

### 3. Painel do Administrador (`/admin`)
Acesso restrito para usuários com a role `admin`.
- **Gerenciamento de Usuários**:
  - Crie, edite e exclua contas de usuário.
  - Atribua permissões detalhadas para cada módulo, como:
    - Acesso ao Dashboard de Análises
    - Consulta de Produtos
    - Gerenciamento de Produtos (CRUD)
    - Gerenciamento de Agendamentos
    - Acesso ao Recebimento
    - Execução de Conferência
    - Alocação de Estoque
    - Geração de Relatórios
- **Upload de Produtos**:
  - Faça o upload de planilhas CSV para as unidades de Itajaí (ITJ) e Joinville (JVL) para popular ou atualizar a base de dados de produtos de forma massiva.

### 4. Módulos de Operação

#### 📊 Dashboard de Análises (`/dashboard/analytics`)
- **Visão Geral do Estoque**: Métricas e gráficos sobre a ocupação do estoque da "Rua 08".
- **Estatísticas Relevantes**:
  - Percentual de ocupação.
  - Posições totais, ocupadas e disponíveis.
  - Contagem de posições com produtos bons e com produtos para descarte.

#### 📦 Produtos

- **Consulta de Produtos (`/dashboard/products`)**:
  - Visualize todos os produtos em um layout de grade ou tabela.
  - Utilize filtros avançados por SKU, descrição, categoria, unidade (ITJ/JVL), classificação ABC e tipo de embalagem.
  - **Página de Detalhes**: Veja todas as informações de um produto específico, incluindo pesos, dimensões e paletização.
  - **Sugestões com IA**: Na página de detalhes, um assistente de IA pode sugerir produtos similares ou alternativos com base no item visualizado.

- **Gerenciamento de Produtos (`/dashboard/products/management`)**:
  - **Adicionar**: Crie novos produtos através de um formulário completo em um modal.
  - **Editar e Excluir**: Utilize uma ferramenta de busca para encontrar produtos específicos por SKU ou descrição e realizar edições ou exclusões com diálogo de confirmação para segurança.

#### 🗓️ Agendamentos (`/dashboard/schedules`)
- **Criação e Edição**: Adicione ou modifique agendamentos de devolução através de um formulário intuitivo, com suporte para múltiplas NFDs.
- **Visualização Organizada**: Os agendamentos são separados em abas ("Hoje" e "Outros Agendamentos") para fácil visualização.
- **Filtros e Busca**: Encontre agendamentos por cliente, NFD, transportadora, etc.
- **Status de Recebimento**: Ícones visuais indicam rapidamente se uma NFD já foi conferida, recusada ou está pendente.

#### 📥 Recebimento e Conferência (`/dashboard/receiving`)
- **Visão por Transportadora**: Agendamentos do dia são agrupados por transportadora, mostrando o total de notas e volumes.
- **Fluxo de Conferência**:
  - Inicie o processo de conferência para uma transportadora.
  - Uma tela dedicada lista todas as NFDs do dia para conferência.
  - **Modal de Conferência**: Para cada NFD, registre os produtos recebidos, volumes, estado (bom, avariado, descarte) e observações.
  - **Recusa Total**: Opção para marcar uma nota fiscal inteira como recusada.
- **Destino e Alocação**: Após a conferência, os cards indicam os próximos passos:
  - **Alocar na Rua 08**: Inicia o assistente de alocação.
  - **Destinar Produtos**: Para notas com BDV, permite o envio para Multiog, Joinville ou Descarte.

#### 🏢 Alocação - Rua 08 (`/dashboard/rua08`)
- **Assistente de Alocação**: Um wizard guia o usuário na alocação dos itens conferidos no recebimento, garantindo rastreabilidade.
- **Gerenciamento Manual**: Permite adicionar ou remover itens do estoque manualmente, com formulário e busca de produtos.
- **Visualização do Estoque**: Uma tabela exibe todos os itens atualmente alocados na Rua 08.

#### 📄 Relatórios (`/dashboard/reports`)
- **Exportação para Excel**: Exporte relatórios detalhados com base em filtros de período ou dados completos:
  - Relatório de Agendamentos
  - Relatório de Estoque (Rua 08)
  - Relatório de Recebimentos

## 🚀 Como Iniciar (Ambiente de Desenvolvimento)

1. **Clone o repositório:**
   ```bash
   git clone <url-do-seu-repositorio>
   ```
2. **Instale as dependências:**
   ```bash
   npm install
   ```
3. **Configure as variáveis de ambiente:**
   - Renomeie o arquivo `.env.example` para `.env` e preencha com a chave secreta para a sessão:
     ```
     SECRET_COOKIE_PASSWORD=uma_chave_secreta_de_pelo_menos_32_caracteres
     ```
4. **Rode a aplicação:**
   ```bash
   npm run dev
   ```
   A aplicação estará disponível em `http://localhost:9002`.

## ⚙️ Deploy em VPS (com Virtualmin)

Para atualizar a aplicação na sua VPS, siga estes passos:

1. **Acesse sua VPS** via SSH.
2. **Navegue até o diretório do projeto.**
3. **Puxe as atualizações mais recentes do seu repositório:**
   ```bash
   git pull origin main  # ou a branch que você estiver usando
   ```
4. **Instale qualquer nova dependência e faça o build da nova versão:**
   - O script `install.sh` já cuida disso. Execute-o:
     ```bash
     chmod +x install.sh
     ./install.sh
     ```
5. **Reinicie sua aplicação com o PM2** (ou o gerenciador de processos que você utiliza):
   ```bash
   pm2 restart seu-app # Substitua "seu-app" pelo nome do seu processo no PM2
   ```

Isso garantirá que a nova versão do código, com todas as funcionalidades e correções, esteja em produção.
