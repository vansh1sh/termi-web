-- Real Termi control rooms are private Realtime channels named termi:<auth.uid()>.
-- The shared termi:demo room intentionally remains public and view-only in both clients.

drop policy if exists "termi users can receive own broadcasts" on realtime.messages;
create policy "termi users can receive own broadcasts"
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension = 'broadcast'
  and (select realtime.topic()) = 'termi:' || (select auth.uid())::text
);

drop policy if exists "termi users can send own broadcasts" on realtime.messages;
create policy "termi users can send own broadcasts"
on realtime.messages
for insert
to authenticated
with check (
  realtime.messages.extension = 'broadcast'
  and (select realtime.topic()) = 'termi:' || (select auth.uid())::text
);
