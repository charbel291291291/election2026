import { create } from "zustand";
import { supabase, invokeRootAction } from "../services/supabaseClient"; // Import Client
import {
  UserRole,
  Profile,
  Alert,
  FieldReport,
  MessageVariant,
  ResourceLog,
  WhatsAppLog,
  WhatsAppAccount,
  WhatsAppPoll,
  WhatsAppTemplate,
  LegalDeadline,
  FinancialRecord,
  Organization,
  SuperAdmin,
  AdminLog,
  SubscriptionPlan,
  SystemMetrics,
  FeatureFlag,
} from "../types";
import {
  MOCK_ALERTS,
  MOCK_MESSAGES,
  MOCK_REPORTS,
  MOCK_RESOURCES,
  MOCK_USERS,
  MOCK_WHATSAPP_ACCOUNTS,
  MOCK_WHATSAPP_LOGS,
  MOCK_WHATSAPP_POLLS,
  MOCK_WHATSAPP_TEMPLATES,
  MOCK_DEADLINES,
  MOCK_FINANCE_RECORDS,
  MOCK_ORGANIZATION,
  MOCK_SUPER_ADMIN,
  MOCK_ADMIN_LOGS,
  MOCK_SYSTEM_METRICS,
  MOCK_FEATURE_FLAGS,
} from "../constants";
import {
  saveOfflineReport,
  getOfflineReports,
  clearOfflineReports,
} from "../utils/db";

interface AppState {
  user: Profile | null;
  organization: Organization | null;
  organizationUsers: Profile[];
  isAuthenticated: boolean;

  // Auth Validation State (for PWA security)
  isValidating: boolean;

  // Super Admin State
  isSuperAdmin: boolean;
  adminLogs: AdminLog[];
  allOrganizations: Organization[];
  systemMetrics: SystemMetrics;
  featureFlags: FeatureFlag[];
  isMaintenanceMode: boolean;

  // Data (Filtered by Org)
  alerts: Alert[];
  reports: FieldReport[];
  messages: MessageVariant[];
  resources: ResourceLog[];

  // App State
  isOnline: boolean;
  pendingSyncCount: number;

  // WhatsApp State
  whatsappLogs: WhatsAppLog[];
  whatsappAccounts: WhatsAppAccount[];
  whatsappPolls: WhatsAppPoll[];
  whatsappTemplates: WhatsAppTemplate[];

  // Electoral Intelligence State
  deadlines: LegalDeadline[];
  financeRecords: FinancialRecord[];

  // Actions
  setUser: (user: { id: string; email?: string } | null) => void;
  setIsValidating: (validating: boolean) => void;
  loginWithPin: (
    phone: string,
    pin: string
  ) => Promise<{ success: boolean; message?: string }>;
  superAdminLogin: (pin: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Partial<Profile>) => Promise<{
    success: boolean;
    error?: "limit_reached" | "exists" | "unknown";
  }>;
  resetUserPin: (userId: string, newPin: string) => void;
  deleteUser: (userId: string) => void;

  // Super Admin Actions
  adminUpdateOrgPlan: (orgId: string, plan: SubscriptionPlan) => Promise<void>;
  adminToggleOrgStatus: (orgId: string) => Promise<void>;
  adminDeleteOrg: (orgId: string) => void;
  adminGlobalResetPin: (userId: string) => void;
  adminToggleMaintenanceMode: () => void;
  adminToggleFeatureFlag: (flagId: string) => void;
  adminBanUser: (userId: string) => Promise<void>;

  addReport: (report: FieldReport) => void;
  syncOfflineQueue: () => Promise<void>;
  setOnlineStatus: (status: boolean) => void;

  resolveAlert: (id: string) => void;
  addMessageVariant: (variant: MessageVariant) => void;

  processIncomingWhatsApp: (sender: string, text: string) => Promise<string>;
  createPoll: (poll: WhatsAppPoll) => void;
  addWhatsAppTemplate: (template: WhatsAppTemplate) => void;
  deleteWhatsAppTemplate: (id: string) => void;

