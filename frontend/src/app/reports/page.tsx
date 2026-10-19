'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Download,
  Search,
  RotateCw,
  Filter,
  Calendar,
  Clock,
  Phone,
  MessageSquare,
  Mail,
  MessageCircle,
  Users,
  MapPin,
  CalendarCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Building2,
  CheckCircle2,
  Bell,
  Eye,
  Plus,
  ArrowUpDown,
  FileSpreadsheet,
  Globe,
  Share2,
  Shield,
  Briefcase
} from 'lucide-react';
import {
  ResponsiveContainer,
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
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  api,
  DashboardSummary,
  UserActivityRow,
  UserActivityResponse,
  Project,
  User as UserType,
  TeamMember
} from '@/lib/api';
import { Button } from '@/components/ui/Button';

// Color definitions matching Leadrat CRM UI
const TEAL_ACCENT = '#20C997';
const TEAL_DARK = '#0D9488';
const NAVY_HEADER = '#101426';
const NAVY_SURFACE = '#151A30';

function ReportsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Tab: 'activity' | 'lead-status' | 'project' | 'source' | 'sub-source' | 'agency' | 'visit-meeting'
  const initialTab = searchParams.get('tab') || 'lead-status';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Sync tab with URL query parameter
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/reports?tab=${tab}`);
  };

  // =========================================================================
  // 1. ACTIVITY REPORT STATE (Images 2 & 3: Leadrat CRM | User Activity Report)
  // =========================================================================
  const [activityData, setActivityData] = useState<UserActivityResponse | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);

  // Activity Filters
  const [selectedUserFilter, setSelectedUserFilter] = useState('');
  const [withTeam, setWithTeam] = useState(false);
  const [dateFilter, setDateFilter] = useState('today'); // 'today' | 'yesterday' | '7days' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Team list for dropdown
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Fetch Activity Report data
  const fetchActivityReport = useCallback(async () => {
    setActivityLoading(true);
    setActivityError(null);
    try {
      const res = await api.getUserActivityReport({
        date_filter: dateFilter,
        start_date: customStartDate || undefined,
        end_date: customEndDate || undefined,
        user_id: selectedUserFilter || undefined,
        with_team: withTeam,
        search: searchUserQuery || undefined,
        page: currentPage,
        page_size: pageSize,
      });
      setActivityData(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActivityError(err.message);
      } else {
        setActivityError('Failed to load user activity report.');
      }
    } finally {
      setActivityLoading(false);
    }
  }, [dateFilter, customStartDate, customEndDate, selectedUserFilter, withTeam, searchUserQuery, currentPage, pageSize]);

  useEffect(() => {
    if (activeTab === 'activity') {
      fetchActivityReport();
    }
  }, [activeTab, fetchActivityReport]);

  // Load team & projects
  useEffect(() => {
    api.getTeamMembers().then((res) => {
      const list = Array.isArray(res) ? res : res.results;
      setTeamMembers(list || []);
    });
    api.getProjects().then((res) => {
      const list = Array.isArray(res) ? res : res.results;
      setProjects(list || []);
    });
  }, []);

  // Handle Export CSV
  const handleExportUserActivityCSV = () => {
    const url = api.getExportUserActivityCsvUrl({
      date_filter: dateFilter,
      start_date: customStartDate || undefined,
      end_date: customEndDate || undefined,
      user_id: selectedUserFilter || undefined,
      with_team: withTeam,
      search: searchUserQuery || undefined,
    });
    window.open(url, '_blank');
  };

  const handleResetFilters = () => {
    setSelectedUserFilter('');
    setWithTeam(false);
    setDateFilter('today');
    setCustomStartDate('');
    setCustomEndDate('');
    setSearchUserQuery('');
    setCurrentPage(1);
  };

  // =========================================================================
  // 2. LEAD STATUS DASHBOARD STATE (Image 1: Leadrat CRM Lead Status)
  // =========================================================================
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [detailsView, setDetailsView] = useState(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState(3); // Thursday 11 default like in screenshot

  const fetchDashboardSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await api.getDashboardSummary({ time_range: '30days' });
      setSummary(res);
    } catch (e) {
      console.error(e);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'lead-status') {
      fetchDashboardSummary();
    }
  }, [activeTab, fetchDashboardSummary]);

  // Radar chart data for Activity on Leads
  const radarData = useMemo(() => {
    const act = summary?.activity_breakdown || {
      whatsapp: 20,
      call: 14,
      sms: 4,
      email: 6,
    };
    return [
      { subject: 'whatsapp', value: act.whatsapp, fullMark: 30 },
      { subject: 'call', value: act.call, fullMark: 30 },
      { subject: 'email', value: act.email, fullMark: 30 },
      { subject: 'sms', value: act.sms, fullMark: 30 },
    ];
  }, [summary]);

  // Pipeline funnel curve data
  const pipelineFunnelData = useMemo(() => {
    return [
      { stage: 'New', count: 65 },
      { stage: 'In Engagement', count: 108 },
      { stage: 'Site Visit Scheduled', count: 60 },
      { stage: 'Site Visit Done', count: 84 },
      { stage: 'Booked', count: 33 },
    ];
  }, []);

  // Calendar dates for May 2023 or current week matching Image 1
  const weekDays = [
    { day: 'Mon', date: 8, visits: 2, meetings: 1, callbacks: 0 },
    { day: 'Tue', date: 9, visits: 3, meetings: 2, callbacks: 1 },
    { day: 'Wed', date: 10, visits: 1, meetings: 0, callbacks: 0 },
    { day: 'Thu', date: 11, visits: 4, meetings: 2, callbacks: 0, active: true },
    { day: 'Fri', date: 12, visits: 5, meetings: 3, callbacks: 2 },
    { day: 'Sat', date: 13, visits: 2, meetings: 1, callbacks: 0 },
  ];

  // Schedule items for Reminders panel
  const reminderItems = [
    { time: '10:00 am', agent: 'Varun K', type: 'Site Visit', lead: 'Vineeth Kumar', border: 'border-l-emerald-500' },
    { time: '12:00 pm', agent: 'Ravi K', type: 'Meeting', lead: 'Leo Philips', border: 'border-l-amber-500' },
    { time: '01:00 pm', agent: 'Himanshu', type: 'Site Visit', lead: 'Angel Herwitz', border: 'border-l-emerald-500' },
    { time: '02:30 pm', agent: 'S Nowlak', type: 'Meeting', lead: 'Leo Philips', border: 'border-l-amber-500' },
    { time: '05:30 pm', agent: 'Vedanshi S', type: 'Site Visit', lead: 'Ashlynn Westervelt', border: 'border-l-emerald-500' },
    { time: '07:00 pm', agent: 'Varun K', type: 'Site Visit', lead: 'Lydia Geidt', border: 'border-l-emerald-500' },
  ];

  // =========================================================================
  // RENDER UI
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#F5F7FB] -m-3 sm:-m-4 md:-m-6 text-slate-800">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TOP HEADER SUB-NAVIGATION (Reports Dropdown Tabs)                    */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-[#101426] text-white px-4 sm:px-6 py-2.5 border-b border-[#1E2538] flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mr-2 hidden md:inline">
            Reports:
          </span>
          {[
            { id: 'lead-status', label: 'Lead Status' },
            { id: 'activity', label: 'Activity' },
            { id: 'project', label: 'Project' },
            { id: 'source', label: 'Source' },
            { id: 'sub-source', label: 'Sub-Source' },
            { id: 'agency', label: 'Agency' },
            { id: 'visit-meeting', label: 'Visit & Meeting' },
          ].map((tab) => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isTabActive
                    ? 'bg-[#20C997] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportUserActivityCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#20C997] hover:bg-[#1BA87E] text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data Tracker</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* VIEW 1: ACTIVITY REPORTS (IMAGES 2 & 3)                             */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'activity' && (
        <div className="p-4 sm:p-6 space-y-4">
          {/* Header Title */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#1E2538]">Activity Reports</h1>
          </div>

          {/* Filter Bar (Matching Image 2) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* User Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase">USER</span>
                <div className="relative min-w-[200px]">
                  <select
                    value={selectedUserFilter}
                    onChange={(e) => setSelectedUserFilter(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#20C997]"
                  >
                    <option value="">ex. Manasa Pampana (All Users)</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.display_name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* With Team Checkbox */}
                <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer select-none ml-2">
                  <input
                    type="checkbox"
                    checked={withTeam}
                    onChange={(e) => setWithTeam(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-[#20C997] focus:ring-[#20C997]"
                  />
                  <span>With Team</span>
                </label>
              </div>

              {/* Date Filters (Pills) */}
              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
                  DAILY ACTIVITY DATE FILTERS
                </span>
                <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-50 text-xs">
                  {[
                    { id: 'today', label: 'Today' },
                    { id: 'yesterday', label: 'yesterday' },
                    { id: '7days', label: 'Last 7 days' },
                    { id: 'custom', label: 'Custom' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setDateFilter(filter.id)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                        dateFilter === filter.id
                          ? 'bg-[#20C997] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Refresh Icon */}
                <button
                  onClick={fetchActivityReport}
                  title="Reload Activities"
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-[#20C997] transition-colors cursor-pointer"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${activityLoading ? 'animate-spin text-[#20C997]' : ''}`} />
                </button>
              </div>

              {/* Custom Date Pickers if selected */}
              {dateFilter === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 font-medium"
                  />
                  <span className="text-xs text-slate-400">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 font-medium"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons: Reset & Search */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetFilters}
                className="px-4 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  setCurrentPage(1);
                  fetchActivityReport();
                }}
                className="px-5 py-1.5 rounded bg-[#101426] hover:bg-[#1a213f] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                Search
              </button>
            </div>
          </div>

          {/* Table Controls (Search for User, Export button, Show Entries) */}
          <div className="bg-white p-3 rounded-t-xl border-x border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search for User  [Press enter to search]"
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setCurrentPage(1);
                      fetchActivityReport();
                    }
                  }}
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#20C997]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportUserActivityCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#20C997] hover:bg-[#1BA87E] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span>Show Entries</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {activityError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{activityError}</span>
            </div>
          )}

          {/* Main Activity Table (Pixel-perfect matching Image 2 & 3) */}
          <div className="bg-white border border-slate-200 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap min-w-[1400px]">
              {/* Header row: Dark Navy */}
              <thead className="bg-[#101426] text-white font-semibold text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="p-2.5 pl-4 border-r border-[#1C223C] w-48">
                    <div className="flex items-center gap-1.5 cursor-pointer">
                      <span>USER NAME</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-2.5 text-center border-r border-[#1C223C]">WORKING HOURS</th>
                  <th className="p-2.5 text-center border-r border-[#1C223C]">CALLS</th>
                  <th className="p-2.5 text-center border-r border-[#1C223C]">WHATSAPP</th>
                  <th className="p-2.5 text-center border-r border-[#1C223C]">EMAIL</th>
                  <th className="p-2.5 text-center border-r border-[#1C223C]">SMS</th>
                  <th className="p-2.5 text-center border-r border-[#1C223C]">STATUS EDITS</th>
                  <th className="p-2.5 text-center border-r border-[#1C223C]">FORM EDITS</th>
                  <th className="p-2.5 text-center border-r border-[#1C223C]">NOTES ADDED</th>
                  <th className="p-2.5 text-center border-r border-[#1C223C]">MEETING SCHEDULED</th>
                  <th className="p-2.5 text-center border-r border-[#1C223C]">SITE VISIT SCHEDULED</th>
                  <th className="p-2.5 text-center border-r border-[#1C223C]">CALLBACK</th>
                  <th className="p-2.5 text-center border-r border-[#1C223C]">BOOKED</th>
                  <th className="p-2.5 text-center">DROPPED</th>
                </tr>
              </thead>

              {/* Rows */}
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {activityLoading ? (
                  <tr>
                    <td colSpan={14} className="p-10 text-center text-slate-400">
                      <div className="inline-flex items-center gap-2">
                        <RotateCw className="w-4 h-4 animate-spin text-[#20C997]" />
                        <span>Loading activity records...</span>
                      </div>
                    </td>
                  </tr>
                ) : activityData?.results && activityData.results.length > 0 ? (
                  activityData.results.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* USER NAME */}
                      <td className="p-2.5 pl-4 font-semibold text-slate-900 border-r border-slate-100">
                        {row.user_name}
                      </td>

                      {/* WORKING HOURS */}
                      <td className="p-2.5 text-center border-r border-slate-100 font-mono text-[11px] text-slate-600">
                        {row.working_hours || '--'}
                      </td>

                      {/* CALLS */}
                      <td className="p-2.5 text-center border-r border-slate-100">
                        <div className="font-bold text-slate-900">{row.calls ?? '--'}</div>
                        <div className="text-[10px] text-slate-400">
                          unique leads: {row.unique_leads_calls ?? '--'}
                        </div>
                      </td>

                      {/* WHATSAPP */}
                      <td className="p-2.5 text-center border-r border-slate-100">
                        <div className="font-bold text-slate-900">{row.whatsapp ?? '--'}</div>
                        <div className="text-[10px] text-slate-400">
                          unique leads: {row.unique_leads_whatsapp ?? '--'}
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td className="p-2.5 text-center border-r border-slate-100">
                        <div className="font-bold text-slate-900">{row.email_count ?? '--'}</div>
                        <div className="text-[10px] text-slate-400">
                          unique leads: {row.unique_leads_email ?? '--'}
                        </div>
                      </td>

                      {/* SMS */}
                      <td className="p-2.5 text-center border-r border-slate-100">
                        <div className="font-bold text-slate-900">{row.sms ?? '--'}</div>
                        <div className="text-[10px] text-slate-400">
                          unique leads: {row.unique_leads_sms ?? '--'}
                        </div>
                      </td>

                      {/* STATUS EDITS */}
                      <td className="p-2.5 text-center border-r border-slate-100">
                        <div className="font-bold text-slate-900">{row.status_edits ?? '--'}</div>
                        <div className="text-[10px] text-slate-400">
                          unique leads: {row.unique_leads_status_edits ?? '--'}
                        </div>
                      </td>

                      {/* FORM EDITS */}
                      <td className="p-2.5 text-center border-r border-slate-100">
                        <div className="font-bold text-slate-900">{row.form_edits ?? '--'}</div>
                        <div className="text-[10px] text-slate-400">
                          unique leads: {row.unique_leads_form_edits ?? '--'}
                        </div>
                      </td>

                      {/* NOTES ADDED */}
                      <td className="p-2.5 text-center border-r border-slate-100">
                        <div className="font-bold text-slate-900">{row.notes_added ?? '--'}</div>
                        <div className="text-[10px] text-slate-400">
                          unique leads: {row.unique_leads_notes_added ?? '--'}
                        </div>
                      </td>

                      {/* MEETING SCHEDULED */}
                      <td className="p-2.5 text-center border-r border-slate-100">
                        <div className="font-bold text-slate-900">{row.meeting_scheduled ?? '--'}</div>
                        <div className="text-[10px] text-slate-400">
                          meetings done: {row.meetings_done ?? '--'}
                        </div>
                      </td>

                      {/* SITE VISIT SCHEDULED */}
                      <td className="p-2.5 text-center border-r border-slate-100">
                        <div className="font-bold text-slate-900">{row.site_visit_scheduled ?? '--'}</div>
                        <div className="text-[10px] text-slate-400">
                          site-visits done: {row.site_visits_done ?? '--'}
                        </div>
                      </td>

                      {/* CALLBACK */}
                      <td className="p-2.5 text-center font-bold text-slate-900 border-r border-slate-100">
                        {row.callback ?? '--'}
                      </td>

                      {/* BOOKED */}
                      <td className="p-2.5 text-center font-bold text-emerald-600 border-r border-slate-100">
                        {row.booked ?? '--'}
                      </td>

                      {/* DROPPED */}
                      <td className="p-2.5 text-center font-bold text-rose-600">
                        {row.dropped ?? '--'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={14} className="p-10 text-center text-slate-400">
                      No user activity records found for the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer & Pagination */}
          <div className="bg-white p-3 rounded-b-xl border-x border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing {activityData?.count ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, activityData?.count || 0)} of {activityData?.count || 0} entries
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: activityData?.total_pages || 1 }, (_, i) => i + 1)
                .slice(0, 5)
                .map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded text-xs font-semibold cursor-pointer transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#20C997] text-white shadow-xs'
                        : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

              <button
                disabled={currentPage >= (activityData?.total_pages || 1)}
                onClick={() => setCurrentPage((p) => Math.min(activityData?.total_pages || 1, p + 1))}
                className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* VIEW 2: LEAD STATUS REPORT (IMAGE 1)                                */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'lead-status' && (
        <div className="p-3 sm:p-4 md:p-6 space-y-4">
          {/* Top Dark Bar KPI Strip (Matching Image 1) */}
          <div className="bg-[#101426] text-white rounded-xl p-4 shadow-sm border border-[#1E2538]">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-[#1E2538]">
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                  Easy GharOffice Solutions Pvt. Ltd.
                </span>
                <span className="text-xs bg-[#1E2538] text-slate-300 px-2 py-0.5 rounded flex items-center gap-1">
                  <span>Team Dashboard</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </span>
                <span className="text-xs bg-[#1E2538] text-slate-300 px-2 py-0.5 rounded flex items-center gap-1">
                  <span>My team</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </span>
              </div>
            </div>

            {/* Top KPI Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-[#1E2538]">
              <div className="pt-2 sm:pt-0 sm:px-3">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Leads</div>
                <div className="text-2xl font-black text-white mt-0.5">
                  {summary?.kpis.total_leads || 469}
                </div>
              </div>
              <div className="pt-2 sm:pt-0 sm:px-3">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Active</div>
                <div className="text-2xl font-black text-[#20C997] mt-0.5">
                  {summary?.kpis.active_leads || 108}
                </div>
              </div>
              <div className="pt-2 sm:pt-0 sm:px-3">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Unassigned</div>
                <div className="text-2xl font-black text-amber-400 mt-0.5">
                  {summary?.kpis.unassigned_leads || 69}
                </div>
              </div>
              <div className="pt-2 sm:pt-0 sm:px-3">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Deleted</div>
                <div className="text-2xl font-black text-slate-400 mt-0.5">
                  165
                </div>
              </div>
              <div className="pt-2 sm:pt-0 sm:px-3">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Booked</div>
                <div className="text-2xl font-black text-emerald-400 mt-0.5">
                  {summary?.kpis.booked_leads || 33}
                </div>
              </div>
              <div className="pt-2 sm:pt-0 sm:px-3">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Not Interested</div>
                <div className="text-2xl font-black text-rose-400 mt-0.5">
                  {summary?.kpis.not_interested_leads || 49}
                </div>
              </div>
              <div className="pt-2 sm:pt-0 sm:px-3">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Dropped</div>
                <div className="text-2xl font-black text-rose-500 mt-0.5">
                  {summary?.kpis.dropped_leads || 45}
                </div>
              </div>
            </div>
          </div>

          {/* Action Counters Row (Matching Image 1) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* New */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">New</span>
                <div className="text-xl font-bold text-slate-900 mt-0.5">
                  {String(summary?.kpis.new_leads || 8).padStart(2, '0')}
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Plus className="w-4 h-4" />
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white p-3.5 rounded-xl border-l-4 border-l-rose-500 border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Pending</span>
                <div className="text-xl font-bold text-slate-900 mt-0.5">
                  {String(summary?.kpis.pending_leads || 10).padStart(2, '0')}
                </div>
              </div>
              <Clock className="w-5 h-5 text-rose-400" />
            </div>

            {/* Callbacks */}
            <div className="bg-white p-3.5 rounded-xl border-l-4 border-l-blue-500 border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Callbacks</span>
                <div className="text-xl font-bold text-slate-900 mt-0.5">
                  {String(summary?.kpis.callbacks_due || 11).padStart(2, '0')}
                </div>
              </div>
              <Phone className="w-5 h-5 text-blue-500" />
            </div>

            {/* Meeting scheduled */}
            <div className="bg-white p-3.5 rounded-xl border-l-4 border-l-amber-500 border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Meeting scheduled</span>
                <div className="text-xl font-bold text-slate-900 mt-0.5">
                  {String(summary?.kpis.meetings_scheduled || 40).padStart(2, '0')}
                </div>
              </div>
              <MapPin className="w-5 h-5 text-amber-500" />
            </div>

            {/* Site visit scheduled */}
            <div className="bg-white p-3.5 rounded-xl border-l-4 border-l-emerald-500 border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Site visit scheduled</span>
                <div className="text-xl font-bold text-slate-900 mt-0.5">
                  {String(summary?.kpis.site_visits_scheduled || 60).padStart(2, '0')}
                </div>
              </div>
              <CalendarCheck className="w-5 h-5 text-emerald-500" />
            </div>

            {/* Overdue */}
            <div className="bg-white p-3.5 rounded-xl border-l-4 border-l-red-500 border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Overdue</span>
                <div className="text-xl font-bold text-slate-900 mt-0.5">
                  {String(summary?.kpis.overdue_followups || 42).padStart(2, '0')}
                </div>
              </div>
              <Bell className="w-5 h-5 text-rose-500" />
            </div>
          </div>

          {/* Main Grid: Left Analytics Cards (2/3) + Right Reminders Panel (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left 2 Columns */}
            <div className="lg:col-span-2 space-y-4">
              {/* Card 1: Leads from source (Matching Image 1) */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-800">Leads from source</span>
                    <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-500 text-[10px] flex items-center justify-center font-bold">
                      i
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer">
                      <span>Details View</span>
                      <input
                        type="checkbox"
                        checked={detailsView}
                        onChange={(e) => setDetailsView(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-7 h-4 bg-slate-300 peer-checked:bg-[#20C997] rounded-full relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-3" />
                    </label>

                    <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-1">
                      <span>Till Date</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* 3 Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category 1: Social Profiles / Paid */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 pb-1">social profiles</div>
                    {[
                      { name: 'Facebook', count: 120, bg: 'bg-blue-50', text: 'text-blue-700' },
                      { name: 'Google Ads', count: 14, bg: 'bg-amber-50', text: 'text-amber-700' },
                      { name: 'Google Form', count: 56, bg: 'bg-emerald-50', text: 'text-emerald-700' },
                      { name: 'Gmail', count: 30, bg: 'bg-rose-50', text: 'text-rose-700' },
                      { name: 'Instagram', count: 23, bg: 'bg-purple-50', text: 'text-purple-700' },
                    ].map((s) => (
                      <div
                        key={s.name}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
                      >
                        <span className="text-xs font-medium text-slate-700">{s.name}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${s.bg} ${s.text}`}>
                          {s.count}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Category 2: 3rd Party Portals */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 pb-1">3rd party</div>
                    {[
                      { name: 'Housing', count: 50, bg: 'bg-yellow-50', text: 'text-yellow-700' },
                      { name: 'Magicbricks', count: 25, bg: 'bg-red-50', text: 'text-red-700' },
                      { name: '99acres', count: 11, bg: 'bg-blue-50', text: 'text-blue-700' },
                      { name: 'QuikrHomes', count: 29, bg: 'bg-emerald-50', text: 'text-emerald-700' },
                      { name: 'Just Lead', count: 14, bg: 'bg-sky-50', text: 'text-sky-700' },
                    ].map((s) => (
                      <div
                        key={s.name}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
                      >
                        <span className="text-xs font-medium text-slate-700">{s.name}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${s.bg} ${s.text}`}>
                          {s.count}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Category 3: Others */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 pb-1">others</div>
                    {[
                      { name: 'Website', count: 48, bg: 'bg-teal-50', text: 'text-teal-700' },
                      { name: 'Direct/Walkin', count: 9, bg: 'bg-slate-100', text: 'text-slate-700' },
                      { name: 'QR Code', count: 4, bg: 'bg-amber-50', text: 'text-amber-700' },
                    ].map((s) => (
                      <div
                        key={s.name}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
                      >
                        <span className="text-xs font-medium text-slate-700">{s.name}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${s.bg} ${s.text}`}>
                          {s.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row: Activity on Leads (Radar Chart) + Total Bookings Gauge */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Radar Chart: Activity on leads */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-800">Activity on leads</span>
                      <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-500 text-[10px] flex items-center justify-center font-bold">
                        i
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-1">
                      <span>Till Date</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>

                  {/* Radar Diagram */}
                  <div className="h-52 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                        <PolarGrid stroke="#E2E8F0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 30]} tick={false} axisLine={false} />
                        <Radar name="Activity" dataKey="value" stroke="#20C997" fill="#20C997" fillOpacity={0.35} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend matching Image 1 */}
                  <div className="flex items-center justify-center gap-4 text-xs font-semibold pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs" />
                      <span>20 whatsapp</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-600">
                      <span className="w-2.5 h-2.5 bg-rose-500 rounded-xs" />
                      <span>14 call</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-600">
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs" />
                      <span>04 sms</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-xs" />
                      <span>06 email</span>
                    </div>
                  </div>
                </div>

                {/* Total Bookings Gauge & Target */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-800">Total bookings</span>
                      <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-500 text-[10px] flex items-center justify-center font-bold">
                        i
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-1">
                      <span>Till Date</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>

                  {/* Gauge Arc Graphic */}
                  <div className="h-52 flex flex-col items-center justify-center">
                    <div className="relative w-40 h-28 flex items-end justify-center">
                      <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
                        {/* Background track */}
                        <path
                          d="M 10 50 A 40 40 0 0 1 90 50"
                          fill="none"
                          stroke="#E2E8F0"
                          strokeWidth="8"
                          strokeLinecap="round"
                        />
                        {/* Progress arc (30%) */}
                        <path
                          d="M 10 50 A 40 40 0 0 1 38 18"
                          fill="none"
                          stroke="#E11D48"
                          strokeWidth="8"
                          strokeLinecap="round"
                        />
                        {/* Target marker indicator */}
                        <circle cx="38" cy="18" r="5" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
                      </svg>
                      <div className="absolute bottom-0 text-center">
                        <div className="text-3xl font-black text-slate-900">30%</div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Target Achieved</div>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <span className="text-xs text-slate-500 font-medium">33 Confirmed Sales out of 110 Goal</span>
                    </div>
                  </div>

                  <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-400">
                    Calculated against monthly gross booking target
                  </div>
                </div>
              </div>

              {/* Leads Pipeline Wave Area Curve (Matching Image 1) */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-800">Leads pipeline</span>
                    <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-500 text-[10px] flex items-center justify-center font-bold">
                      i
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-1">
                    <span>Till Date</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                </div>

                {/* Pipeline Stats Badges */}
                <div className="grid grid-cols-5 gap-2 text-center mb-3">
                  {pipelineFunnelData.map((stage) => (
                    <div key={stage.stage} className="p-2 bg-slate-50/80 rounded-lg">
                      <div className="text-[11px] font-medium text-slate-500 truncate">{stage.stage}</div>
                      <div className="text-lg font-bold text-slate-900 mt-0.5">{stage.count}</div>
                    </div>
                  ))}
                </div>

                {/* Spline Area Funnel */}
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={pipelineFunnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="pipelineGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#20C997" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#20C997" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="stage" hide />
                      <YAxis hide />
                      <Tooltip contentStyle={{ backgroundColor: '#101426', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                      <Area type="monotone" dataKey="count" stroke="#20C997" strokeWidth={3} fill="url(#pipelineGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Column: Reminders Calendar & Timeline (Matching Image 1) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                {/* Reminders Header with Month & Year Selectors */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-bold text-base text-slate-900">Reminders</span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded px-2 py-1 font-semibold">
                      <span>May</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded px-2 py-1 font-semibold">
                      <span>2023</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Calendar Day Selector Strip */}
                <div className="grid grid-cols-6 gap-1.5 my-3 text-center">
                  {weekDays.map((d, index) => (
                    <button
                      key={d.date}
                      onClick={() => setSelectedDayIndex(index)}
                      className={`py-2 px-1 rounded-lg transition-all cursor-pointer ${
                        selectedDayIndex === index
                          ? 'bg-[#101426] text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold">{d.day}</div>
                      <div className="text-xs font-black mt-0.5">{d.date}</div>
                      {selectedDayIndex === index && (
                        <div className="flex justify-center gap-0.5 mt-1">
                          <span className="w-1 h-1 rounded-full bg-[#20C997]" />
                          <span className="w-1 h-1 rounded-full bg-amber-400" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Summary counters for selected day */}
                <div className="grid grid-cols-3 gap-2 py-2.5 my-2 border-y border-slate-100 text-xs font-bold text-center">
                  <div className="text-emerald-700">
                    <span className="text-sm font-black">04</span> Site Visits
                  </div>
                  <div className="text-amber-700">
                    <span className="text-sm font-black">02</span> Meetings
                  </div>
                  <div className="text-blue-700">
                    <span className="text-sm font-black">00</span> Callbacks
                  </div>
                </div>

                {/* "Tomorrow" / "Today" Schedule Timeline List */}
                <div className="mt-3">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Tomorrow
                  </div>

                  <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-none">
                    {reminderItems.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg bg-slate-50/80 border-l-4 ${item.border} hover:bg-slate-100/80 transition-colors flex items-start justify-between gap-2`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-900">{item.time}</span>
                            <span className="text-[10px] text-slate-400">({item.agent})</span>
                          </div>
                          <div className="text-xs font-medium text-slate-700">
                            {item.type} scheduled with <span className="font-bold text-slate-900">{item.lead}</span>
                          </div>
                        </div>

                        <div className="shrink-0 pt-0.5">
                          {item.type === 'Site Visit' ? (
                            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 text-center">
                <button
                  onClick={() => router.push('/site-visits')}
                  className="text-xs font-semibold text-[#20C997] hover:underline cursor-pointer"
                >
                  View full schedule in Calendar →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* VIEW 3: PROJECT REPORT                                              */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'project' && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#1E2538]">Project Reports & Unit Absorption</h1>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportUserActivityCSV}
            >
              Export Project Metrics
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.map((p) => (
              <div key={p.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">{p.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{p.location}, {p.city}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <span>Total Units: {p.total_units}</span>
                  <span className="text-[#20C997]">₹{(Number(p.price_min || 0) / 10000000).toFixed(1)} Cr+</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* VIEW 4: SOURCE REPORT                                               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'source' && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#1E2538]">Acquisition Sources & Marketing ROI</h1>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportUserActivityCSV}
            >
              Export Sources CSV
            </Button>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Facebook', count: 120 },
                    { name: 'Housing', count: 50 },
                    { name: 'Website', count: 48 },
                    { name: 'Google Form', count: 56 },
                    { name: 'Magicbricks', count: 25 },
                    { name: 'QuikrHomes', count: 29 },
                    { name: 'Instagram', count: 23 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#101426', color: '#fff', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#20C997" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* VIEW 5: VISIT & MEETING REPORT                                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'visit-meeting' && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#1E2538]">Site Visits & Client Meetings Performance</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Site Visits Scheduled</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">60</div>
              <p className="text-xs text-slate-500 mt-0.5">High-intent property walkthroughs</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Site Visits Completed</span>
              <div className="text-2xl font-black text-indigo-600 mt-1">84</div>
              <p className="text-xs text-slate-500 mt-0.5">Verified on-site customer inspections</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Meetings Scheduled</span>
              <div className="text-2xl font-black text-amber-600 mt-1">40</div>
              <p className="text-xs text-slate-500 mt-0.5">Face-to-face and virtual consultations</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F7FB] -m-3 sm:-m-4 md:-m-6 p-8 flex items-center justify-center text-slate-500 text-xs">
          <RotateCw className="w-5 h-5 animate-spin text-[#20C997] mr-2" />
          <span>Loading Reports...</span>
        </div>
      }
    >
      <ReportsContent />
    </React.Suspense>
  );
}
