
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Organizations Table
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  subscription_plan text check (subscription_plan in ('basic', 'pro', 'enterprise')) default 'basic',
  max_users int default 5,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- 2. Organization Users (Replaces standard auth for Field Agents)
create table organization_users (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  auth_user_id uuid references auth.users(id), -- Link to Supabase Auth
  full_name text not null,
  phone_number text not null,
  pin_hash text not null, -- Store bcrypt hash
  role text check (role in ('admin', 'manager', 'field_agent', 'viewer')) default 'field_agent',
  created_at timestamp with time zone default now(),
  unique(organization_id, phone_number),
  unique(auth_user_id)
);

-- 3. Enable RLS
alter table organizations enable row level security;
alter table organization_users enable row level security;

-- 4. RLS Policies
create policy "Users can view their own organization"
on organizations for select
using (id = (select organization_id from organization_users where id = auth.uid()));

create policy "Users can view members of their organization"
on organization_users for select
using (organization_id = (select organization_id from organization_users where id = auth.uid()));

-- ==========================================
-- SYSTEM ROOT ARCHITECTURE (Backend Driven)
-- ==========================================

-- 5. Root Admins Table (The Source of Truth)
-- Only specific UUIDs from auth.users can be here.
create table root_admins (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) not null unique,
    pin_hash text not null, -- BCrypt hash of the 6-digit root PIN
    is_active boolean default true,
    last_login timestamp with time zone,
    created_at timestamp with time zone default now()
);

-- 6. Root Activity Logs (Immutable Audit Trail)
create table root_activity_logs (
    id uuid primary key default uuid_generate_v4(),
    root_admin_id uuid references root_admins(id),
    action_type text not null, -- 'SUSPEND_ORG', 'BAN_USER', 'CHANGE_PLAN'
    target_type text not null, -- 'organization', 'user', 'system'
    target_id text not null,
    payload jsonb, -- The data that was changed
    ip_address text,
    user_agent text,
    created_at timestamp with time zone default now()
);

-- 7. Secure Root RLS
alter table root_admins enable row level security;
alter table root_activity_logs enable row level security;

-- NO PUBLIC ACCESS POLICIES for root tables.
-- Access is only allowed via Service Role (Edge Functions).

-- 8. Indexing for Performance
create index idx_org_users_org_id on organization_users(organization_id);
create index idx_org_users_auth_user_id on organization_users(auth_user_id);
create index idx_root_logs_created_at on root_activity_logs(created_at desc);