  addFinancialRecord: (record: FinancialRecord) => void;
  toggleDeadlineStatus: (id: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  organization: null,
  organizationUsers: [],
  isAuthenticated: false,

  // Auth validation state
  isValidating: false,

  isSuperAdmin: false,
  adminLogs: MOCK_ADMIN_LOGS,
  allOrganizations: [MOCK_ORGANIZATION],
  systemMetrics: MOCK_SYSTEM_METRICS,
  featureFlags: MOCK_FEATURE_FLAGS,
  isMaintenanceMode: false,

  alerts: [],
  reports: [],
  messages: [],
  resources: [],

  isOnline: navigator.onLine,
  pendingSyncCount: 0,

  whatsappLogs: [],
  whatsappAccounts: [],
  whatsappPolls: [],
  whatsappTemplates: [],

  deadlines: [],
  financeRecords: [],

  loginWithPin: async (phone, pin) => {
    try {
      // Call Edge Function for real Supabase Auth
      const { data, error } = await supabase.functions.invoke("user-auth", {
        body: { phone_number: phone, pin },
      });

      if (error) {
        console.error("Login error:", error);
        return { success: false, message: "حدث خطأ في الاتصال بالخادم" };
      }

      if (!data.success) {
        return {
          success: false,
          message: data.error || "رقم الهاتف أو الرمز السري غير صحيح",
        };
      }

      // Login successful - set user data from response
      const userData = data.user;

      set({
        isAuthenticated: true,
        user: {
          id: userData.id,
          phone_number: userData.phone_number,
          full_name: userData.full_name,
          role: userData.role,
          organization_id: userData.organization?.id,
          is_banned: false,
        },
        organization: userData.organization,
        // Load mock data for now (would come from DB in production)
        organizationUsers: MOCK_USERS,
        alerts: MOCK_ALERTS,
        reports: MOCK_REPORTS,
        messages: MOCK_MESSAGES,
        resources: MOCK_RESOURCES,
        whatsappLogs: MOCK_WHATSAPP_LOGS,
        whatsappAccounts: MOCK_WHATSAPP_ACCOUNTS,
        whatsappPolls: MOCK_WHATSAPP_POLLS,
        whatsappTemplates: MOCK_WHATSAPP_TEMPLATES,
        deadlines: MOCK_DEADLINES,
        financeRecords: MOCK_FINANCE_RECORDS,
      });

      return { success: true };
    } catch (err) {
      console.error("Login exception:", err);
      // Fallback to mock for development if edge function not available
      await new Promise((resolve) => setTimeout(resolve, 800));
      const user = MOCK_USERS.find((u) => u.phone_number === phone);

      if (user && user.pin_hash === pin) {
        if (user.is_banned) {
          return {
            success: false,
            message: "تم تجميد هذا الحساب. راجع الإدارة.",
          };
        }
        set({
          isAuthenticated: true,
          user: user,
          organization: MOCK_ORGANIZATION,
          organizationUsers: MOCK_USERS.filter(
            (u) => u.organization_id === user.organization_id
          ),
          alerts: MOCK_ALERTS.filter(
            (a) => a.organization_id === user.organization_id
          ),
          reports: MOCK_REPORTS.filter(
            (r) => r.organization_id === user.organization_id
          ),
          messages: MOCK_MESSAGES.filter(
            (m) => m.organization_id === user.organization_id
          ),
          resources: MOCK_RESOURCES.filter(
            (r) => r.organization_id === user.organization_id
          ),
          whatsappLogs: MOCK_WHATSAPP_LOGS.filter(
            (w) => w.organization_id === user.organization_id
          ),
          whatsappAccounts: MOCK_WHATSAPP_ACCOUNTS.filter(
            (w) => w.organization_id === user.organization_id
          ),
          whatsappPolls: MOCK_WHATSAPP_POLLS.filter(
            (w) => w.organization_id === user.organization_id
          ),
          whatsappTemplates: MOCK_WHATSAPP_TEMPLATES.filter(
            (w) => w.organization_id === user.organization_id
          ),
          deadlines: MOCK_DEADLINES,
          financeRecords: MOCK_FINANCE_RECORDS.filter(
            (f) => f.organization_id === user.organization_id
          ),
        });
        return { success: true };
      }
      return { success: false, message: "رقم الهاتف أو الرمز السري غير صحيح" };
    }
  },

  superAdminLogin: async (pin) => {
    try {
      // 1. Get current user ID (Must be logged in as a base user first in this flow, or use separate Auth flow)
      // For this hybrid SaaS, we assume the user is already authenticated as a "User", and is escalating privilege.
      // If not logged in, we can't get user_id easily without a standard auth form.
      // FALLBACK: If mock environment (no user), check Mock PIN.

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Mock Fallback for Development/Demo without backend
        if (pin === MOCK_SUPER_ADMIN.pin_hash) {
          set({
            isSuperAdmin: true,
            organizationUsers: MOCK_USERS,
            allOrganizations: [MOCK_ORGANIZATION],
          });
          return true;
        }
        return false;
      }

      // 2. Call Edge Function
      const { data, error } = await supabase.functions.invoke("root-auth", {
        body: { pin, user_id: user.id },
      });

      if (error || !data.success) {
        console.error("Root Auth Failed:", error);
        return false;
      }

      // 3. Refresh Session to get new Claim
      await supabase.auth.refreshSession();

      set({
        isSuperAdmin: true,
        // In a real app, we would now fetch real data using the new claim
        organizationUsers: MOCK_USERS,
        allOrganizations: [MOCK_ORGANIZATION],
      });

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  logout: async () => {
    // Clear auth state immediately - don't wait for Supabase signOut
    // This prevents hanging on network issues
    try {
      supabase.auth.signOut();
    } catch (e) {
      // Ignore signOut errors
    }

    // Clear all cached auth data for PWA security
    sessionStorage.clear();
    localStorage.removeItem("supabase.auth.token");

    // Clear browser caches if available (PWA)
    if (typeof caches !== "undefined") {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cache) => caches.delete(cache)));
      } catch (e) {
        // Ignore cache errors
      }
    }

    set({
      isAuthenticated: false,
      isSuperAdmin: false,
      user: null,
      organization: null,
      alerts: [],
      reports: [],
    });
  },

  setUser: (user) => {
    if (user) {
      set({
        isAuthenticated: true,
        user: {
          id: user.id,
          phone_number: user.email?.split("@")[0] || "",
          full_name: user.email?.split("@")[0] || "User",
          role: "admin" as UserRole,
          organization_id: "29db510f-2dd2-4777-b2f4-ae96ea298d3d",
          is_banned: false,
        },
        organization: MOCK_ORGANIZATION,
        organizationUsers: MOCK_USERS,
        alerts: MOCK_ALERTS,
        reports: MOCK_REPORTS,
        messages: MOCK_MESSAGES,
        resources: MOCK_RESOURCES,
        whatsappLogs: MOCK_WHATSAPP_LOGS,
        whatsappAccounts: MOCK_WHATSAPP_ACCOUNTS,
        whatsappPolls: MOCK_WHATSAPP_POLLS,
        whatsappTemplates: MOCK_WHATSAPP_TEMPLATES,
        deadlines: MOCK_DEADLINES,
        financeRecords: MOCK_FINANCE_RECORDS,
      });
    } else {
      set({
        isAuthenticated: false,
        user: null,
      });
    }
  },

  setIsValidating: (validating) => set({ isValidating: validating }),

  // --- ADMIN ACTIONS (Connected to Edge Functions) ---

  adminUpdateOrgPlan: async (orgId, plan) => {
    try {
      // Optimistic Update
      set((state) => ({
        allOrganizations: state.allOrganizations.map((o) =>
          o.id === orgId ? { ...o, subscription_plan: plan } : o
        ),
      }));

      await invokeRootAction("CHANGE_PLAN", {
        orgId,
        plan,
        max_users: plan === "enterprise" ? 100 : 20,
      });
    } catch (e) {
      console.error("Root Action Failed", e);
      // Revert on error would go here
    }
  },

  adminToggleOrgStatus: async (orgId) => {
    try {
      const org = get().allOrganizations.find((o) => o.id === orgId);
      if (!org) return;
      const action = org.is_active ? "SUSPEND_ORG" : "ACTIVATE_ORG";

      set((state) => ({
        allOrganizations: state.allOrganizations.map((o) =>
          o.id === orgId ? { ...o, is_active: !o.is_active } : o
        ),
      }));

      await invokeRootAction(action, { orgId });
    } catch (e) {
      console.error(e);
    }
  },

  adminBanUser: async (userId) => {
    try {
      set((state) => ({
        organizationUsers: state.organizationUsers.map((u) =>
          u.id === userId ? { ...u, is_banned: !u.is_banned } : u
        ),
      }));
      await invokeRootAction("BAN_USER", { userId });
    } catch (e) {
      console.error(e);
    }
  },

  adminDeleteOrg: (orgId) =>
    set((state) => ({
      allOrganizations: state.allOrganizations.filter((o) => o.id !== orgId),
    })),

  adminGlobalResetPin: (userId) =>
    set((state) => ({
      organizationUsers: state.organizationUsers.map((u) =>
        u.id === userId ? { ...u, pin_hash: "0000" } : u
      ),
    })),

  adminToggleMaintenanceMode: () =>
    set((state) => ({
      isMaintenanceMode: !state.isMaintenanceMode,
    })),

  adminToggleFeatureFlag: (flagId) =>
    set((state) => ({
      featureFlags: state.featureFlags.map((f) =>
        f.id === flagId ? { ...f, is_enabled: !f.is_enabled } : f
      ),
    })),

  // --- STANDARD ACTIONS ---

  addUser: async (newUser) => {
    const { organization, organizationUsers } = get();
    if (!organization) return { success: false, error: "unknown" };
    if (organizationUsers.length >= organization.max_users)
      return { success: false, error: "limit_reached" };
    if (organizationUsers.find((u) => u.phone_number === newUser.phone_number))
      return { success: false, error: "exists" };

    const userToAdd: Profile = {
      id: `u-${Date.now()}`,
      organization_id: organization.id,
      full_name: newUser.full_name || "New User",
      phone_number: newUser.phone_number || "",
      role: newUser.role || UserRole.FIELD_AGENT,
      pin_hash: newUser.pin_hash || "0000",
      created_at: new Date().toISOString(),
      is_banned: false,
    };
    set((state) => ({
      organizationUsers: [...state.organizationUsers, userToAdd],
    }));
    return { success: true };
  },

  resetUserPin: (userId, newPin) =>
    set((state) => ({
      organizationUsers: state.organizationUsers.map((u) =>
        u.id === userId ? { ...u, pin_hash: newPin } : u
      ),
    })),

  deleteUser: (userId) =>
    set((state) => ({
      organizationUsers: state.organizationUsers.filter((u) => u.id !== userId),
    })),

  setOnlineStatus: (status) => set({ isOnline: status }),

  addReport: async (report) => {
    const isOnline = get().isOnline;
    if (isOnline) {
      set((state) => ({ reports: [report, ...state.reports] }));
    } else {
      await saveOfflineReport(report);
      const pending = await getOfflineReports();
      set({ pendingSyncCount: pending.length });
    }
  },

  syncOfflineQueue: async () => {
    try {
      const pendingReports = await getOfflineReports();
      if (pendingReports.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const currentReports = get().reports;
        const syncedReports = pendingReports.map((r) => ({
          ...r,
          notes: r.notes + " (Synced)",
          status: "verified" as const,
        }));
        set({
          reports: [...syncedReports, ...currentReports],
          pendingSyncCount: 0,
        });
        await clearOfflineReports();
      }
    } catch (e) {
      console.error("Sync failed", e);
    }
  },

  resolveAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, resolved: true } : a
      ),
    })),

  addMessageVariant: (variant) =>
    set((state) => ({
      messages: [...state.messages, variant],
    })),

  createPoll: (poll) =>
    set((state) => ({
      whatsappPolls: [poll, ...state.whatsappPolls],
    })),

  addWhatsAppTemplate: (template) =>
    set((state) => ({
      whatsappTemplates: [template, ...state.whatsappTemplates],
    })),

  deleteWhatsAppTemplate: (id) =>
    set((state) => ({
      whatsappTemplates: state.whatsappTemplates.filter((t) => t.id !== id),
    })),

  processIncomingWhatsApp: async (sender, text) => {
    const log = {
      id: `log-${Date.now()}`,
      organization_id: "org-1",
      sender_number: sender,
      message_text: text,
      parsed_command: "MOCK_CMD",
      status: "success" as const,
      response_text: "تم الاستلام",
      created_at: new Date().toISOString(),
    };
    set((state) => ({ whatsappLogs: [log, ...state.whatsappLogs] }));
    return "تم الاستلام";
  },

  addFinancialRecord: (record) =>
    set((state) => ({
      financeRecords: [record, ...state.financeRecords],
    })),

  toggleDeadlineStatus: (id) =>
    set((state) => ({
      deadlines: state.deadlines.map((d) =>
        d.id === id
          ? { ...d, status: d.status === "completed" ? "pending" : "completed" }
          : d
      ),
    })),
}));
