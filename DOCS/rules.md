# rules.md

## Principios Obrigatorios
- Backend unico: Supabase (Postgres + Auth + RPC + Edge Functions).
- DB e fonte de verdade; conteudo, unlock e progresso nao podem viver no frontend.
- App generico para multiplas trilhas/blocos/fases/desafios.
- Progressao obrigatoria: blocos e fases destravam por ordem; desafio final do bloco e requisito de conclusao.
- Criterio de progresso:
  - Fase completa quando todos os desafios foram respondidos e >= 50% corretos.
  - Bloco completo quando todas as fases estao completas e o desafio final foi aprovado.
  - Progresso nao reverte.
- Conteudo nao depende de leitura externa; leituras sao apenas recomendadas.
- Sem offline no estado atual.
- Conteudo bloqueado por `subscription` deve abrir o paywall; bloqueios por progresso nao devem liberar navegacao.
- Acesso ao app deve passar pelo gate de autenticacao (login/cadastro).
- Ao reabrir uma fase, exibir a melhor tentativa do usuario por desafio.
- Desafios finais devem ficar apenas em fases `phase_type = review`.
- Fases de revisao devem ser destacadas no card com badge e CTA indicando conclusao do bloco.

## Convencoes de Codigo
- TypeScript strict deve permanecer ativo; tipagem central em `lib/types.ts`.
- Expo Router file-based; novas rotas em `app/` seguindo o padrao atual.
- Alias `@/` aponta para a raiz do projeto; usar para imports internos.
- RPCs retornam chaves em camelCase; o frontend depende desse shape.
- Ordenacao sempre por `order_index`.
- i18n sempre via tabelas de traducao e parametro `p_locale`.

## Restricoes
- Nao trocar Supabase ou adicionar outro backend sem discussao.
- Nao mover logica de negocio para o frontend.
- Nao expor service role key no app; usar apenas anon key.
- Nao desativar RLS nem acessar tabelas sem politicas.
- Nao mudar enums (`challenge_type`, `progress_status`, `entitlement_status`) sem alinhar schema e app.
- Nao alterar `newArchEnabled` sem validacao explicita.

## Seguranca & Dados
- RLS deve permanecer ativa em todas as tabelas.
- Leitura publica apenas de conteudo publicado; escrita somente do proprio usuario.
- `entitlements.raw_receipt` e dados sensiveis; acesso apenas server-side/administrativo.
- Qualquer escrita deve usar `auth.uid()` para ownership.
- Chaves e URLs do Supabase ficam em `.env` e nao devem ser commitadas.
- `challenge_attempts.answers` deve seguir o formato por tipo de desafio (quiz/true_false/match).
- Gravacao de tentativas e progresso deve passar por `rpc_submit_challenge_attempt`.
- Trigger `handle_new_user` deve permanecer ativo para criar `profiles` no signup.

## Uso do Agente
- Deve perguntar antes de:
  - Alterar schema/RLS/RPCs ou gerar migracoes.
  - Adicionar dependencias ou mudar navegacao/arquitetura.
  - Integrar pagamentos, push, analytics ou novos servicos externos.
  - Habilitar offline ou mudar o modelo de monetizacao.
- Pode sugerir:
  - Novos RPCs para progresso e admin.
  - Ajustes de UI e renderizacao de desafios.
  - Refatoracoes locais sem quebrar o contrato de dados.
- Nao pode sugerir:
  - Remover Supabase como backend.
  - Colocar logica de unlock/progresso no frontend.
