# Sistema de Gerenciamento de Chamados

Este sistema permite gerenciar usuários que não abrem chamados diários, enviando lembretes por email e mantendo um registro das ações.

## Funcionalidades

- Cadastro de usuários que não abrem chamados
- Envio automático de lembretes por email
- Exportação de dados para Excel
- Gerenciamento de status dos usuários
- Interface moderna e responsiva

## Requisitos

- Node.js 18 ou superior
- NPM ou Yarn
- Servidor SMTP para envio de emails

## Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
cd ticket-nudge
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações de SMTP.

## Uso

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

2. Para iniciar o serviço de envio de lembretes:
```bash
npm run start:reminder
# ou
yarn start:reminder
```

3. Acesse a aplicação em `http://localhost:5173`

## Estrutura do Projeto

- `/src/components`: Componentes reutilizáveis
- `/src/pages`: Páginas da aplicação
- `/src/services`: Serviços (email, etc.)
- `/src/scripts`: Scripts de automação
- `/src/types`: Definições de tipos TypeScript

## Configuração do Email

O sistema utiliza o Nodemailer para envio de emails. Configure as seguintes variáveis de ambiente no arquivo `.env`:

- `SMTP_HOST`: Host do servidor SMTP
- `SMTP_PORT`: Porta do servidor SMTP
- `SMTP_USER`: Usuário do servidor SMTP
- `SMTP_PASS`: Senha do servidor SMTP
- `SMTP_FROM`: Email remetente

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

# Ticket Nudge

Sistema de gerenciamento de tickets e empréstimos de laptops.

## Deploy no Render

### Pré-requisitos

1. Conta no [Render](https://render.com/)
2. Repositório Git com o código do projeto

### Passos para Deploy

1. Faça login no Render
2. Clique em "New" e selecione "Web Service"
3. Conecte seu repositório Git
4. Configure o serviço:
   - **Name**: ticket-nudge-server
   - **Environment**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && node server.js`
   - **Plan**: Free (ou outro de sua preferência)

5. Configure as variáveis de ambiente:
   - VITE_FIREBASE_PROJECT_ID
   - FIREBASE_CLIENT_EMAIL
   - FIREBASE_PRIVATE_KEY_ID
   - FIREBASE_CLIENT_ID
   - FIREBASE_PRIVATE_KEY
   - VITE_EMAIL_USER
   - VITE_EMAIL_PASSWORD
   - PORT (definido como 10000)

6. Clique em "Create Web Service"

### Alternativa: Usando render.yaml

Você também pode usar o arquivo `render.yaml` incluído no projeto para configurar o deploy automaticamente:

1. Faça login no Render
2. Clique em "New" e selecione "Blueprint"
3. Conecte seu repositório Git
4. O Render detectará automaticamente o arquivo `render.yaml` e configurará o serviço

### Importante

- Certifique-se de que todas as variáveis de ambiente estejam configuradas corretamente
- A chave privada do Firebase deve ser formatada corretamente (com quebras de linha)
- O servidor será acessível através da URL fornecida pelo Render

## Desenvolvimento Local

Para executar o projeto localmente:

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   cd server && npm install
   ```
3. Configure as variáveis de ambiente no arquivo `.env` na pasta `server`
4. Inicie o servidor:
   ```
   cd server && npm start
   ```
5. Inicie o frontend:
   ```
   npm run dev
   ```
