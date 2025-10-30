-- Enable secure deletion of individual chat messages
-- RLS already enabled on conversation_messages; add DELETE policies

-- Drop existing policies if they exist
drop policy if exists "Users can delete their own messages" on public.conversation_messages;
drop policy if exists "Brokers and admins can delete messages" on public.conversation_messages;

-- Create new DELETE policies
create policy "Users can delete their own messages"
on public.conversation_messages
for delete
using (sender_id = auth.uid());

create policy "Brokers and admins can delete messages"
on public.conversation_messages
for delete
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('admin','super_admin','editor')
  )
);
