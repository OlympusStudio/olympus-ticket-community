<div align="center">
  <img src="https://public-blob.squarecloud.dev/8c0581e39496096d54dcb900d53d6ce2fee14248/olympus.png" alt="Olympus Studio" width="100%" />

  <h1>Ticket Free</h1>

  <p>
    Um bot de tickets para Discord, simples de hospedar, persistente com SQLite
    e pronto para comunidades que precisam de atendimento organizado.
  </p>

  <p>
    <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-green.svg" /></a>
    <img alt="Node.js >= 22.5" src="https://img.shields.io/badge/node-%3E%3D22.5-43853d.svg" />
    <img alt="Discord.js v14" src="https://img.shields.io/badge/discord.js-v14-5865F2.svg" />
    <img alt="SQLite" src="https://img.shields.io/badge/database-SQLite-003B57.svg" />
  </p>
</div>

---

## Sobre

**Ticket Free** e um bot open source da Olympus Studio para criar e gerenciar tickets no Discord. Ele foi pensado para servidores que precisam separar atendimentos por categoria, registrar historico de canais e evitar tickets duplicados do mesmo usuario.

O projeto usa `discord.js` v14, configuracao por `.env` e persistencia local em SQLite via `node:sqlite`, sem exigir um banco externo para ambientes pequenos e medios.

## Recursos

| Recurso | Descricao |
| --- | --- |
| Painel de tickets | Publica um menu com categorias de atendimento. |
| Categorias prontas | Suporte, duvida, problema na compra, compra, avaliacao e sugestao. |
| Controle persistente | Usa SQLite para registrar tickets abertos e fechados. |
| Bloqueio de duplicados | Impede que o mesmo usuario abra outro ticket da mesma categoria enquanto um anterior segue aberto. |
| Transcript HTML | Gera um arquivo `.html` do canal antes do fechamento. |
| Logs | Envia transcripts para um canal de logs configuravel. |
| Configuracao segura | Token e IDs ficam fora do codigo, em `.env`. |
| Licenca permissiva | Distribuido sob MIT. |

## Requisitos

- Node.js `22.5.0` ou superior.
- Um bot criado no [Discord Developer Portal](https://discord.com/developers/applications).
- Permissoes para criar canais, gerenciar canais e ler/enviar mensagens.
- Intent **Message Content** ativada no portal do Discord, caso mantenha comandos por prefixo.

## Instalacao

Clone o repositorio e instale as dependencias:

```bash
npm install
```

Crie seu arquivo de ambiente:

```bash
cp .env.example .env
```

Preencha as variaveis obrigatorias:

```env
DISCORD_TOKEN=
GUILD_ID=
CATEGORY_ID=
SUPPORT_ROLE_ID=
CLIENT_ROLE_ID=
LOG_CHANNEL_ID=
AVALIACAO_CHANNEL_ID=
SUGESTAO_CHANNEL_ID=
DUVIDA_CHANNEL_ID=
DATABASE_PATH=./data/tickets.sqlite
COLOR=#5865F2
```

Valide o projeto:

```bash
npm run qa
```

Inicie o bot:

```bash
npm start
```

## Uso

Por padrao, o prefixo fica em `src/config.json`:

```json
{
  "prefix": "."
}
```

Para publicar o painel de tickets no canal atual, use:

```text
.ticket
```

Somente membros com permissao de administrador podem executar esse comando.

## Persistencia SQLite

O bot cria automaticamente o banco definido por `DATABASE_PATH`.

```env
DATABASE_PATH=./data/tickets.sqlite
```

A pasta `data/` e arquivos SQLite (`*.sqlite`, `*.sqlite-shm`, `*.sqlite-wal`) ja estao no `.gitignore`, entao dados locais nao entram em commits.

## Estrutura

```text
src/
  commands/      Comandos por prefixo
  database/      Camada SQLite
  events/        Eventos do Discord
  handlers/      Carregadores de comandos e eventos
  utils/         Logger e transcript HTML
```

## Checklist de QA

Antes de publicar uma release ou subir em producao:

- Rode `npm run qa`.
- Rode `npm audit`.
- Abra cada tipo de ticket em um servidor de testes.
- Tente abrir dois tickets iguais com o mesmo usuario.
- Feche um ticket e confirme que o transcript chegou ao canal de logs.
- Reabra um ticket da mesma categoria apos fechar o anterior.
- Envie avaliacao, sugestao e duvida e confira os canais de destino.
- Reinicie o bot e confirme que tickets abertos continuam bloqueando duplicados.

## Publicacao no GitHub

Arquivos sensiveis e dados locais ja estao protegidos pelo `.gitignore`. Para uma publicacao limpa:

```bash
git init
git add .
git commit -m "Initial open source release"
git branch -M main
git remote add origin <url-do-repositorio>
git push -u origin main
```

## Contribuindo

Contribuicoes sao bem-vindas. Antes de abrir um pull request, leia [CONTRIBUTING.md](./CONTRIBUTING.md), mantenha o escopo pequeno e inclua uma descricao clara do comportamento alterado.

## Licenca

Distribuido sob a licenca MIT. Veja [LICENSE](./LICENSE).
