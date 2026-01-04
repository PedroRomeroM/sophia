begin;

create or replace function rpc_get_trails(p_locale text default 'pt-BR')
returns jsonb
language sql
stable
as $$
with ent as (
  select exists (
    select 1
    from entitlements e
    where e.user_id = auth.uid()
      and e.status = 'active'
      and (e.expires_at is null or e.expires_at > now())
  ) as has_access
),
trail_rows as (
  select
    t.id,
    t.slug,
    t.order_index,
    coalesce(tt.title, t.title) as title,
    coalesce(tt.objective, t.objective) as objective
  from trails t
  left join trail_translations tt
    on tt.trail_id = t.id
   and tt.locale = p_locale
  where t.is_published = true
),
block_rows as (
  select
    b.id,
    b.trail_id,
    b.order_index,
    b.is_free,
    coalesce(bt.title, b.title) as title,
    coalesce(bt.description, b.description) as description
  from blocks b
  left join block_translations bt
    on bt.block_id = b.id
   and bt.locale = p_locale
  where b.is_published = true
)
select coalesce(
  jsonb_agg(
    jsonb_build_object(
      'id', t.id,
      'slug', t.slug,
      'title', t.title,
      'objective', t.objective,
      'orderIndex', t.order_index,
      'blocks', (
        select coalesce(
          jsonb_agg(
            jsonb_build_object(
              'id', b.id,
              'orderIndex', b.order_index,
              'title', b.title,
              'description', b.description,
              'isFree', b.is_free,
              'hasAccess', (b.is_free or ent.has_access),
              'isUnlocked', (b.is_free or ent.has_access) and (
                b.order_index = 1 or prev.prev_completed
              ),
              'status', (
                case
                  when bp.status is not null then bp.status::text
                  when (b.is_free or ent.has_access)
                    and (b.order_index = 1 or prev.prev_completed)
                    then 'in_progress'
                  else 'locked'
                end
              ),
              'lockReason', (
                case
                  when (b.is_free or ent.has_access) then
                    case
                      when b.order_index > 1 and not prev.prev_completed then 'previous_block'
                      else null
                    end
                  else 'subscription'
                end
              )
            )
            order by b.order_index
          ),
          '[]'::jsonb
        )
        from block_rows b
        left join lateral (
          select bp.status
          from block_progress bp
          where bp.user_id = auth.uid()
            and bp.block_id = b.id
          limit 1
        ) bp on true
        left join lateral (
          select exists (
            select 1
            from blocks bprev
            join block_progress bpp
              on bpp.block_id = bprev.id
             and bpp.user_id = auth.uid()
            where bprev.trail_id = b.trail_id
              and bprev.order_index = b.order_index - 1
              and bpp.status = 'completed'
          ) as prev_completed
        ) prev on true
        where b.trail_id = t.id
      )
    )
    order by t.order_index
  ),
  '[]'::jsonb
)
from trail_rows t
cross join ent;
$$;

create or replace function rpc_get_trail(p_trail_id uuid, p_locale text default 'pt-BR')
returns jsonb
language sql
stable
as $$
with ent as (
  select exists (
    select 1
    from entitlements e
    where e.user_id = auth.uid()
      and e.status = 'active'
      and (e.expires_at is null or e.expires_at > now())
  ) as has_access
),
trail_row as (
  select
    t.id,
    t.slug,
    t.order_index,
    coalesce(tt.title, t.title) as title,
    coalesce(tt.objective, t.objective) as objective
  from trails t
  left join trail_translations tt
    on tt.trail_id = t.id
   and tt.locale = p_locale
  where t.is_published = true
    and t.id = p_trail_id
),
block_rows as (
  select
    b.id,
    b.trail_id,
    b.order_index,
    b.is_free,
    coalesce(bt.title, b.title) as title,
    coalesce(bt.description, b.description) as description
  from blocks b
  left join block_translations bt
    on bt.block_id = b.id
   and bt.locale = p_locale
  where b.is_published = true
)
select jsonb_build_object(
  'id', t.id,
  'slug', t.slug,
  'title', t.title,
  'objective', t.objective,
  'orderIndex', t.order_index,
  'blocks', (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', b.id,
          'orderIndex', b.order_index,
          'title', b.title,
          'description', b.description,
          'isFree', b.is_free,
          'hasAccess', (b.is_free or ent.has_access),
          'isUnlocked', (b.is_free or ent.has_access) and (
            b.order_index = 1 or prev.prev_completed
          ),
          'status', (
            case
              when bp.status is not null then bp.status::text
              when (b.is_free or ent.has_access)
                and (b.order_index = 1 or prev.prev_completed)
                then 'in_progress'
              else 'locked'
            end
          ),
          'lockReason', (
            case
              when (b.is_free or ent.has_access) then
                case
                  when b.order_index > 1 and not prev.prev_completed then 'previous_block'
                  else null
                end
              else 'subscription'
            end
          )
        )
        order by b.order_index
      ),
      '[]'::jsonb
    )
    from block_rows b
    left join lateral (
      select bp.status
      from block_progress bp
      where bp.user_id = auth.uid()
        and bp.block_id = b.id
      limit 1
    ) bp on true
    left join lateral (
      select exists (
        select 1
        from blocks bprev
        join block_progress bpp
          on bpp.block_id = bprev.id
         and bpp.user_id = auth.uid()
        where bprev.trail_id = b.trail_id
          and bprev.order_index = b.order_index - 1
          and bpp.status = 'completed'
      ) as prev_completed
    ) prev on true
    where b.trail_id = t.id
  )
)
from trail_row t
cross join ent;
$$;

