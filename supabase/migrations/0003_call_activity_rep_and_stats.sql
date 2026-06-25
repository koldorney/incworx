-- Track which rep placed each call, and expose an all-time stats view.
-- Previously the app shoved the rep name into block_type, which is constrained
-- to 'A' | 'B' (the call group) — so every insert failed the check constraint
-- and no activity was ever saved. Give the rep its own column.

alter table public.call_activities add column if not exists rep text;
create index if not exists idx_call_activities_rep on public.call_activities(rep);
create index if not exists idx_call_activities_disposition on public.call_activities(disposition);

-- All-time per-rep tally. answer rate = connects / dials, set rate = meetings / dials.
-- A connect counts a live conversation: 'connected' or 'meeting_booked'.
create or replace view public.call_activity_stats as
select
  coalesce(rep, 'Unknown') as rep,
  count(*)::int as dials,
  count(*) filter (where disposition in ('connected','meeting_booked'))::int as connects,
  count(*) filter (where disposition = 'meeting_booked')::int as meetings,
  count(*) filter (where disposition = 'voicemail')::int as voicemails,
  count(*) filter (where disposition = 'email_sent')::int as emails
from public.call_activities
group by coalesce(rep, 'Unknown');
