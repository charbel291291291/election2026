
import { Alert, FieldReport, MessageVariant, ResourceLog, UserRole, Profile, Region, WhatsAppAccount, WhatsAppLog, WhatsAppPoll, WhatsAppTemplate, LegalDeadline, FinancialRecord, ComplianceRule, Organization, SuperAdmin, AdminLog, SystemMetrics, FeatureFlag } from './types';

// Mock Hash for '9696' (In real app, use bcrypt)
const MOCK_PIN_HASH = '9696'; 

export const MOCK_SUPER_ADMIN: SuperAdmin = {
  id: 'root-001',
  full_name: 'System Root',
  pin_hash: MOCK_PIN_HASH,
  last_login: new Date().toISOString()
};

export const MOCK_ADMIN_LOGS: AdminLog[] = [
  {
    id: 'log-001',
    admin_id: 'root-001',
    action_type: 'LOGIN',
    target_id: 'system',
    details: 'Initial system boot',
    ip_address: '127.0.0.1',
    severity: 'info',
    created_at: new Date(Date.now() - 1000000).toISOString()
  }
];

export const MOCK_SYSTEM_METRICS: SystemMetrics = {
    cpu_usage: 42,
    memory_usage: 65,
    active_connections: 1240,
    api_latency_ms: 120,
    error_rate: 0.05,
    total_storage_gb: 450
};

export const MOCK_FEATURE_FLAGS: FeatureFlag[] = [
    { id: 'ff-1', key: 'ai_module', name: 'AI Intelligence Engine', description: 'Enable Gemini AI features globally', is_enabled: true, scope: 'global' },
    { id: 'ff-2', key: 'whatsapp_integration', name: 'WhatsApp API Connector', description: 'Allow Meta Cloud API connections', is_enabled: true, scope: 'global' },
    { id: 'ff-3', key: 'beta_3d_map', name: '3D Map Visualization', description: 'Experimental WebGL Map', is_enabled: false, scope: 'beta_users' },
    { id: 'ff-4', key: 'offline_sync_v2', name: 'Offline Sync V2', description: 'Enhanced conflict resolution', is_enabled: true, scope: 'internal' },
];

export const MOCK_ORGANIZATION: Organization = {
  id: 'org-1',
  name: 'حملة التغيير - لبنان ٢٠٢٦',
  subscription_plan: 'enterprise',
  max_users: 100,
  is_active: true,
  storage_used_mb: 1024,
  ai_tokens_used: 540000,
  created_at: '2024-01-01T00:00:00Z'
};

export const MOCK_USERS: Profile[] = [
  {
    id: 'user-master',
    organization_id: 'org-1',
    full_name: 'Super Admin',
    role: UserRole.ADMIN,
    phone_number: '70126177',
    pin_hash: '969696',
    is_banned: false
  },
  {
    id: 'user-123',
    organization_id: 'org-1',
    full_name: 'شربل خوري',
    role: UserRole.ADMIN,
    phone_number: '70123456',
    pin_hash: '1234', // Mock hash
    is_banned: false
  },
  {
    id: 'user-456',
    organization_id: 'org-1',
    full_name: 'فاطمة الحسن',
    role: UserRole.FIELD_AGENT,
    phone_number: '03123456',
    pin_hash: '0000',
    is_banned: false
  },
  {
    id: 'user-789',
    organization_id: 'org-1',
    full_name: 'جورج صليبا',
    role: UserRole.MANAGER,
    phone_number: '71654321',
    pin_hash: '1111',
    is_banned: false
  }
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'a1',
    organization_id: 'org-1',
    region_id: 'beirut',
    alert_type: 'انخفاض_تصويت',
    severity: 'high',
    resolved: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    message: 'نسبة الاقتراع في الأشرفية أقل من المتوقع بـ ٢٠٪.'
  },
  {
    id: 'a2',
    organization_id: 'org-1',
    region_id: 'south',
    alert_type: 'مشاكل_أمنية',
    severity: 'critical',
    resolved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    message: 'تدافع أمام قلم الاقتراع في صيدا - الوسط.'
  }
];

export const MOCK_REPORTS: FieldReport[] = [
  {
    id: 'r1',
    organization_id: 'org-1',
    user_id: 'user-456',
    activity_type: 'استطلاع',
    metric_value: 85,
    notes: 'الماكينة الانتخابية تعمل بكامل طاقتها في المتن الشمالي.',
    latitude: 33.9167,
    longitude: 35.5667,
    created_at: new Date().toISOString(),
    status: 'verified'
  },
  {
    id: 'r2',
    organization_id: 'org-1',
    user_id: 'user-789',
    activity_type: 'خروقات',
    metric_value: 10,
    notes: 'رصد رشاوى انتخابية قرب المركز.',
    latitude: 33.8938,
    longitude: 35.5018,
    created_at: new Date().toISOString(),
    status: 'pending'
  }
];

