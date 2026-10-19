CREATE TABLE public.future_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text,
  message text NOT NULL,
  deliver_at timestamptz NOT NULL,
  timezone text,
  email_status text NOT NULL DEFAULT 'not_sent' CHECK (email_status IN ('not_sent','sending','sent','failed')),
  email_sent_at timestamptz,
  email_attempts integer NOT NULL DEFAULT 0,
  email_last_error text,
  email_claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT future_letters_title_len CHECK (title IS NULL OR char_length(title) <= 120),
  CONSTRAINT future_letters_message_len CHECK (char_length(btrim(message)) BETWEEN 1 AND 5000)
);
CREATE INDEX future_letters_user_deliver_idx ON public.future_letters (user_id, deliver_at);
CREATE INDEX future_letters_due_email_idx ON public.future_letters (deliver_at) WHERE email_status IN ('not_sent','failed');

GRANT SELECT, INSERT, DELETE ON public.future_letters TO authenticated;
GRANT ALL ON public.future_letters TO service_role;

ALTER TABLE public.future_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "letters read own" ON public.future_letters FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "letters insert own" ON public.future_letters FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "letters delete own before delivery" ON public.future_letters FOR DELETE TO authenticated USING (auth.uid() = user_id AND deliver_at > now());

CREATE OR REPLACE FUNCTION public.future_letters_before_insert()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.deliver_at <= now() + interval '1 minute' THEN
    RAISE EXCEPTION 'Delivery time must be in the future';
  END IF;
  IF current_user = 'authenticated' THEN
    NEW.email_status := 'not_sent';
    NEW.email_sent_at := NULL;
    NEW.email_attempts := 0;
    NEW.email_last_error := NULL;
    NEW.email_claimed_at := NULL;
  END IF;
  NEW.title := NULLIF(btrim(NEW.title), '');
  NEW.created_at := now();
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER future_letters_before_insert BEFORE INSERT ON public.future_letters FOR EACH ROW EXECUTE FUNCTION public.future_letters_before_insert();

CREATE OR REPLACE FUNCTION public.future_letters_touch()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;
CREATE TRIGGER future_letters_touch BEFORE UPDATE ON public.future_letters FOR EACH ROW EXECUTE FUNCTION public.future_letters_touch();