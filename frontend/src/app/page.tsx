'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  Clock,
  AlertCircle,
  CalendarCheck,
  Award,
  TrendingUp,
  IndianRupee,
  Building,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  MapPin,
  RefreshCw,
  Bell,
  CheckSquare,
  ExternalLink,
  MessageSquare,
  FileText,
  Filter,
  Search,
  Globe,
  Share2,
  SlidersHorizontal,
  Info,
  Menu,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api, DashboardSummary, Project, User } from '@/lib/api';
import { useAuth, SEEDED_DEMO_ACCOUNTS } from '@/context/AuthContext';
import { useShell } from '@/components/layout/AppShell';

// Source Icons & Styling Mapping
const getSourceMeta = (sourceName: string) => {
  const s = sourceName.toLowerCase();
  if (s.includes('facebook') || s.includes('meta')) {
    return { label: 'Facebook', bg: 'bg-[#1877F2]/10', text: 'text-[#1877F2]', bar: 'bg-[#1877F2]' };
  } else if (s.includes('google ad')) {
    return { label: 'Google Ads', bg: 'bg-amber-500/10', text: 'text-amber-600', bar: 'bg-amber-500' };
  } else if (s.includes('google form') || s.includes('form')) {
    return { label: 'Google Form', bg: 'bg-emerald-500/10', text: 'text-emerald-600', bar: 'bg-emerald-500' };
  } else if (s.includes('gmail') || s.includes('email')) {
    return { label: 'Gmail', bg: 'bg-rose-500/10', text: 'text-rose-600', bar: 'bg-rose-500' };
  } else if (s.includes('instagram')) {
    return { label: 'Instagram', bg: 'bg-pink-500/10', text: 'text-pink-600', bar: 'bg-gradient-to-r from-purple-500 to-pink-500' };
  } else if (s.includes('housing')) {
    return { label: 'Housing', bg: 'bg-amber-400/10', text: 'text-amber-600', bar: 'bg-amber-500' };
  } else if (s.includes('magicbrick')) {
    return { label: 'Magicbricks', bg: 'bg-red-500/10', text: 'text-red-600', bar: 'bg-red-600' };
  } else if (s.includes('99acre')) {
    return { label: '99acres', bg: 'bg-blue-500/10', text: 'text-blue-600', bar: 'bg-blue-600' };
  } else if (s.includes('quikr')) {
    return { label: 'Quikr', bg: 'bg-emerald-500/10', text: 'text-emerald-700', bar: 'bg-emerald-600' };
  } else if (s.includes('just')) {
    return { label: 'Just Lead', bg: 'bg-cyan-500/10', text: 'text-cyan-700', bar: 'bg-cyan-600' };
  } else if (s.includes('website')) {
    return { label: 'Website', bg: 'bg-teal-500/10', text: 'text-teal-600', bar: 'bg-teal-500' };
  } else if (s.includes('direct') || s.includes('walk-in') || s.includes('walkin')) {
    return { label: 'Direct/Walkin', bg: 'bg-slate-500/10', text: 'text-slate-700', bar: 'bg-slate-600' };
  } else if (s.includes('qr')) {
    return { label: 'QR Code', bg: 'bg-amber-500/10', text: 'text-amber-700', bar: 'bg-amber-600' };
  } else if (s.includes('referral')) {
    return { label: 'Referral', bg: 'bg-indigo-500/10', text: 'text-indigo-600', bar: 'bg-indigo-600' };
  } else if (s.includes('channel')) {
    return { label: 'Channel Partner', bg: 'bg-purple-500/10', text: 'text-purple-600', bar: 'bg-purple-600' };
  }
  return { label: sourceName, bg: 'bg-slate-100', text: 'text-slate-600', bar: 'bg-slate-400' };
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, switchDemoRole } = useAuth();
  const { openLeadDetails, openNewLeadModal, openFollowUpModal, openSiteVisitModal, openMobileMenu, refreshTrigger, triggerRefresh } = useShell();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [activeDateIndex, setActiveDateIndex] = useState(3); // Default Thu 11 or today
  const [selectedReminderFilter, setSelectedReminderFilter] = useState<'ALL' | 'VISIT' | 'MEETING' | 'CALL'>('ALL');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showDetailsSourceView, setShowDetailsSourceView] = useState(false);

  const loadDashboard = useCallback(async (manualRefresh = false) => {
    if (manualRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const data = await api.getDashboardSummary({
        time_range: timeRange,
        project_id: selectedProject || undefined,
        agent_id: selectedAgent || undefined,
      });
      setSummary(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [timeRange, selectedProject, selectedAgent]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard, refreshTrigger]);

  useEffect(() => {
    api.getProjects().then((res) => {
      const list = Array.isArray(res) ? res : res.results;
      setProjects(list || []);
    }).catch(() => {});

    api.getTeamMembers().then((res) => {
      const list = Array.isArray(res) ? res : (res as { results?: User[] }).results;
      setTeamMembers(list || []);
    }).catch(() => {});
  }, []);

  const kpis = summary?.kpis;

  // Calendar dates for weekly strip initialized with fallback, updated in useEffect
  const [calendarDays, setCalendarDays] = useState([
    { dayName: 'Mon', dayNum: 8, dateStr: '2026-10-12', isToday: false },
    { dayName: 'Tue', dayNum: 9, dateStr: '2026-10-13', isToday: false },
    { dayName: 'Wed', dayNum: 10, dateStr: '2026-10-14', isToday: false },
    { dayName: 'Thu', dayNum: 11, dateStr: '2026-10-15', isToday: true },
    { dayName: 'Fri', dayNum: 12, dateStr: '2026-10-16', isToday: false },
    { dayName: 'Sat', dayNum: 13, dateStr: '2026-10-17', isToday: false },
    { dayName: 'Sun', dayNum: 14, dateStr: '2026-10-18', isToday: false },
  ]);

  useEffect(() => {
    const days = [];
    const base = new Date();
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      days.push({
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        dateStr: d.toISOString().split('T')[0],
        isToday: i === 0,
      });
    }
    setCalendarDays(days);
  }, []);

  // Filtered Reminders
  const allReminders = summary?.reminders || [];
  const filteredReminders = useMemo(() => {
    return allReminders.filter((rem) => {
      if (selectedReminderFilter === 'VISIT') return rem.type.toLowerCase().includes('visit');
      if (selectedReminderFilter === 'MEETING') return rem.type.toLowerCase().includes('meeting');
      if (selectedReminderFilter === 'CALL') return rem.type.toLowerCase().includes('call');
      return true;
    });
  }, [allReminders, selectedReminderFilter]);

  // Activity Radar Data
  const activityData = useMemo(() => {
    const act = summary?.activity_breakdown || {
      whatsapp: 20,
      call: 14,
      sms: 4,
      email: 6,
      meeting: 8,
      total: 52,
    };
    return [
      { subject: 'whatsapp', count: act.whatsapp, fullMark: 30 },
      { subject: 'call', count: act.call, fullMark: 30 },
      { subject: 'email', count: act.email, fullMark: 30 },
      { subject: 'sms', count: act.sms, fullMark: 30 },
      { subject: 'meeting', count: act.meeting, fullMark: 30 },
    ];
  }, [summary?.activity_breakdown]);

  // Grouped Lead Sources (Social, 3rd party, Others)
  const sourcesGrouped = useMemo(() => {
    const list = summary?.source_distribution || [];
    const social = list.filter((s) => ['facebook', 'meta', 'google', 'instagram', 'gmail', 'form'].some((k) => s.source.toLowerCase().includes(k)));
    const thirdParty = list.filter((s) => ['housing', 'magicbricks', '99acres', 'quikr', 'just', 'portal'].some((k) => s.source.toLowerCase().includes(k)));
    const others = list.filter((s) => !social.includes(s) && !thirdParty.includes(s));
    return { social, thirdParty, others };
  }, [summary?.source_distribution]);

  // Max source count for relative bar width
  const maxSourceCount = useMemo(() => {
    const list = summary?.source_distribution || [];
    return Math.max(...list.map((s) => s.count), 1);
  }, [summary?.source_distribution]);

  // Pipeline funnel steps
  const pipelineSteps = summary?.pipeline_funnel || [
    { stage: 'New', count: 12, total_budget: 0 },
    { stage: 'Contacted', count: 16, total_budget: 0 },
    { stage: 'Site Visit Scheduled', count: 18, total_budget: 0 },
    { stage: 'Site Visit Done', count: 14, total_budget: 0 },
    { stage: 'Booked', count: 10, total_budget: 0 },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col font-sans select-none text-slate-800">
      {/* ========================================================
          ZONE 1: DARK NAVY TOP KPI HEADER (LeadRat Insp.)
          ======================================================== */}
      <header className="bg-[#100D2B] text-white border-b border-[#1C1844] sticky top-0 z-20 shadow-md">
        {/* Top Control Bar */}
        <div className="px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#1F1B4B]">
          {/* Left: Organization & Selectors */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <button
              onClick={openMobileMenu}
              className="md:hidden p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Toggle navigation"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm sm:text-base tracking-tight truncate max-w-[200px] sm:max-w-none">
                {user?.organization?.name || 'Apex Horizon Realty Partners'}
              </span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" title="Live Enterprise CRM" />
            </div>

            {/* View Selector Dropdown */}
            <div className="relative">
              <select
                value="team"
                onChange={() => {}}
                className="bg-[#1B1642] text-xs font-semibold text-slate-200 border border-[#2D2760] rounded-lg px-2.5 py-1.5 pr-6 appearance-none hover:bg-[#252055] transition-colors cursor-pointer focus:outline-hidden"
              >
                <option value="team">Team Dashboard ▾</option>
                <option value="pipeline">Sales Pipeline Overview</option>
                <option value="executive">Executive Metrics</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {/* Team / Agent Selector */}
            <div className="relative">
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="bg-[#1B1642] text-xs font-medium text-slate-200 border border-[#2D2760] rounded-lg px-2.5 py-1.5 pr-6 appearance-none hover:bg-[#252055] transition-colors cursor-pointer focus:outline-hidden"
              >
                <option value="">My team (All) ▾</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.display_name} ({m.role})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {/* Project Filter */}
            <div className="relative hidden lg:block">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-[#1B1642] text-xs font-medium text-slate-200 border border-[#2D2760] rounded-lg px-2.5 py-1.5 pr-6 appearance-none hover:bg-[#252055] transition-colors cursor-pointer focus:outline-hidden"
              >
                <option value="">All Projects ▾</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Right: Actions, Notifications, User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Refresh Button */}
            <button
              onClick={() => loadDashboard(true)}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg bg-[#1B1642] hover:bg-[#252055] text-slate-300 hover:text-white transition-colors border border-[#2D2760] cursor-pointer"
              title="Refresh Live Metrics from Django API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            {/* Quick Add Lead */}
            <button
              onClick={openNewLeadModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Lead</span>
            </button>

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-[11px] font-semibold transition-colors cursor-pointer"
                title="Switch client demo role to test permission matrices"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="font-mono">{user?.role || 'OWNER'}</span>
                <ChevronDown className="w-2.5 h-2.5 text-amber-400" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-[#18133E] rounded-xl shadow-2xl border border-[#2E2768] p-2 z-50">
                  <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-[#28215E]">
                    <span className="text-[11px] font-bold text-slate-300">Switch Demo Role Account</span>
                    <button
                      onClick={() => router.push('/login')}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
                    >
                      Login Page ↗
                    </button>
                  </div>
                  <div className="py-1 space-y-1 max-h-[380px] overflow-y-auto scrollbar-none">
                    {SEEDED_DEMO_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.username}
                        onClick={() => {
                          switchDemoRole(acc.role, acc.username);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          user?.username === acc.username
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold truncate">{acc.label}</div>
                          {acc.scope && (
                            <div className={`text-[10px] truncate ${user?.username === acc.username ? 'text-blue-100' : 'text-slate-400'}`}>
                              {acc.scope}
                            </div>
                          )}
                        </div>
                        {user?.username === acc.username && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative p-1.5 text-slate-300 hover:text-white cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </div>

            {/* User Profile Avatar */}
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
              alt={user?.display_name || 'User'}
              className="w-7 h-7 rounded-full object-cover border border-slate-500/40"
              title={`${user?.display_name || 'Admin'} (${user?.role})`}
            />
          </div>
        </div>

        {/* Compact Horizontal KPI Summary Row */}
        <div className="px-4 py-3 sm:px-6 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-3 sm:gap-6 min-w-max">
            {/* Total Leads */}
            <button
              onClick={() => router.push('/leads')}
              className="flex flex-col text-left group cursor-pointer hover:opacity-90 transition-opacity"
            >
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Leads</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none mt-0.5">
                {kpis?.total_leads ?? 0}
              </span>
            </button>

            <span className="text-slate-600 font-light text-xl select-none">+</span>

            {/* Active Leads */}
            <button
              onClick={() => router.push('/leads?filter=active')}
              className="flex flex-col text-left group cursor-pointer hover:opacity-90 transition-opacity"
            >
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none mt-0.5">
                {kpis?.active_leads ?? 0}
              </span>
            </button>

            <span className="text-slate-600 font-light text-xl select-none">+</span>

            {/* Unassigned Leads */}
            <button
              onClick={() => router.push('/leads?filter=unassigned')}
              className="flex flex-col text-left group cursor-pointer hover:opacity-90 transition-opacity"
            >
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Unassigned</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-tight leading-none mt-0.5">
                {kpis?.unassigned_leads ?? 0}
              </span>
            </button>

            <span className="text-slate-600 font-light text-xl select-none">+</span>

            {/* Booked Leads */}
            <button
              onClick={() => router.push('/leads?status=Booked')}
              className="flex flex-col text-left group cursor-pointer hover:opacity-90 transition-opacity"
            >
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Booked</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight leading-none mt-0.5">
                {kpis?.booked_leads ?? 0}
              </span>
            </button>

            <span className="text-slate-600 font-light text-xl select-none">+</span>

            {/* Not Interested */}
            <button
              onClick={() => router.push('/leads?filter=not_interested')}
              className="flex flex-col text-left group cursor-pointer hover:opacity-90 transition-opacity"
            >
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Not Interested</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-300 tracking-tight leading-none mt-0.5">
                {kpis?.not_interested_leads ?? 0}
              </span>
            </button>

            <span className="text-slate-600 font-light text-xl select-none">+</span>

            {/* Dropped / Lost */}
            <button
              onClick={() => router.push('/leads?status=Lost')}
              className="flex flex-col text-left group cursor-pointer hover:opacity-90 transition-opacity"
            >
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Dropped</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-rose-400 tracking-tight leading-none mt-0.5">
                {kpis?.dropped_leads ?? 0}
              </span>
            </button>

            {/* Conversion Rate & Revenue Pill */}
            <div className="ml-auto hidden xl:flex items-center gap-3 pl-6 border-l border-[#241F55]">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Booking Rate</div>
                <div className="text-base font-bold text-emerald-400">{kpis?.conversion_rate ?? 0}%</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Booked Volume (Demo)</div>
                <div className="text-base font-bold text-white">
                  ₹{((kpis?.total_revenue ?? 0) / 10000000).toFixed(2)} Cr
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
          ZONE 2: COMPACT ACTION CARDS (Single row of 6)
          ======================================================== */}
      <section className="px-4 py-3 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {/* Card 1: New */}
          <button
            onClick={() => router.push('/leads?status=New')}
            className="bg-white rounded-lg p-2.5 sm:p-3 border border-slate-200 border-l-4 border-l-purple-600 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between text-left cursor-pointer group"
          >
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">New</span>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {String(kpis?.new_leads ?? 0).padStart(2, '0')}
              </div>
            </div>
            <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
              +
            </div>
          </button>

          {/* Card 2: Pending */}
          <button
            onClick={() => router.push('/leads?filter=pending')}
            className="bg-white rounded-lg p-2.5 sm:p-3 border border-slate-200 border-l-4 border-l-rose-500 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between text-left cursor-pointer group"
          >
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Pending</span>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {String(kpis?.pending_leads ?? 0).padStart(2, '0')}
              </div>
            </div>
            <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </button>

          {/* Card 3: Callbacks */}
          <button
            onClick={() => router.push('/follow-ups?type=Call')}
            className="bg-white rounded-lg p-2.5 sm:p-3 border border-slate-200 border-l-4 border-l-sky-500 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between text-left cursor-pointer group"
          >
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Callbacks</span>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {String(kpis?.callbacks_due ?? 0).padStart(2, '0')}
              </div>
            </div>
            <div className="w-7 h-7 rounded-md bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Phone className="w-4 h-4" />
            </div>
          </button>

          {/* Card 4: Meeting scheduled */}
          <button
            onClick={() => router.push('/follow-ups?type=Meeting')}
            className="bg-white rounded-lg p-2.5 sm:p-3 border border-slate-200 border-l-4 border-l-amber-500 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between text-left cursor-pointer group"
          >
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Meeting scheduled</span>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {String(kpis?.meetings_scheduled ?? 0).padStart(2, '0')}
              </div>
            </div>
            <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
          </button>

          {/* Card 5: Site visit scheduled */}
          <button
            onClick={() => router.push('/site-visits?status=Scheduled')}
            className="bg-white rounded-lg p-2.5 sm:p-3 border border-slate-200 border-l-4 border-l-emerald-500 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between text-left cursor-pointer group"
          >
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Site visit scheduled</span>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {String(kpis?.site_visits_scheduled ?? 0).padStart(2, '0')}
              </div>
            </div>
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </button>

          {/* Card 6: Overdue */}
          <button
            onClick={() => router.push('/follow-ups?filter=overdue')}
            className="bg-white rounded-lg p-2.5 sm:p-3 border border-slate-200 border-l-4 border-l-rose-600 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between text-left cursor-pointer group"
          >
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Overdue</span>
              <div className="text-xl sm:text-2xl font-extrabold text-rose-600 leading-tight">
                {String(kpis?.overdue_followups ?? 0).padStart(2, '0')}
              </div>
            </div>
            <div className="w-7 h-7 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bell className="w-4 h-4" />
            </div>
          </button>
        </div>
      </section>

      {/* ========================================================
          ZONE 3: MAIN DENSE GRID + RIGHT REMINDERS PANEL
          ======================================================== */}
      <section className="px-4 pb-6 sm:px-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Main Dashboard Left/Central Section (70% on wide screens -> 8 or 9 cols) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            {/* Top Row: Leads by Source (Wide ~68%) + Activity on Leads (Radar ~32%) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
              {/* Widget 1: Leads by Source */}
              <div className="xl:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                      ({kpis?.total_leads ?? 0}) Leads from source
                    </h2>
                    <span title="Distribution of inbound enquiries across verified real estate acquisition channels">
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowDetailsSourceView(!showDetailsSourceView)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                        showDetailsSourceView ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>Details View</span>
                      <SlidersHorizontal className="w-3 h-3" />
                    </button>
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 cursor-pointer focus:outline-hidden"
                    >
                      <option value="30days">Till Date ▾</option>
                      <option value="today">Today</option>
                      <option value="7days">Last 7 Days</option>
                      <option value="30days">Last 30 Days</option>
                    </select>
                  </div>
                </div>

                {/* 3 Columns Source Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
                  {/* Column 1: social profiles */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase pb-1">
                      social profiles
                    </div>
                    {sourcesGrouped.social.slice(0, 5).map((item) => {
                      const meta = getSourceMeta(item.source);
                      const pct = Math.max(8, Math.round((item.count / maxSourceCount) * 100));
                      return (
                        <div
                          key={item.source}
                          onClick={() => router.push(`/leads?source=${encodeURIComponent(item.source)}`)}
                          className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                            <span className={`w-5 h-5 rounded-sm ${meta.bg} ${meta.text} flex items-center justify-center text-[10px] font-bold shrink-0`}>
                              {meta.label.slice(0, 2).toUpperCase()}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-medium text-slate-700 truncate block group-hover:text-blue-600">
                                {meta.label}
                              </span>
                              <div className="w-full bg-slate-100 rounded-full h-1 mt-0.5 overflow-hidden">
                                <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-900 shrink-0">{item.count}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Column 2: 3rd party */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase pb-1">
                      3rd party
                    </div>
                    {sourcesGrouped.thirdParty.slice(0, 5).map((item) => {
                      const meta = getSourceMeta(item.source);
                      const pct = Math.max(8, Math.round((item.count / maxSourceCount) * 100));
                      return (
                        <div
                          key={item.source}
                          onClick={() => router.push(`/leads?source=${encodeURIComponent(item.source)}`)}
                          className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                            <span className={`w-5 h-5 rounded-sm ${meta.bg} ${meta.text} flex items-center justify-center text-[10px] font-bold shrink-0`}>
                              {meta.label.slice(0, 2).toUpperCase()}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-medium text-slate-700 truncate block group-hover:text-blue-600">
                                {meta.label}
                              </span>
                              <div className="w-full bg-slate-100 rounded-full h-1 mt-0.5 overflow-hidden">
                                <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-900 shrink-0">{item.count}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Column 3: others */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase pb-1">
                      others
                    </div>
                    {sourcesGrouped.others.slice(0, 5).map((item) => {
                      const meta = getSourceMeta(item.source);
                      const pct = Math.max(8, Math.round((item.count / maxSourceCount) * 100));
                      return (
                        <div
                          key={item.source}
                          onClick={() => router.push(`/leads?source=${encodeURIComponent(item.source)}`)}
                          className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                            <span className={`w-5 h-5 rounded-sm ${meta.bg} ${meta.text} flex items-center justify-center text-[10px] font-bold shrink-0`}>
                              {meta.label.slice(0, 2).toUpperCase()}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-medium text-slate-700 truncate block group-hover:text-blue-600">
                                {meta.label}
                              </span>
                              <div className="w-full bg-slate-100 rounded-full h-1 mt-0.5 overflow-hidden">
                                <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-900 shrink-0">{item.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Widget 2: Activity on Leads (Radar Polygon) */}
              <div className="xl:col-span-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-sm tracking-tight">Activity on leads</h3>
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Till Date ▾</span>
                </div>

                {/* Radar Chart Visual */}
                <div className="h-44 w-full my-auto flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={activityData}>
                      <PolarGrid stroke="#E2E8F0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 500 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                      <Radar
                        name="Activities"
                        dataKey="count"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.25}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend Beneath Chart */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-around gap-2 text-[11px] font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>{activityData.find(a => a.subject === 'whatsapp')?.count ?? 20} whatsapp</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>{activityData.find(a => a.subject === 'call')?.count ?? 14} call</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>{activityData.find(a => a.subject === 'sms')?.count ?? 4} sms</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>{activityData.find(a => a.subject === 'email')?.count ?? 6} email</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Leads Pipeline (Wide ~68%) + Total Bookings Gauge (~32%) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
              {/* Widget 3: Leads Pipeline */}
              <div className="xl:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">Leads pipeline</h3>
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push('/pipeline')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Full Kanban</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                    <span className="text-[11px] text-slate-400 font-medium">Till Date ▾</span>
                  </div>
                </div>

                {/* Pipeline Stages Counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 pb-3">
                  {pipelineSteps.slice(0, 5).map((step) => (
                    <div
                      key={step.stage}
                      onClick={() => router.push(`/leads?status=${encodeURIComponent(step.stage)}`)}
                      className="bg-slate-50 hover:bg-blue-50/60 border border-slate-100 rounded-lg p-2 transition-colors cursor-pointer"
                    >
                      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight truncate">
                        {step.stage === 'Contacted' ? 'In Engagement' : step.stage}
                      </div>
                      <div className="text-xl font-bold text-slate-900 mt-0.5">{step.count}</div>
                    </div>
                  ))}
                </div>

                {/* Progression Flow Curve Visual */}
                <div className="h-20 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={pipelineSteps.slice(0, 6).map((s) => ({ stage: s.stage, count: s.count }))}
                      margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="pipelineCurve" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="stage" tick={{ fill: '#64748B', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#64748B', fontSize: 9 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#100D2B', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                      />
                      <Area type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#pipelineCurve)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Widget 4: Total Bookings Gauge */}
              <div className="xl:col-span-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-sm tracking-tight">Total bookings</h3>
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Till Date ▾</span>
                </div>

                {/* Semi-Circle Progress Visualization */}
                <div className="flex flex-col items-center justify-center my-auto py-2">
                  <div className="relative w-36 h-24 flex items-center justify-center">
                    <svg className="w-32 h-20 overflow-visible" viewBox="0 0 100 50">
                      <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#F1F5F9"
                        strokeWidth="10"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="url(#bookingGauge)"
                        strokeWidth="10"
                        strokeDasharray="126"
                        strokeDashoffset={126 - (126 * Math.min(100, (kpis?.conversion_rate ?? 9) * 3)) / 100}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="bookingGauge" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#F59E0B" />
                          <stop offset="50%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#2563EB" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute bottom-0 text-center">
                      <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                        {kpis?.conversion_rate ?? 9.1}%
                      </span>
                      <span className="text-[10px] block text-slate-400 font-semibold uppercase mt-0.5">
                        Conversion
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <div className="text-xs font-bold text-slate-800">
                      {kpis?.booked_leads ?? 10} Confirmed Units Booked
                    </div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                      ₹{((kpis?.total_revenue ?? 0) / 10000000).toFixed(2)} Cr Realized Sales Value
                    </div>
                    <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">
                      Demo Seeded Values
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Target: 30 Units</span>
                  <span className="text-emerald-600 font-semibold">{Math.round(((kpis?.booked_leads ?? 10) / 30) * 100)}% to Goal</span>
                </div>
              </div>
            </div>

            {/* Widget 5: Agent Performance Table */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">Agent Performance Benchmarks</h3>
                  <span className="text-xs text-slate-400 font-normal hidden sm:inline">Active sales team metrics</span>
                </div>
                <button
                  onClick={() => router.push('/team')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>View Team Directory</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px]">
                      <th className="py-2 px-2">Agent Name</th>
                      <th className="py-2 px-2 text-center">Assigned Leads</th>
                      <th className="py-2 px-2 text-center">Visits Done</th>
                      <th className="py-2 px-2 text-center">Tasks Done</th>
                      <th className="py-2 px-2 text-center">Bookings</th>
                      <th className="py-2 px-2 text-right">Conversion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...(summary?.agent_performance || [])]
                      .sort((a, b) => b.bookings - a.bookings || b.leads - a.leads)
                      .slice(0, 6)
                      .map((agent) => (
                        <tr
                          key={agent.id}
                          onClick={() => router.push(`/leads?agent=${agent.id}`)}
                          className="hover:bg-blue-50/60 transition-colors cursor-pointer group"
                          title={`Click to view leads assigned to ${agent.name}`}
                        >
                          <td className="py-2.5 px-2 flex items-center gap-2 font-semibold text-slate-900 group-hover:text-blue-700">
                            <img
                              src={agent.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                              alt={agent.name}
                              className="w-6 h-6 rounded-full object-cover border border-slate-200"
                            />
                            <span>{agent.name}</span>
                          </td>
                          <td className="py-2.5 px-2 text-center font-medium text-slate-700">{agent.leads}</td>
                          <td className="py-2.5 px-2 text-center font-medium text-slate-700">{agent.visits}</td>
                          <td className="py-2.5 px-2 text-center font-medium text-slate-700">{agent.tasks_done ?? 6}</td>
                          <td className="py-2.5 px-2 text-center font-bold text-emerald-600">{agent.bookings}</td>
                          <td className="py-2.5 px-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-bold text-slate-900">{agent.conversion_rate}%</span>
                              <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-blue-600 h-full rounded-full"
                                  style={{ width: `${Math.min(100, agent.conversion_rate * 4)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ========================================================
              RIGHT-SIDE REMINDERS PANEL (LeadRat Screenshot Match)
              ======================================================== */}
          <div className="lg:col-span-4 xl:col-span-3 bg-[#11102D] text-slate-200 rounded-xl border border-[#211D4E] shadow-xl p-3.5 sm:p-4 space-y-4">
            {/* Header: Reminders + Month/Year Selector */}
            <div className="flex items-center justify-between pb-2 border-b border-[#242055]">
              <h3 className="font-bold text-white text-base tracking-tight">Reminders</h3>
              <div className="flex items-center gap-1.5">
                <select
                  value="10"
                  onChange={() => {}}
                  className="bg-[#1D1948] text-xs font-semibold text-slate-200 border border-[#2D2760] rounded-md px-2 py-1 appearance-none cursor-pointer focus:outline-hidden"
                >
                  <option value="10">May ▾</option>
                  <option value="11">Oct ▾</option>
                </select>
                <select
                  value="2026"
                  onChange={() => {}}
                  className="bg-[#1D1948] text-xs font-semibold text-slate-200 border border-[#2D2760] rounded-md px-2 py-1 appearance-none cursor-pointer focus:outline-hidden"
                >
                  <option value="2023">2023 ▾</option>
                  <option value="2026">2026 ▾</option>
                </select>
              </div>
            </div>

            {/* Horizontal Mini Week Calendar Strip */}
            <div className="grid grid-cols-7 gap-1 text-center py-1 bg-[#18143F] rounded-lg p-1.5 border border-[#241F58]">
              {calendarDays.map((day, idx) => {
                const isSelected = idx === activeDateIndex;
                return (
                  <button
                    key={day.dayNum}
                    onClick={() => setActiveDateIndex(idx)}
                    className={`flex flex-col items-center py-1.5 rounded-md transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#292263] text-white ring-1 ring-blue-400 font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-[9px] uppercase tracking-wider font-semibold">{day.dayName}</span>
                    <span className="text-xs font-bold mt-0.5">{day.dayNum}</span>
                    {/* Event dot indicators */}
                    <div className="flex gap-0.5 mt-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400" />
                      {idx % 2 === 0 && <span className="w-1 h-1 rounded-full bg-amber-400" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Counters Row */}
            <div className="flex items-center justify-between px-1 py-1.5 text-xs font-semibold text-slate-300">
              <button
                onClick={() => setSelectedReminderFilter(selectedReminderFilter === 'VISIT' ? 'ALL' : 'VISIT')}
                className={`flex items-center gap-1.5 cursor-pointer ${selectedReminderFilter === 'VISIT' ? 'text-emerald-400 font-bold' : ''}`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{String(kpis?.upcoming_site_visits ?? 18).padStart(2, '0')} Site Visits</span>
              </button>
              <button
                onClick={() => setSelectedReminderFilter(selectedReminderFilter === 'MEETING' ? 'ALL' : 'MEETING')}
                className={`flex items-center gap-1.5 cursor-pointer ${selectedReminderFilter === 'MEETING' ? 'text-amber-400 font-bold' : ''}`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>{String(kpis?.meetings_scheduled ?? 21).padStart(2, '0')} Meetings</span>
              </button>
              <button
                onClick={() => setSelectedReminderFilter(selectedReminderFilter === 'CALL' ? 'ALL' : 'CALL')}
                className={`flex items-center gap-1.5 cursor-pointer ${selectedReminderFilter === 'CALL' ? 'text-sky-400 font-bold' : ''}`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>{String(kpis?.callbacks_due ?? 20).padStart(2, '0')} Callbacks</span>
              </button>
            </div>

            {/* Upcoming Timeline Grouped by Tomorrow / Today */}
            <div className="space-y-3 pt-2 max-h-[500px] overflow-y-auto scrollbar-none pr-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Tomorrow
              </div>

              {filteredReminders.slice(0, 8).map((rem, idx) => {
                const isVisit = rem.type.toLowerCase().includes('visit');
                const isMeeting = rem.type.toLowerCase().includes('meeting');
                const barColor = isVisit ? 'border-l-emerald-400' : (isMeeting ? 'border-l-amber-400' : 'border-l-sky-400');
                const badgeColor = isVisit ? 'text-emerald-400' : (isMeeting ? 'text-amber-400' : 'text-sky-400');

                return (
                  <div
                    key={rem.id || idx}
                    onClick={() => openLeadDetails(rem.lead_id)}
                    className={`bg-[#18143F] hover:bg-[#201A52] rounded-lg p-2.5 border border-[#262058] border-l-4 ${barColor} transition-all cursor-pointer flex items-start justify-between gap-2 group`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-200">{rem.time}</span>
                        <span className="text-[10px] text-slate-400 font-medium">| {rem.agent_name}</span>
                      </div>
                      <p className="text-xs font-semibold text-white mt-1 group-hover:text-blue-300 transition-colors truncate">
                        {rem.title}
                      </p>
                      {rem.project_name && (
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          📍 {rem.project_name}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                  </div>
                );
              })}

              {filteredReminders.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No scheduled activities found for this filter.
                </div>
              )}
            </div>

            {/* Quick Action Footer inside Reminders Panel */}
            <div className="pt-2 border-t border-[#242055] grid grid-cols-2 gap-2">
              <button
                onClick={() => router.push('/site-visits')}
                className="w-full py-1.5 px-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center"
              >
                + Site Visit
              </button>
              <button
                onClick={() => router.push('/follow-ups')}
                className="w-full py-1.5 px-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center"
              >
                + Follow-up
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
