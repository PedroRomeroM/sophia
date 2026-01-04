begin;

create or replace view v_trails_published as
select
  t.id,
  t.slug,
  t.title,
  t.objective,
  t.order_index
from trails t
where t.is_published = true;

create or replace view v_blocks_published as
select
  b.id,
  b.trail_id,
  b.title,
  b.description,
  b.order_index,
  b.is_free
from blocks b
join trails t on t.id = b.trail_id
where b.is_published = true
  and t.is_published = true;

create or replace view v_phases_published as
select
  p.id,
  p.block_id,
  p.title,
  p.description,
  p.order_index
from phases p
join blocks b on b.id = p.block_id
join trails t on t.id = b.trail_id
where p.is_published = true
  and b.is_published = true
  and t.is_published = true;

create or replace view v_challenges_published as
select
  c.id,
  c.phase_id,
  c.type,
  c.payload,
  c.order_index,
  c.is_final
from challenges c
join phases p on p.id = c.phase_id
join blocks b on b.id = p.block_id
join trails t on t.id = b.trail_id
where c.is_published = true
  and p.is_published = true
  and b.is_published = true
  and t.is_published = true;

create or replace view v_readings_published as
select
  r.id,
  r.block_id,
  r.title,
  r.author,
  r.url,
  r.notes,
  r.order_index
from readings r
join blocks b on b.id = r.block_id
join trails t on t.id = b.trail_id
where b.is_published = true
  and t.is_published = true;

grant select on v_trails_published to anon, authenticated;
grant select on v_blocks_published to anon, authenticated;
grant select on v_phases_published to anon, authenticated;
grant select on v_challenges_published to anon, authenticated;
grant select on v_readings_published to anon, authenticated;

commit;