create or replace function rpc_get_block(p_block_id uuid, p_locale text default 'pt-BR')
returns jsonb
language sql
stable
as $$
with ent as (
  select exists (
    select 1
    from entitlements e
    where e.user_id = auth.uid()
      and e.status = 'active'
      and (e.expires_at is null or e.expires_at > now())
  ) as has_access
),
block_row as (
  select
    b.id,
    b.trail_id,
    b.order_index,
    b.is_free,
    coalesce(bt.title, b.title) as title,
    coalesce(bt.description, b.description) as description
  from blocks b
  left join block_translations bt
    on bt.block_id = b.id
   and bt.locale = p_locale
  where b.is_published = true
    and b.id = p_block_id
),
block_status as (
  select
    br.*,
    ent.has_access,
    prev.prev_completed,
    (br.is_free or ent.has_access) and (br.order_index = 1 or prev.prev_completed) as is_unlocked,
    case
      when bp.status is not null then bp.status::text
      when (br.is_free or ent.has_access) and (br.order_index = 1 or prev.prev_completed)
        then 'in_progress'
      else 'locked'
    end as status
  from block_row br
  cross join ent
  left join lateral (
    select bp.status
    from block_progress bp
    where bp.user_id = auth.uid()
      and bp.block_id = br.id
    limit 1
  ) bp on true
  left join lateral (
    select exists (
      select 1
      from blocks bprev
      join block_progress bpp
        on bpp.block_id = bprev.id
       and bpp.user_id = auth.uid()
      where bprev.trail_id = br.trail_id
        and bprev.order_index = br.order_index - 1
        and bpp.status = 'completed'
    ) as prev_completed
  ) prev on true
)
select jsonb_build_object(
  'id', bs.id,
  'trailId', bs.trail_id,
  'title', bs.title,
  'description', bs.description,
  'orderIndex', bs.order_index,
  'isFree', bs.is_free,
  'hasAccess', (bs.is_free or bs.has_access),
  'isUnlocked', bs.is_unlocked,
  'status', bs.status,
  'lockReason', (
    case
      when (bs.is_free or bs.has_access) then
        case
          when bs.order_index > 1 and not bs.prev_completed then 'previous_block'
          else null
        end
      else 'subscription'
    end
  ),
  'phases', (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'orderIndex', p.order_index,
          'title', coalesce(pt.title, p.title),
          'description', coalesce(pt.description, p.description),
          'phaseType', p.phase_type,
          'isUnlocked', bs.is_unlocked and (p.order_index = 1 or prev.prev_completed),
          'status', (
            case
              when pp.status is not null then pp.status::text
              when bs.is_unlocked and (p.order_index = 1 or prev.prev_completed)
                then 'in_progress'
              else 'locked'
            end
          ),
          'lockReason', (
            case
              when not bs.is_unlocked then
                case
                  when (bs.is_free or bs.has_access) then 'previous_block'
                  else 'subscription'
                end
              when p.order_index > 1 and not prev.prev_completed then 'previous_phase'
              else null
            end
          )
        )
        order by p.order_index
      ),
      '[]'::jsonb
    )
    from phases p
    left join phase_translations pt
      on pt.phase_id = p.id
     and pt.locale = p_locale
    left join lateral (
      select pp.status
      from phase_progress pp
      where pp.user_id = auth.uid()
        and pp.phase_id = p.id
      limit 1
    ) pp on true
    left join lateral (
      select exists (
        select 1
        from phases pprev
        join phase_progress ppp
          on ppp.phase_id = pprev.id
         and ppp.user_id = auth.uid()
        where pprev.block_id = p.block_id
          and pprev.order_index = p.order_index - 1
          and ppp.status = 'completed'
      ) as prev_completed
    ) prev on true
    where p.block_id = bs.id
      and p.is_published = true
  ),
  'readings', (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', r.id,
          'orderIndex', r.order_index,
          'title', coalesce(rt.title, r.title),
          'author', r.author,
          'url', r.url,
          'notes', coalesce(rt.notes, r.notes)
        )
        order by r.order_index
      ),
      '[]'::jsonb
    )
    from readings r
    left join reading_translations rt
      on rt.reading_id = r.id
     and rt.locale = p_locale
    where r.block_id = bs.id
  )
)
from block_status bs;
$$;

