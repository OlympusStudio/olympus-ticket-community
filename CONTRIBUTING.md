# Contribuindo

Obrigado por querer melhorar o Ticket Free.

## Fluxo recomendado

1. Crie uma branch para sua mudanca.
2. Mantenha o escopo pequeno e descreva o motivo no pull request.
3. Rode `npm run qa` antes de enviar.
4. Nao inclua tokens, IDs privados, arquivos `.env` ou bancos SQLite no commit.

## Padrao de codigo

- Use CommonJS, como o restante do projeto.
- Prefira textos e comentarios em ASCII para evitar problemas de encoding.
- Mantenha configuracoes sensiveis no `.env`.
- Ao alterar comportamento de tickets, teste no Discord antes de publicar.