export const MOCK_MESSAGES: MessageVariant[] = [
  {
    id: 'm1',
    organization_id: 'org-1',
    title: 'رسالة الحشد الصباحية',
    content: 'صباح الوطن! صوتك هو التغيير. مراكز الاقتراع مفتوحة. لا تتردد، لبنان بحاجة إلك.',
    metrics: { impressions: 12000, interactions: 4500, conversions: 3200 }
  }
];

export const MOCK_RESOURCES: ResourceLog[] = [
  { id: 'res1', organization_id: 'org-1', resource_type: 'نقل (فانات)', effort_units: 50, cost: 2500, result_metric: 80, created_at: '2026-05-15' },
  { id: 'res2', organization_id: 'org-1', resource_type: 'طعام (مندوبين)', effort_units: 1200, cost: 4500, result_metric: 95, created_at: '2026-05-15' },
];

export const MOCK_REGIONS: Region[] = [
  {
    id: 'beirut',
    name: 'دائرة بيروت الأولى (الأشرفية - الصيفي)',
    stats: { turnout: 35, incidents: 5 },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [35.49, 33.87], [35.53, 33.87], [35.53, 33.90], [35.49, 33.90], [35.49, 33.87]
      ]]
    }
  },
  {
    id: 'metn',
    name: 'دائرة جبل لبنان الثانية (المتن)',
    stats: { turnout: 55, incidents: 1 },
    geometry: {
        type: "Polygon",
        coordinates: [[
          [35.54, 33.85], [35.65, 33.85], [35.65, 33.95], [35.54, 33.95], [35.54, 33.85]
        ]]
    }
  },
  {
    id: 'south',
    name: 'دائرة الجنوب الأولى (صيدا - جزين)',
    stats: { turnout: 62, incidents: 8 },
    geometry: {
        type: "Polygon",
        coordinates: [[
          [35.33, 33.52], [35.42, 33.52], [35.42, 33.59], [35.33, 33.59], [35.33, 33.52]
        ]]
    }
  },
   {
    id: 'zahle',
    name: 'دائرة البقاع الأولى (زحلة)',
    stats: { turnout: 48, incidents: 3 },
    geometry: {
        type: "Polygon",
        coordinates: [[
          [35.85, 33.80], [35.95, 33.80], [35.95, 33.90], [35.85, 33.90], [35.85, 33.80]
        ]]
    }
  }
];

export const MOCK_WHATSAPP_ACCOUNTS: WhatsAppAccount[] = [
  { id: 'wa-1', organization_id: 'org-1', phone_number: '+961 3 123456', name: 'الخط الساخن المركزي', status: 'connected', provider: 'meta' }
];

export const MOCK_WHATSAPP_LOGS: WhatsAppLog[] = [
  { id: 'wl-1', organization_id: 'org-1', sender_number: '+961 70 998877', message_text: 'REPORT Beirut 40 2', parsed_command: 'FIELD_REPORT', status: 'success', response_text: 'تم تسجيل التقرير لبيروت: نسبة ٤٠٪، ٢ حوادث.', created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
];

export const MOCK_WHATSAPP_POLLS: WhatsAppPoll[] = [
  { 
    id: 'wp-1', 
    organization_id: 'org-1', 
    title: 'هل تم تأمين المواصلات لكافة المندوبين؟', 
    options: ['نعم، بالكامل', 'جزئياً', 'لا، يوجد نقص'], 
    active: true, 
    total_responses: 450, 
    results: { 'نعم، بالكامل': 320, 'جزئياً': 80, 'لا، يوجد نقص': 50 }, 
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() 
  }
];

export const MOCK_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tpl-1',
    organization_id: 'org-1',
    name: 'تذكير يوم الانتخاب',
    content: 'مرحباً {{1}}، نذكرك بأن يوم الانتخاب هو غداً. مركز الاقتراع الخاص بك هو {{2}}. شكراً لدعمك.',
    language: 'ar',
    status: 'approved',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  }
];

export const MOCK_DEADLINES: LegalDeadline[] = [
  { id: 'd1', title: 'إغلاق باب الترشح', due_date: '2026-03-15', category: 'candidacy', status: 'completed', description: 'الموعد النهائي لتقديم طلبات الترشح في وزارة الداخلية.', is_urgent: false },
];

export const MOCK_FINANCE_RECORDS: FinancialRecord[] = [
  { id: 'f1', organization_id: 'org-1', category: 'advertising', amount_usd: 15000, date: '2026-03-01', description: 'حملة إعلانية على الطرقات (Billboards)', compliant: true },
];

export const MOCK_COMPLIANCE_RULES: ComplianceRule[] = [
  { id: 'cr1', rule_text: 'سقف الإنفاق الانتخابي', type: 'spending_limit', details: 'يحدد سقف الإنفاق بقسم ثابت وقسم متحرك مرتبط بعدد الناخبين في الدائرة.' },
];
