
export enum UserRole {
  ADMIN = 'admin', // مدير الحملة
  MANAGER = 'manager', // منسق منطقة
  FIELD_AGENT = 'field_agent', // مندوب
  ANALYST = 'analyst', // محلل إحصائي
  VIEWER = 'viewer' // مراقب
}

export type SubscriptionPlan = 'basic' | 'pro' | 'enterprise';

export interface Organization {
  id: string;
  name: string;
  subscription_plan: SubscriptionPlan;
  max_users: number;
  is_active: boolean;
  storage_used_mb: number;
  ai_tokens_used: number;
  created_at?: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  full_name: string;
  phone_number: string;
  role: UserRole;
  pin_hash?: string; // In real app, never return this to frontend
  created_at?: string;
  is_banned?: boolean;
}

export interface SuperAdmin {
  id: string;
  full_name: string;
  pin_hash: string; // bcrypt hash
  last_login: string;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  action_type: 'LOGIN' | 'SUSPEND_ORG' | 'DELETE_USER' | 'CHANGE_PLAN' | 'SYSTEM_LOCK' | 'FEATURE_FLAG' | 'MAINTENANCE_MODE';
  target_id: string;
  details: string;
  ip_address: string;
  severity: 'info' | 'warning' | 'critical';
  created_at: string;
}

export interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  active_connections: number;
  api_latency_ms: number;
  error_rate: number;
  total_storage_gb: number;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  is_enabled: boolean;
  scope: 'global' | 'beta_users' | 'internal';
}

export interface FieldReport {
  id: string;
  organization_id: string;
  user_id: string;
  activity_type: 'تعداد أصوات' | 'خروقات' | 'استطلاع' | 'لوجستيات';
  metric_value: number;
  notes: string;
  latitude: number;
  longitude: number;
  created_at: string;
  status: 'pending' | 'verified' | 'rejected';
}

export interface Alert {
  id: string;
  organization_id: string;
  region_id: string;
  alert_type: 'انخفاض_تصويت' | 'مشاكل_أمنية' | 'نقص_مستلزمات';
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  created_at: string;
  message: string;
}

export interface ResourceLog {
  id: string;
  organization_id: string;
  resource_type: string;
  effort_units: number; // e.g., hours or count
  cost: number;
  result_metric: number;
  created_at: string;
}

export interface MessageVariant {
  id: string;
  organization_id: string;
  title: string;
  content: string;
  metrics: {
    impressions: number;
    interactions: number;
    conversions: number;
  };
}

export interface ScenarioResult {
  scenarioName: string;
  projectedCost: number;
  projectedImpact: number;
  riskScore: number;
  summary: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  isThinking?: boolean;
}

export interface Region {
  id: string;
  name: string;
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][]; // GeoJSON format: [lng, lat]
  };
  stats: {
    turnout: number; // percentage
    incidents: number;
  };
}

// --- WhatsApp Module Types ---

export interface WhatsAppAccount {
  id: string;
  organization_id: string;
  phone_number: string;
  name: string;
  status: 'connected' | 'disconnected';
  provider: 'meta' | 'twilio';
}

export interface WhatsAppLog {
  id: string;
  organization_id: string;
  sender_number: string;
  message_text: string;
  parsed_command: string | null;
  status: 'success' | 'failed' | 'pending';
  response_text: string;
  created_at: string;
}

export interface WhatsAppPoll {
  id: string;
  organization_id: string;
  title: string;
  options: string[];
  active: boolean;
  total_responses: number;
  results: { [option: string]: number };
  created_at: string;
}

export interface WhatsAppTemplate {
  id: string;
  organization_id: string;
  name: string;
  content: string;
  language: 'ar' | 'en';
  status: 'approved' | 'pending' | 'rejected';
  created_at: string;
}

// --- Electoral Intelligence Types ---

export interface LegalDeadline {
  id: string;
  title: string;
  due_date: string;
  category: 'candidacy' | 'finance' | 'media' | 'voting';
  status: 'pending' | 'completed' | 'overdue';
  description: string;
  is_urgent: boolean;
}

export interface FinancialRecord {
  id: string;
  organization_id: string;
  category: 'advertising' | 'logistics' | 'personnel' | 'events';
  amount_usd: number;
  date: string;
  description: string;
  compliant: boolean;
}

export interface ComplianceRule {
  id: string;
  rule_text: string;
  type: 'spending_limit' | 'prohibition' | 'requirement';
  details: string;
}