create or replace function rpc_get_phase(p_phase_id uuid, p_locale text default 'pt-BR')
returns jsonb
language sql
stable
as $$
select jsonb_build_object(
  'id', p.id,
  'blockId', p.block_id,
  'title', coalesce(pt.title, p.title),
  'description', coalesce(pt.description, p.description),
  'phaseType', p.phase_type,
  'orderIndex', p.order_index,
  'challenges', (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'orderIndex', c.order_index,
          'type', c.type,
          'isFinal', c.is_final,
          'payload', coalesce(ct.payload, c.payload),
          'bestAttempt', (
            case
              when best_attempt.answers is null then null
              else jsonb_build_object(
                'answers', best_attempt.answers,
                'result', best_attempt.result,
                'score', best_attempt.score,
                'createdAt', best_attempt.created_at
              )
            end
          )
        )
        order by c.order_index
      ),
      '[]'::jsonb
    )
    from challenges c
    left join challenge_translations ct
      on ct.challenge_id = c.id
     and ct.locale = p_locale
    left join lateral (
      select
        ca.answers,
        ca.result,
        ca.created_at,
        case
          when c.type = 'quiz' then
            case
              when (ca.answers->>'choiceIndex')::int = (c.payload->>'answer_index')::int then 100
              else 0
            end
          when c.type = 'true_false' then
            case
              when (ca.answers->>'answer')::boolean = (c.payload->>'answer')::boolean then 100
              else 0
            end
          when c.type = 'match' then
            case
              when jsonb_typeof(ca.answers->'pairs') = 'array'
               and jsonb_typeof(c.payload->'pairs') = 'array'
               and jsonb_array_length(c.payload->'pairs') > 0
              then
                floor((
                  select count(*)
                  from jsonb_array_elements(c.payload->'pairs') as exp(pair)
                  where exists (
                    select 1
                    from jsonb_array_elements(ca.answers->'pairs') as ans(pair)
                    where ans.pair->>'left' = exp.pair->>'left'
                      and ans.pair->>'right' = exp.pair->>'right'
                  )
                )::numeric / jsonb_array_length(c.payload->'pairs')::numeric * 100)
              else 0
            end
          else 0
        end as score
      from challenge_attempts ca
      where ca.user_id = auth.uid()
        and ca.challenge_id = c.id
      order by score desc, ca.created_at desc
      limit 1
    ) best_attempt on true
    where c.phase_id = p.id
      and c.is_published = true
  )
)
from phases p
left join phase_translations pt
  on pt.phase_id = p.id
 and pt.locale = p_locale
where p.id = p_phase_id
  and p.is_published = true;
$$;

