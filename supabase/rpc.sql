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
  'orderIndex', p.order_index,
  'challenges', (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'orderIndex', c.order_index,
          'type', c.type,
          'isFinal', c.is_final,
          'payload', coalesce(ct.payload, c.payload)
        )
        order by c.order_index
      ),
      '[]'::jsonb
    )
    from challenges c
    left join challenge_translations ct
      on ct.challenge_id = c.id
     and ct.locale = p_locale
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

grant execute on function rpc_get_trails(text) to anon, authenticated;
grant execute on function rpc_get_trail(uuid, text) to anon, authenticated;
grant execute on function rpc_get_block(uuid, text) to anon, authenticated;
grant execute on function rpc_get_phase(uuid, text) to anon, authenticated;

commit;
