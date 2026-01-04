# context.md

## Visao Geral
- Objetivo do produto: aplicativo mobile estilo Duolingo para ensinar filosofia por trilhas progressivas e desafios guiados.
- Problema que resolve: organizar o estudo com progressao clara e prerequisitos, evitando que o usuario se perca no conteudo.
- Publico-alvo: falantes de pt-BR interessados em filosofia (principalmente iniciantes).
- Escopo atual: uma trilha seed (Sao Tomas de Aquino) com 3 blocos (2 free + 1 assinatura), fases, desafios e leituras; app lista trilhas/blocos/fases/desafios via RPCs e envia tentativas dos desafios; i18n via tabelas; auth por email/senha com telas de login/cadastro; UI basica de progresso e paywall.
- Fora de escopo: modo offline, pagamentos em producao, admin panel funcional, multiplos idiomas, notificacoes, gamificacao completa, analytics.

## Stack & Infra
- Frontend: Expo managed (React Native), Expo Router, TypeScript; UI com React Native core e `@expo/vector-icons`.
- Backend: Supabase (Postgres + Auth + RPC). Edge Functions planejadas para logica server-side.
- Banco de dados: Supabase Postgres; schema em `supabase/schema.sql`, views em `supabase/views.sql`, RPCs em `supabase/rpc.sql`, seed em `supabase/seed.sql`.
- Autenticacao: Supabase Auth com email/senha implementado; social DESCONHECIDO.
- Hospedagem/deploy: Supabase hospeda o backend; distribuicao mobile via Apple/Google planejada; CI/CD DESCONHECIDO.
- Ambientes: `.env` com `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`; separacao dev/prod DESCONHECIDA.

## Arquitetura
- Visao geral: app RN consome Supabase via supabase-js; leituras prioritariamente por RPCs; DB e a fonte de verdade.
- Separacao de responsabilidades:
  - Banco/RPCs: logica de negocio (unlock, status, lockReason, entitlements).
  - App: renderizacao, navegacao e estado local de tela.
- Fluxos principais:
  - Conteudo: `rpc_get_trails` -> trilhas com blocos e status; `rpc_get_trail`, `rpc_get_block`, `rpc_get_phase`.
  - Progresso: `rpc_submit_challenge_attempt` grava tentativas e atualiza `phase_progress` e `block_progress`.
  - Assinatura: tabela `entitlements` controla acesso (status/expiracao) e e usada nas RPCs.
  - Autenticacao: login/cadastro por email/senha via Supabase Auth.
- Comunicacao entre camadas: `lib/supabase.ts` instancia cliente; `lib/api.ts` chama RPCs; telas consomem `lib/api.ts`.
- Pontos criticos de seguranca: RLS ativa em todas as tabelas; acesso publico somente a conteudo publicado; dados de progresso/entitlements restritos ao usuario; RPC de progresso exige usuario autenticado.
- Limitacoes conhecidas: sem offline, sem pagamentos ativos, sem admin panel, sem social login, sem i18n no app.

## Banco de Dados
- Supabase e fonte de verdade.
- Tipos:
  - `challenge_type`: `quiz`, `true_false`, `match`.
  - `progress_status`: `locked`, `in_progress`, `completed`.
  - `entitlement_status`: `active`, `expired`, `canceled`.
- Conteudo:
  - `trails` -> `blocks` -> `phases` -> `challenges`.
  - Tabelas de traducao: `trail_translations`, `block_translations`, `phase_translations`, `challenge_translations`.
  - Leituras: `readings` com `reading_translations`.
- Progresso e acesso:
  - `phase_progress`, `block_progress`, `challenge_attempts`, `entitlements`, `profiles`.
- Relacionamentos: FKs com `on delete cascade` em toda a arvore de conteudo e progresso.
- Regras de integridade: `order_index` unico por trail/block/phase; PKs compostas nas tabelas de traducao.
- RLS:
  - Seleciona somente conteudo publicado.
  - Progresso e tentativas apenas do proprio usuario.
  - Entitlements apenas do proprio usuario.
