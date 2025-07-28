#!/bin/bash

# ==============================================================================
#   Script de Instalação e Configuração do Projeto
# ==============================================================================
#
#   Este script foi criado para facilitar a instalação e configuração inicial
#   do seu projeto Next.js em um ambiente de desenvolvimento ou produção (VPS).
#   Ele realizará as seguintes ações:
#
#   1.  Verificação de dependências essenciais (Node.js, npm, Git).
#   2.  Criação e configuração de um arquivo de ambiente (.env).
#   3.  Geração de uma chave secreta segura para a sessão.
#   4.  Configuração das permissões de usuário iniciais.
#   5.  Instalação das dependências do projeto.
#   6.  Build da aplicação para produção.
#   7.  Fornecimento de instruções para iniciar o servidor.
#
#   Para executar, dê permissão de execução com o comando:
#   chmod +x install.sh
#
#   E depois execute-o com:
#   ./install.sh
#
# ==============================================================================

# Cores para o output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sem cor

echo -e "${GREEN}Iniciando a instalação e configuração do seu projeto...${NC}\n"

# --- 1. Verificação de Dependências ---
echo "--- Verificando dependências ---"

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

if ! command_exists node; then
  echo -e "${RED}Erro: Node.js não está instalado.${NC}"
  echo -e "${YELLOW}Por favor, instale o Node.js para continuar. Você pode baixá-lo em: https://nodejs.org/${NC}"
  exit 1
fi

if ! command_exists npm; then
  echo -e "${RED}Erro: npm não está instalado.${NC}"
  echo -e "${YELLOW}O npm geralmente é instalado junto com o Node.js. Verifique sua instalação.${NC}"
  exit 1
fi

if ! command_exists git; then
  echo -e "${YELLOW}Aviso: Git não está instalado.${NC}"
  echo -e "O Git é recomendado para controle de versão, mas não é estritamente necessário para rodar este script."
fi

echo -e "${GREEN}Todas as dependências necessárias foram encontradas.${NC}\n"


# --- 2. Configuração do Arquivo de Ambiente (.env) ---
echo "--- Configurando o arquivo de ambiente (.env) ---"

if [ -f .env ]; then
  echo -e "${YELLOW}O arquivo .env já existe. Nenhuma alteração será feita para preservar suas configurações.${NC}"
else
  echo "Criando o arquivo .env..."
  # Gera uma chave secreta segura de 32 caracteres
  SECRET=$(openssl rand -hex 32)
  echo "SECRET_COOKIE_PASSWORD=$SECRET" > .env
  echo -e "${GREEN}Arquivo .env criado com sucesso com uma chave secreta segura.${NC}"
fi
echo ""


# --- 3. Instalação das Dependências do Projeto ---
echo "--- Instalando dependências do projeto com npm ---"
echo "Isso pode levar alguns minutos..."

if npm install; then
  echo -e "${GREEN}Dependências instaladas com sucesso!${NC}\n"
else
  echo -e "${RED}Erro: Falha ao instalar as dependências com npm.${NC}"
  echo -e "${YELLOW}Verifique se você tem permissão para escrever na pasta e se o npm está configurado corretamente.${NC}"
  exit 1
fi


# --- 4. Build da Aplicação para Produção ---
echo "--- Compilando a aplicação para produção ---"
echo "Este processo otimiza a aplicação para melhor performance..."

if npm run build; then
  echo -e "${GREEN}Build da aplicação concluído com sucesso!${NC}\n"
else
  echo -e "${RED}Erro: Falha ao compilar a aplicação.${NC}"
  echo -e "${YELLOW}Verifique os logs de erro acima para identificar a causa do problema.${NC}"
  exit 1
fi


# --- 5. Instruções Finais ---
echo -e "🎉 ${GREEN}Instalação e configuração finalizadas!${NC} 🎉"
echo ""
echo "Sua aplicação está pronta para ser iniciada em modo de produção."
echo "Para iniciar o servidor, use o seguinte comando:"
echo ""
echo -e "  ${YELLOW}npm start${NC}"
echo ""
echo "O servidor será iniciado, por padrão, na porta 9002."
echo "Se você estiver em uma VPS, lembre-se de configurar seu firewall para permitir tráfego na porta escolhida."
echo ""
echo "Para manter a aplicação rodando em segundo plano (recomendado), use um gerenciador de processos como o 'pm2':"
echo "1. Instale o pm2 globalmente (só precisa fazer isso uma vez na máquina):"
echo -e "  ${YELLOW}npm install pm2 -g${NC}"
echo "2. Inicie sua aplicação com o pm2:"
echo -e "  ${YELLOW}pm2 start npm --name \"seu-app\" -- start${NC}"
echo ""
echo "Comandos úteis do pm2:"
echo -e "  - Para ver os logs: ${YELLOW}pm2 logs seu-app${NC}"
echo -e "  - Para parar a aplicação: ${YELLOW}pm2 stop seu-app${NC}"
echo -e "  - Para reiniciar a aplicação: ${YELLOW}pm2 restart seu-app${NC}"
echo ""
echo -e "Obrigado por usar nosso script de instalação! ✨"
echo ""
