-- Create deal watchlist table for investor favorites
CREATE TABLE public.deal_watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  deal_id uuid REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, deal_id)
);

-- Enable RLS
ALTER TABLE public.deal_watchlist ENABLE ROW LEVEL SECURITY;

-- Users can manage their own watchlist
CREATE POLICY "Users can view their own watchlist"
ON public.deal_watchlist
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their watchlist"
ON public.deal_watchlist
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their watchlist"
ON public.deal_watchlist
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all watchlists
CREATE POLICY "Admins can view all watchlists"
ON public.deal_watchlist
FOR SELECT
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create investor messages table
CREATE TABLE public.investor_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES public.deals(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);

-- Enable RLS
ALTER TABLE public.investor_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
CREATE POLICY "Users can view their messages"
ON public.investor_messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can send messages
CREATE POLICY "Users can send messages"
ON public.investor_messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Users can mark their received messages as read
CREATE POLICY "Users can update their received messages"
ON public.investor_messages
FOR UPDATE
USING (auth.uid() = recipient_id);

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
ON public.investor_messages
FOR SELECT
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create index for performance
CREATE INDEX idx_deal_watchlist_user_id ON public.deal_watchlist(user_id);
CREATE INDEX idx_deal_watchlist_deal_id ON public.deal_watchlist(deal_id);
CREATE INDEX idx_investor_messages_recipient ON public.investor_messages(recipient_id, read_at);
CREATE INDEX idx_investor_messages_deal ON public.investor_messages(deal_id);