- Campos sensiveis: `entitlements.raw_receipt`, dados de progresso e tentativas por usuario.
- Convencoes importantes:
  - `order_index` define ordenacao.
  - `is_published` controla visibilidade.
  - `is_free` define acesso gratuito ao bloco.
  - `payload` de desafios e JSON.
  - i18n por tabela com `locale`.
  - `challenge_attempts.answers`:
    - `quiz`: `{ choiceIndex: number }`
    - `true_false`: `{ answer: boolean }`
    - `match`: `{ pairs: [{ left: string, right: string }] }`
  - `profiles` sao criados automaticamente por trigger em `auth.users` (funcao `handle_new_user`).
- Views:
  - `v_trails_published`, `v_blocks_published`, `v_phases_published`, `v_challenges_published`, `v_readings_published` (consultas simples).
- RPCs (retornam JSON com chaves em camelCase):
  - `rpc_get_trails`, `rpc_get_trail`, `rpc_get_block`, `rpc_get_phase`.
  - Computam `hasAccess`, `isUnlocked`, `status` e `lockReason` para blocos/fases.
- `rpc_get_phase` inclui `bestAttempt` por desafio (melhor tentativa do usuario).
- RPCs de escrita:
  - `rpc_submit_challenge_attempt` registra tentativa e atualiza progresso.
- Seed: `supabase/seed.sql` cria a trilha "Sao Tomas de Aquino" com UUIDs fixos, 3 blocos (2 free + 1 assinatura), 6 fases, 14 desafios e 3 leituras.

## Frontend
- Estrutura:
  - `app/` com Expo Router.
  - `app/(auth)/sign-in.tsx` e `app/(auth)/sign-up.tsx`.
  - `app/(tabs)/index.tsx` (lista de trilhas) e `app/(tabs)/profile.tsx`.
  - `app/trail/[trailId].tsx`, `app/block/[blockId].tsx`, `app/phase/[phaseId].tsx`.
  - `app/paywall.tsx` com paywall basico para lockReason `subscription`.
  - `components/challenges/` com renderer e componentes de quiz/true_false/match.
  - `context/AuthContext.tsx` para session/auth.
  - `lib/` com `supabase.ts`, `api.ts`, `types.ts`.
  - `assets/` com icones do Expo.
- Gerenciamento de estado: `useState` + `useEffect` por tela; sem estado global.
- Padroes de componentes: nao ha componentes compartilhados; estilos locais por tela.
- Navegacao: Expo Router com Stack + Tabs (Trilhas, Perfil); gate de autenticacao redireciona nao autenticados para `/(auth)/sign-in`.
- Comunicacao com backend: RPCs via `lib/api.ts`; locale padrao `pt-BR`.
- Tratamento de erros: mensagens simples e retry para telas de lista/detalhe.
- Regras de UI/UX: tema claro, layout simples; mensagens de bloqueio via `lockReason`; paywall para `subscription`; desafios renderizados por tipo, carregam melhor tentativa e exibem resposta do usuario com cores; resumo de progresso exibido na fase; login/cadastro simples.

## Decisoes Importantes
- Supabase e a unica plataforma backend.
- Logica de negocio no banco (RPC/Edge Functions); frontend apenas renderiza.
- Views para leituras simples; RPCs para logica e agregacoes.
- Expo Router (managed) como base de navegacao.
- Freemium: 2 blocos gratuitos por trilha; demais por assinatura.
- Pagamentos via Apple/Google (planejado).
- i18n via tabelas de traducao; locale padrao `pt-BR`.
- `newArchEnabled` esta `false` no Expo por estabilidade.
- Progresso:
  - Fase completa quando todos os desafios foram respondidos e >= 50% corretos.
  - Bloco completo quando todas as fases estao completas e o desafio final foi aprovado.
  - Progresso nao reverte.
- Desafios:
  - Melhor tentativa exibida ao reabrir a fase.
- Paywall:
  - Conteudo com `lockReason` = `subscription` abre tela de paywall.

## Pontos em Aberto
- Integracoes de assinatura e validacao de recibos.
- Admin panel para cadastro de trilhas/blocos/fases/desafios com filtros.
- Suporte a multiplos idiomas no app.
- Observabilidade, testes e analytics (DESCONHECIDO).