create or replace function rpc_get_next_block(p_block_id uuid, p_locale text default 'pt-BR')
returns jsonb
language sql
stable
as $$
with ent as (
  select exists (
    select 1
    from entitlements e
    where e.user_id = auth.uid()
      and e.status = 'active'
      and (e.expires_at is null or e.expires_at > now())
  ) as has_access
),
current_block as (
  select b.trail_id, b.order_index
  from blocks b
  where b.id = p_block_id
    and b.is_published = true
),
next_block as (
  select
    b.id,
    b.trail_id,
    b.order_index,
    b.is_free,
    coalesce(bt.title, b.title) as title,
    coalesce(bt.description, b.description) as description
  from blocks b
  join current_block cb on cb.trail_id = b.trail_id
  left join block_translations bt
    on bt.block_id = b.id
   and bt.locale = p_locale
  where b.is_published = true
    and b.order_index > cb.order_index
  order by b.order_index
  limit 1
),
next_status as (
  select
    nb.*,
    ent.has_access,
    case
      when nb.order_index = 1 then true
      else exists (
        select 1
        from blocks bprev
        join block_progress bp
          on bp.block_id = bprev.id
         and bp.user_id = auth.uid()
        where bprev.trail_id = nb.trail_id
          and bprev.order_index = nb.order_index - 1
          and bp.status = 'completed'
      )
    end as prev_completed
  from next_block nb
  cross join ent
)
select (
  select jsonb_build_object(
    'id', ns.id,
    'trailId', ns.trail_id,
    'orderIndex', ns.order_index,
    'title', ns.title,
    'description', ns.description,
    'isFree', ns.is_free,
    'hasAccess', (ns.is_free or ns.has_access),
    'isUnlocked', (ns.is_free or ns.has_access) and ns.prev_completed,
    'status', (
      case
        when bp.status is not null then bp.status::text
        when (ns.is_free or ns.has_access) and ns.prev_completed
          then 'in_progress'
        else 'locked'
      end
    ),
    'lockReason', (
      case
        when (ns.is_free or ns.has_access) then
          case
            when ns.order_index > 1 and not ns.prev_completed then 'previous_block'
            else null
          end
        else 'subscription'
      end
    )
  )
  from next_status ns
  left join lateral (
    select bp.status
    from block_progress bp
    where bp.user_id = auth.uid()
      and bp.block_id = ns.id
    limit 1
  ) bp on true
);
$$;

create or replace function rpc_debug_grant_entitlement()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  insert into entitlements (user_id, provider, product_id, status, expires_at, raw_receipt)
  values (
    v_user_id,
    'debug',
    'premium',
    'active',
    null,
    jsonb_build_object('source', 'debug', 'createdAt', now())
  )
  on conflict (user_id, provider, product_id) do update
    set status = 'active',
        expires_at = null,
        raw_receipt = excluded.raw_receipt;

  return jsonb_build_object(
    'status', 'active',
    'provider', 'debug',
    'productId', 'premium'
  );
end;
$$;

create or replace function rpc_debug_reset_account()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_attempts int := 0;
  v_phase int := 0;
  v_block int := 0;
  v_ent int := 0;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  delete from challenge_attempts where user_id = v_user_id;
  get diagnostics v_attempts = row_count;

  delete from phase_progress where user_id = v_user_id;
  get diagnostics v_phase = row_count;

  delete from block_progress where user_id = v_user_id;
  get diagnostics v_block = row_count;

  delete from entitlements where user_id = v_user_id;
  get diagnostics v_ent = row_count;

  return jsonb_build_object(
    'attemptsDeleted', v_attempts,
    'phaseProgressDeleted', v_phase,
    'blockProgressDeleted', v_block,
    'entitlementsDeleted', v_ent
  );
end;
$$;

