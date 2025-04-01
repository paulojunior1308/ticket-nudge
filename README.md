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
