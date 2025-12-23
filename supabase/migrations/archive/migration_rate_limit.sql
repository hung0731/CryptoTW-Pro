-- Create table for storing rate limit counters
create table if not exists rate_limits (
  key text primary key,
  count int default 1,
  window_start timestamptz default now()
);

-- Index for potential cleanup
create index if not exists idx_rate_limits_window_start on rate_limits(window_start);

-- RPC function to atomically check and update rate limit
create or replace function check_rate_limit(
  rate_key text,
  max_requests int,
  window_seconds int
) returns boolean as $$
declare
  current_count int;
  valid_since timestamptz;
begin
  valid_since := now() - (window_seconds || ' seconds')::interval;

  insert into rate_limits (key, count, window_start)
  values (rate_key, 1, now())
  on conflict (key) do update
  set
    count = case
      when rate_limits.window_start < valid_since then 1
      else rate_limits.count + 1
    end,
    window_start = case
      when rate_limits.window_start < valid_since then now()
      else rate_limits.window_start
    end
  returning count into current_count;

  return current_count <= max_requests;
end;
$$ language plpgsql security definer;
