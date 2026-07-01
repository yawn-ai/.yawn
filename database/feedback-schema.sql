create table if not exists feedback_items (
  feedback_id text primary key,
  received_at timestamptz not null,
  source text not null default 'email',
  raw_subject text,
  raw_body text not null,
  summary text,
  sentiment text,
  category text,
  affected_node text,
  suggested_next_move text,
  severity text default 'low',
  follow_up_allowed text default 'unknown',
  status text not null default 'raw',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists feedback_items_category_idx on feedback_items (category);
create index if not exists feedback_items_affected_node_idx on feedback_items (affected_node);
create index if not exists feedback_items_status_idx on feedback_items (status);
