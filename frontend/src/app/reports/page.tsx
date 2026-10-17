'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  PieChart as PieIcon,
  Award,
  Users,
  MapPin,
  Clock,
  IndianRupee,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { api, DashboardSummary, Project, User as UserType } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { TableSkeleton } from '@/components/ui/EmptyState';

const PALETTE = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

export default function ReportsPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [agentReports, setAgentReports] = useState<Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    total_leads: number;
    completed_visits: number;
    completed_tasks: number;
    booked_leads: number;
    conversion_rate: number;
  }>>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumRes, agentRes] = await Promise.all([
        api.getDashboardSummary({
          time_range: timeRange,
          project_id: selectedProject || undefined,
          agent_id: selectedAgent || undefined,
        }),
        api.getReport('agent-performance') as Promise<typeof agentReports>,
      ]);
      setSummary(sumRes);
      setAgentReports(agentRes || []);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, selectedProject, selectedAgent]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    api.getProjects().then((res) => {
      const list = Array.isArray(res) ? res : res.results;
      setProjects(list || []);
    });
    api.getTeamMembers().then((res) => {
      const list = Array.isArray(res) ? res : (res as { results?: UserType[] }).results;
      setTeamMembers(list || []);
    });
  }, []);

  const handleExportCSV = () => {
    const url = api.getExportCsvUrl({
      interested_project: selectedProject || undefined,
      assigned_agent: selectedAgent || undefined,
    });
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Reports & Performance Analytics</h2>
          <p className="text-xs text-slate-500">
            Real estate funnel velocity, acquisition sources, executive conversions, and audit logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCSV}
          >
            Export Detailed CSV
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
            {[
              { id: 'today', label: 'Today' },
              { id: '7days', label: 'Last 7 Days' },
              { id: '30days', label: 'Last 30 Days' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  timeRange === t.id
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Executives</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.display_name}
              </option>
            ))}
          </select>
        </div>

        <Button variant="outline" size="sm" onClick={fetchReports} isLoading={isLoading}>
          Recalculate Metrics
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Definitions & Funnel Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Gross Enquiries</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{summary?.kpis.total_leads || 0}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Total inbound prospects</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Scheduled Tours</span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">
            {summary?.kpis.upcoming_site_visits || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">High intent project inspections</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Confirmed Bookings</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {summary?.kpis.booked_leads || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Sale contracts confirmed</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Overall Conversion</span>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {summary?.kpis.conversion_rate || 0}%
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">End-to-end sales efficiency</p>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Stage Distribution Bar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800">Pipeline Funnel Distribution</h3>
            <p className="text-xs text-slate-400">Prospect counts per workflow stage</p>
          </div>
          <div className="h-64 w-full">
            {summary?.pipeline_funnel ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.pipeline_funnel} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="stage" angle={-30} textAnchor="end" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Source Distribution Pie */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800">Channel Performance Breakdown</h3>
            <p className="text-xs text-slate-400">Inbound volume by marketing origin</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {summary?.source_distribution ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.source_distribution}
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {summary.source_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>
      </div>

      {/* Agent Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Agent Performance Benchmarks</h3>
          <span className="text-xs text-slate-500">Live PostgreSQL CRM data aggregation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3">Executive</th>
                <th className="p-3 text-center">Allocated Leads</th>
                <th className="p-3 text-center">Completed Tours</th>
                <th className="p-3 text-center">Follow-ups Completed</th>
                <th className="p-3 text-center">Confirmed Bookings</th>
                <th className="p-3 text-right">Conversion Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agentReports.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-50/60">
                  <td className="p-3 font-semibold text-slate-900">
                    {agent.name}
                    <div className="text-[10px] text-slate-400 font-normal">{agent.role}</div>
                  </td>
                  <td className="p-3 text-center font-bold text-slate-800">{agent.total_leads}</td>
                  <td className="p-3 text-center font-semibold text-slate-700">{agent.completed_visits}</td>
                  <td className="p-3 text-center font-semibold text-slate-700">{agent.completed_tasks}</td>
                  <td className="p-3 text-center font-bold text-emerald-600">{agent.booked_leads}</td>
                  <td className="p-3 text-right">
                    <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      {agent.conversion_rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
