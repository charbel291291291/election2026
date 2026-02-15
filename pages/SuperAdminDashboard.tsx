import React, { useState } from "react";
import { useStore } from "../store/useStore";
import {
  ShieldAlert,
  Users,
  Building2,
  Activity,
  Search,
  Trash2,
  Lock,
  RotateCcw,
  LogOut,
  Server,
  Database,
  CreditCard,
  ToggleLeft,
  ToggleRight,
  BrainCircuit,
  MessageCircle,
  HardDrive,
  AlertOctagon,
  Terminal,
  Eye,
  Menu,
  X,
} from "lucide-react";
import { SubscriptionPlan } from "../types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const SuperAdminDashboard: React.FC = () => {
  const {
    logout,
    adminLogs,
    organizationUsers,
    allOrganizations,
    adminUpdateOrgPlan,
    adminToggleOrgStatus,
    adminDeleteOrg,
    adminGlobalResetPin,
    systemMetrics,
    featureFlags,
    adminToggleMaintenanceMode,
    isMaintenanceMode,
    adminToggleFeatureFlag,
    adminBanUser,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    "overview" | "orgs" | "users" | "system" | "logs"
  >("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredOrgs = allOrganizations.filter((o) =>
    o.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredUsers = organizationUsers.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone_number.includes(searchTerm)
  );

  // Mock Data for Charts
  const latencyData = [
    { time: "00:00", ms: 120 },
    { time: "04:00", ms: 110 },
    { time: "08:00", ms: 145 },
    { time: "12:00", ms: 230 },
    { time: "16:00", ms: 180 },
    { time: "20:00", ms: 135 },
  ];

  const StatCard = ({
    label,
    value,
    icon: Icon,
    color = "text-red-900",
    subValue,
  }: any) => (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center justify-between shadow-lg">
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
          {label}
        </p>
        <h3 className="text-2xl font-mono text-white">{value}</h3>
        {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
      </div>
      <div
        className={`p-3 rounded-full bg-opacity-10 ${color.replace(
          "text-",
          "bg-"
        )}`}
      >
        <Icon className={color} size={24} />
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-black text-slate-300 font-mono overflow-x-hidden"
      dir="ltr"
    >
      {/* Top Warning Banner */}
      <div className="bg-red-950/30 border-b border-red-900/50 text-red-500 text-xs text-center py-1 flex justify-center items-center gap-2">
        <ShieldAlert size={12} className="animate-pulse" />
        <span>SYSTEM ROOT ACCESS ACTIVE - ALL ACTIONS LOGGED AND AUDITED</span>
        <ShieldAlert size={12} className="animate-pulse" />
      </div>

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950 p-4 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="w-10 h-10 bg-red-600 text-white flex items-center justify-center rounded font-bold text-xl shadow-[0_0_15px_rgba(220,38,38,0.5)]">
            R
          </div>
          <div>
            <h1 className="text-white font-bold tracking-widest text-sm uppercase">
              FieldOps Control Center
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-[10px] text-slate-400">
                Environment: PRODUCTION
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-xs text-slate-400">Admin ID</span>
            <span className="text-xs text-white font-bold">ROOT-001</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-slate-400 border border-slate-700 hover:bg-red-950 hover:text-red-500 hover:border-red-900 transition-all text-xs uppercase tracking-wide rounded"
          >
            <LogOut size={14} /> Kill Session
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row h-[calc(100vh-80px)]">
        {/* Sidebar Navigation - Mobile Drawer */}
        <nav
          className={`
          fixed md:relative z-40 top-[73px] left-0 h-[calc(100vh-80px-73px)] md:h-auto 
          w-64 bg-slate-950 border-r border-slate-800 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0
          ${mobileMenuOpen ? "opacity-100" : "opacity-0"} md:opacity-100
        `}
        >
          {/* Mobile Overlay */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          <div className="p-4 space-y-1 z-50">
            <button
              onClick={() => {
                setActiveTab("overview");
                setMobileMenuOpen(false);
              }}
              className={`w-full p-3 text-left rounded transition-colors flex items-center gap-3 text-xs uppercase tracking-wider font-bold ${
                activeTab === "overview"
                  ? "bg-red-900/20 text-red-500 border border-red-900/30"
                  : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
              }`}
            >
              <Activity size={16} /> Overview
            </button>
            <button
              onClick={() => {
                setActiveTab("orgs");
                setMobileMenuOpen(false);
              }}
              className={`w-full p-3 text-left rounded transition-colors flex items-center gap-3 text-xs uppercase tracking-wider font-bold ${
                activeTab === "orgs"
                  ? "bg-red-900/20 text-red-500 border border-red-900/30"
                  : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
              }`}
            >
              <Building2 size={16} /> Organizations
            </button>
            <button
              onClick={() => {
                setActiveTab("users");
                setMobileMenuOpen(false);
              }}
              className={`w-full p-3 text-left rounded transition-colors flex items-center gap-3 text-xs uppercase tracking-wider font-bold ${
                activeTab === "users"
                  ? "bg-red-900/20 text-red-500 border border-red-900/30"
                  : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
              }`}
            >
              <Users size={16} /> Global Users
            </button>
            <button
              onClick={() => {
                setActiveTab("system");
                setMobileMenuOpen(false);
              }}
              className={`w-full p-3 text-left rounded transition-colors flex items-center gap-3 text-xs uppercase tracking-wider font-bold ${
                activeTab === "system"
                  ? "bg-red-900/20 text-red-500 border border-red-900/30"
                  : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
              }`}
            >
              <Server size={16} /> System Control
            </button>
            <button
              onClick={() => {
                setActiveTab("logs");
                setMobileMenuOpen(false);
              }}
              className={`w-full p-3 text-left rounded transition-colors flex items-center gap-3 text-xs uppercase tracking-wider font-bold ${
                activeTab === "logs"
                  ? "bg-red-900/20 text-red-500 border border-red-900/30"
                  : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
              }`}
            >
              <Terminal size={16} /> Audit Logs
            </button>
          </div>

          <div className="mt-auto p-4 border-t border-slate-800">
            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <p className="text-[10px] text-slate-500 uppercase mb-2">
                System Health
              </p>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300">CPU</span>
                <span className="text-green-500">
                  {systemMetrics.cpu_usage}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded mb-2">
                <div
                  className="bg-green-500 h-1 rounded"
                  style={{ width: `${systemMetrics.cpu_usage}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300">RAM</span>
                <span className="text-yellow-500">
                  {systemMetrics.memory_usage}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded">
                <div
                  className="bg-yellow-500 h-1 rounded"
                  style={{ width: `${systemMetrics.memory_usage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-black p-6">
          {/* --- OVERVIEW TAB --- */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
                System Status
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                  label="Active Organizations"
                  value={allOrganizations.length}
                  icon={Building2}
                  color="text-blue-500"
                />
                <StatCard
                  label="Total Users"
                  value={organizationUsers.length}
                  icon={Users}
                  color="text-purple-500"
                />
                <StatCard
                  label="API Requests (24h)"
                  value="2.4M"
                  icon={Activity}
                  color="text-green-500"
                  subValue="+12% vs yesterday"
                />
                <StatCard
                  label="Storage Used"
                  value={`${systemMetrics.total_storage_gb} GB`}
                  icon={HardDrive}
                  color="text-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-white mb-4">
                    API Latency (ms)
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={latencyData}>
                        <defs>
                          <linearGradient
                            id="colorLatency"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#ef4444"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#ef4444"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="time"
                          stroke="#475569"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#475569"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#334155",
                            color: "#fff",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="ms"
                          stroke="#ef4444"
                          fillOpacity={1}
                          fill="url(#colorLatency)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-white mb-4">
                    Resource Distribution
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>AI Token Usage</span>
                        <span className="text-slate-400">540k / 1M Limit</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                        <div
                          className="bg-purple-600 h-full"
                          style={{ width: "54%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>WhatsApp Messages</span>
                        <span className="text-slate-400">12k / 50k Limit</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                        <div
                          className="bg-green-600 h-full"
                          style={{ width: "24%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Database Connections</span>
                        <span className="text-slate-400">42 / 100 Pool</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                        <div
                          className="bg-blue-600 h-full"
                          style={{ width: "42%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- ORGS TAB --- */}
          {activeTab === "orgs" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h2 className="text-lg font-bold text-white">
                  Organization Management
                </h2>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    size={14}
                  />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-full py-1.5 pl-9 pr-4 text-xs text-white focus:border-red-500 outline-none w-64"
                    placeholder="Search by name..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredOrgs.map((org) => (
                  <div
                    key={org.id}
                    className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-2 h-12 rounded-full ${
                          org.is_active ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                      <div>
                        <h3 className="font-bold text-white text-lg">
                          {org.name}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>ID: {org.id}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users size={12} /> {org.max_users} Users
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <HardDrive size={12} /> {org.storage_used_mb} MB
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-black p-2 rounded border border-slate-800">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase">
                          Plan
                        </span>
                        <select
                          value={org.subscription_plan}
                          onChange={(e) =>
                            adminUpdateOrgPlan(
                              org.id,
                              e.target.value as SubscriptionPlan
                            )
                          }
                          className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer hover:text-red-400"
                        >
                          <option value="basic">BASIC</option>
                          <option value="pro">PRO</option>
                          <option value="enterprise">ENTERPRISE</option>
                        </select>
                      </div>
                      <div className="w-px h-8 bg-slate-800 mx-2"></div>

                      <button
                        onClick={() => adminToggleOrgStatus(org.id)}
                        className={`p-2 rounded hover:bg-slate-800 ${
                          org.is_active
                            ? "text-slate-400 hover:text-yellow-500"
                            : "text-green-500 hover:text-green-400"
                        }`}
                        title={org.is_active ? "Suspend" : "Activate"}
                      >
                        <Lock size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this organization?"
                            )
                          )
                            adminDeleteOrg(org.id);
                        }}
                        className="p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        className="p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-500"
                        title="Impersonate"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- SYSTEM TAB --- */}
          {activeTab === "system" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
                System Configuration
              </h2>

              {/* Maintenance Mode */}
              <div
                className={`p-6 rounded-lg border flex justify-between items-center ${
                  isMaintenanceMode
                    ? "bg-red-950/20 border-red-900"
                    : "bg-slate-900 border-slate-800"
                }`}
              >
                <div>
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <AlertOctagon
                      className={
                        isMaintenanceMode ? "text-red-500" : "text-slate-500"
                      }
                      size={20}
                    />
                    Maintenance Mode
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    When active, only Root Admins can access the platform. All
                    other sessions are terminated.
                  </p>
                </div>
                <button onClick={adminToggleMaintenanceMode}>
                  {isMaintenanceMode ? (
                    <ToggleRight className="text-red-500" size={48} />
                  ) : (
                    <ToggleLeft className="text-slate-600" size={48} />
                  )}
                </button>
              </div>

              {/* Feature Flags */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Database size={18} className="text-blue-500" /> Feature Flags
                </h3>
                <div className="space-y-4">
                  {featureFlags.map((flag) => (
                    <div
                      key={flag.id}
                      className="flex items-center justify-between p-3 bg-black rounded border border-slate-800"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {flag.name}
                          </span>
                          <span className="text-[10px] text-slate-500 px-2 py-0.5 bg-slate-900 rounded border border-slate-700">
                            {flag.key}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {flag.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] text-slate-400 uppercase">
                          {flag.scope}
                        </span>
                        <button onClick={() => adminToggleFeatureFlag(flag.id)}>
                          {flag.is_enabled ? (
                            <ToggleRight className="text-green-500" size={32} />
                          ) : (
                            <ToggleLeft className="text-slate-600" size={32} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* --- LOGS TAB --- */}
          {activeTab === "logs" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
                Audit Logs
              </h2>
              <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-black text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Admin</th>
                      <th className="p-3">Target</th>
                      <th className="p-3">IP Address</th>
                      <th className="p-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {adminLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/50">
                        <td className="p-3 text-slate-400">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded ${
                              log.severity === "critical"
                                ? "bg-red-900/30 text-red-500"
                                : log.severity === "warning"
                                ? "bg-yellow-900/30 text-yellow-500"
                                : "bg-blue-900/30 text-blue-500"
                            }`}
                          >
                            {log.action_type}
                          </span>
                        </td>
                        <td className="p-3 text-white">{log.admin_id}</td>
                        <td className="p-3 text-slate-400">{log.target_id}</td>
                        <td className="p-3 text-slate-500">{log.ip_address}</td>
                        <td className="p-3 text-slate-300 max-w-xs truncate">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- USERS TAB --- */}
          {activeTab === "users" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
                Global User Database
              </h2>
              <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Organization</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/50">
                        <td className="p-3">
                          <div className="font-bold text-white">
                            {u.full_name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {u.phone_number}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-300">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-xs font-mono text-slate-500">
                          {u.organization_id}
                        </td>
                        <td className="p-3">
                          {u.is_banned ? (
                            <span className="text-red-500 text-xs font-bold flex items-center gap-1">
                              <ShieldAlert size={12} /> BANNED
                            </span>
                          ) : (
                            <span className="text-green-500 text-xs font-bold">
                              ACTIVE
                            </span>
                          )}
                        </td>
                        <td className="p-3 flex gap-2">
                          <button
                            onClick={() => {
                              if (confirm("Reset PIN to 0000?"))
                                adminGlobalResetPin(u.id);
                            }}
                            className="text-yellow-500 hover:text-yellow-400 text-xs flex items-center gap-1 border border-yellow-900/30 bg-yellow-900/10 px-2 py-1 rounded"
                          >
                            <RotateCcw size={12} /> PIN
                          </button>
                          <button
                            onClick={() => adminBanUser(u.id)}
                            className={`text-xs flex items-center gap-1 border px-2 py-1 rounded ${
                              u.is_banned
                                ? "border-green-900/30 bg-green-900/10 text-green-500"
                                : "border-red-900/30 bg-red-900/10 text-red-500"
                            }`}
                          >
                            {u.is_banned ? "UNBAN" : "BAN"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