create or replace function rpc_submit_challenge_attempt(
  p_challenge_id uuid,
  p_answers jsonb
)
returns jsonb
language plpgsql
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge_id uuid;
  v_challenge_type challenge_type;
  v_payload jsonb;
  v_phase_id uuid;
  v_block_id uuid;
  v_trail_id uuid;
  v_block_order int;
  v_phase_order int;
  v_is_free boolean;
  v_has_entitlement boolean;
  v_prev_block_completed boolean;
  v_prev_phase_completed boolean;
  v_block_unlocked boolean;
  v_phase_unlocked boolean;
  v_attempt_score int := 0;
  v_min_score int := 100;
  v_result boolean := false;
  v_expected_pairs int := 0;
  v_matched_pairs int := 0;
  v_total_challenges int := 0;
  v_answered_challenges int := 0;
  v_correct_challenges int := 0;
  v_phase_status progress_status;
  v_phase_completed boolean := false;
  v_total_phases int := 0;
  v_completed_phases int := 0;
  v_final_total int := 0;
  v_final_passed int := 0;
  v_block_status progress_status;
  v_block_completed boolean := false;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select
    c.id,
    c.type,
    c.payload,
    c.phase_id,
    p.block_id,
    b.trail_id,
    b.order_index,
    p.order_index,
    b.is_free
  into
    v_challenge_id,
    v_challenge_type,
    v_payload,
    v_phase_id,
    v_block_id,
    v_trail_id,
    v_block_order,
    v_phase_order,
    v_is_free
  from challenges c
  join phases p on p.id = c.phase_id
  join blocks b on b.id = p.block_id
  join trails t on t.id = b.trail_id
  where c.id = p_challenge_id
    and c.is_published = true
    and p.is_published = true
    and b.is_published = true
    and t.is_published = true;

  if not found then
    raise exception 'challenge_not_available';
  end if;

  select exists (
    select 1
    from entitlements e
    where e.user_id = v_user_id
      and e.status = 'active'
      and (e.expires_at is null or e.expires_at > now())
  ) into v_has_entitlement;

  v_has_entitlement := v_is_free or v_has_entitlement;

  if v_block_order = 1 then
    v_prev_block_completed := true;
  else
    select exists (
      select 1
      from blocks bprev
      join block_progress bp
        on bp.block_id = bprev.id
       and bp.user_id = v_user_id
      where bprev.trail_id = v_trail_id
        and bprev.order_index = v_block_order - 1
        and bp.status = 'completed'
    ) into v_prev_block_completed;
  end if;

  v_block_unlocked := v_has_entitlement and v_prev_block_completed;

  if v_phase_order = 1 then
    v_prev_phase_completed := true;
  else
    select exists (
      select 1
      from phases pprev
      join phase_progress pp
        on pp.phase_id = pprev.id
       and pp.user_id = v_user_id
      where pprev.block_id = v_block_id
        and pprev.order_index = v_phase_order - 1
        and pp.status = 'completed'
    ) into v_prev_phase_completed;
  end if;

  v_phase_unlocked := v_block_unlocked and v_prev_phase_completed;

  if not v_phase_unlocked then
    raise exception 'phase_locked';
  end if;

  v_min_score := coalesce((v_payload->>'min_score')::int, 100);

  if v_challenge_type = 'quiz' then
    if p_answers ? 'choiceIndex' then
      if (p_answers->>'choiceIndex')::int = (v_payload->>'answer_index')::int then
        v_attempt_score := 100;
      end if;
    end if;
  elsif v_challenge_type = 'true_false' then
    if p_answers ? 'answer' then
      if (p_answers->>'answer')::boolean = (v_payload->>'answer')::boolean then
        v_attempt_score := 100;
      end if;
    end if;
  elsif v_challenge_type = 'match' then
    if jsonb_typeof(p_answers->'pairs') = 'array' and jsonb_typeof(v_payload->'pairs') = 'array' then
      v_expected_pairs := jsonb_array_length(v_payload->'pairs');
      if v_expected_pairs > 0 then
        select count(*)
        into v_matched_pairs
        from jsonb_array_elements(v_payload->'pairs') as exp(pair)
        where exists (
          select 1
          from jsonb_array_elements(p_answers->'pairs') as ans(pair)
          where ans.pair->>'left' = exp.pair->>'left'
            and ans.pair->>'right' = exp.pair->>'right'
        );
        v_attempt_score := floor((v_matched_pairs::numeric / v_expected_pairs::numeric) * 100);
      end if;
    end if;
  end if;

  v_result := v_attempt_score >= v_min_score;

  insert into challenge_attempts (user_id, challenge_id, result, answers)
  values (v_user_id, v_challenge_id, v_result, p_answers);

  select count(*)
  into v_total_challenges
  from challenges c
  where c.phase_id = v_phase_id
    and c.is_published = true;

  select count(distinct ca.challenge_id)
  into v_answered_challenges
  from challenge_attempts ca
  join challenges c on c.id = ca.challenge_id
  where ca.user_id = v_user_id
    and c.phase_id = v_phase_id
    and c.is_published = true;

  select count(distinct ca.challenge_id)
  into v_correct_challenges
  from challenge_attempts ca
  join challenges c on c.id = ca.challenge_id
  where ca.user_id = v_user_id
    and c.phase_id = v_phase_id
    and c.is_published = true
    and ca.result = true;

  if v_total_challenges > 0
     and v_answered_challenges = v_total_challenges
     and v_correct_challenges * 2 >= v_total_challenges then
    v_phase_status := 'completed';
    v_phase_completed := true;
  else
    v_phase_status := 'in_progress';
    v_phase_completed := false;
  end if;

  insert into phase_progress (user_id, phase_id, status, score, attempts, last_attempt_at)
  values (
    v_user_id,
    v_phase_id,
    v_phase_status,
    case
      when v_total_challenges > 0 then floor((v_correct_challenges::numeric / v_total_challenges::numeric) * 100)
      else 0
    end,
    1,
    now()
  )
  on conflict (user_id, phase_id) do update
    set status = case
      when phase_progress.status = 'completed' then 'completed'
      else excluded.status
    end,
    score = excluded.score,
    attempts = phase_progress.attempts + 1,
    last_attempt_at = excluded.last_attempt_at;

  select count(*)
  into v_total_phases
  from phases p
  where p.block_id = v_block_id
    and p.is_published = true;

  select count(*)
  into v_completed_phases
  from phase_progress pp
  join phases p on p.id = pp.phase_id
  where pp.user_id = v_user_id
    and p.block_id = v_block_id
    and p.is_published = true
    and pp.status = 'completed';

  select count(*)
  into v_final_total
  from challenges c
  join phases p on p.id = c.phase_id
  where p.block_id = v_block_id
    and p.phase_type = 'review'
    and c.is_published = true
    and c.is_final = true;

  select count(*)
  into v_final_passed
  from (
    select c.id,
           max(case when ca.result then 1 else 0 end) as has_pass
    from challenges c
    join phases p on p.id = c.phase_id
    left join challenge_attempts ca
      on ca.challenge_id = c.id
     and ca.user_id = v_user_id
    where p.block_id = v_block_id
      and p.phase_type = 'review'
      and c.is_published = true
      and c.is_final = true
    group by c.id
  ) final_checks
  where final_checks.has_pass = 1;

  if v_total_phases > 0
     and v_completed_phases = v_total_phases
     and v_final_total > 0
     and v_final_passed = v_final_total then
    v_block_status := 'completed';
    v_block_completed := true;
  elsif v_block_unlocked then
    v_block_status := 'in_progress';
    v_block_completed := false;
  else
    v_block_status := 'locked';
    v_block_completed := false;
  end if;

  insert into block_progress (user_id, block_id, status, passed_final_at)
  values (
    v_user_id,
    v_block_id,
    v_block_status,
    case when v_block_completed then now() else null end
  )
  on conflict (user_id, block_id) do update
    set status = case
      when block_progress.status = 'completed' then 'completed'
      else excluded.status
    end,
    passed_final_at = case
      when block_progress.status = 'completed' then block_progress.passed_final_at
      else excluded.passed_final_at
    end;

  return jsonb_build_object(
    'result', v_result,
    'score', v_attempt_score,
    'phaseStatus', (select status::text from phase_progress where user_id = v_user_id and phase_id = v_phase_id),
    'phaseCompleted', (select status from phase_progress where user_id = v_user_id and phase_id = v_phase_id) = 'completed',
    'blockStatus', (select status::text from block_progress where user_id = v_user_id and block_id = v_block_id),
    'blockCompleted', (select status from block_progress where user_id = v_user_id and block_id = v_block_id) = 'completed',
    'correctCount', v_correct_challenges,
    'totalChallenges', v_total_challenges
  );
end;
$$;

grant execute on function rpc_get_trails(text) to anon, authenticated;
grant execute on function rpc_get_trail(uuid, text) to anon, authenticated;
grant execute on function rpc_get_block(uuid, text) to anon, authenticated;
grant execute on function rpc_get_phase(uuid, text) to anon, authenticated;
grant execute on function rpc_get_next_block(uuid, text) to authenticated;
grant execute on function rpc_debug_grant_entitlement() to authenticated;
grant execute on function rpc_debug_reset_account() to authenticated;
grant execute on function rpc_submit_challenge_attempt(uuid, jsonb) to authenticated;

commit;
