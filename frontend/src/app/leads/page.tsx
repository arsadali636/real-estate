'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  Download,
  Plus,
  RotateCcw,
  Phone,
  Mail,
  Calendar,
  Building,
  User,
  Clock,
  MoreVertical,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';
import { api, Lead, Project, User as UserType } from '@/lib/api';
import { useShell } from '@/components/layout/AppShell';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, TableSkeleton } from '@/components/ui/EmptyState';

function LeadsContent() {
  const searchParams = useSearchParams();
  const paramStatus = searchParams.get('status') || '';
  const paramSource = searchParams.get('source') || '';
  const paramAgent = searchParams.get('agent') || '';
  const paramFilter = searchParams.get('filter') || '';

  const { openNewLeadModal, openLeadDetails, openFollowUpModal, openSiteVisitModal, refreshTrigger } = useShell();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(paramStatus);
  const [sourceFilter, setSourceFilter] = useState(paramSource);
  const [projectFilter, setProjectFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState(paramAgent);
  const [priorityFilter, setPriorityFilter] = useState('');
  const [followupFilter, setFollowupFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    if (paramStatus) setStatusFilter(paramStatus);
    if (paramSource) setSourceFilter(paramSource);
    if (paramAgent) setAgentFilter(paramAgent);
  }, [paramStatus, paramSource, paramAgent]);

  // Selected leads for batch actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getLeads({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        source: sourceFilter || undefined,
        interested_project: projectFilter || undefined,
        assigned_agent: agentFilter || undefined,
        priority: priorityFilter || undefined,
        followup_due: followupFilter || undefined,
        filter: paramFilter || undefined,
        page: page,
        page_size: pageSize,
      });

      if (Array.isArray(res)) {
        setLeads(res);
        setTotalCount(res.length);
      } else {
        setLeads(res.results || []);
        setTotalCount(res.count || 0);
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, sourceFilter, projectFilter, agentFilter, priorityFilter, followupFilter, page, pageSize]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads, refreshTrigger]);

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

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setSourceFilter('');
    setProjectFilter('');
    setAgentFilter('');
    setPriorityFilter('');
    setFollowupFilter('');
    setPage(1);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(leads.map((l) => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    const url = api.getExportCsvUrl({
      search: search.trim() || undefined,
      status: statusFilter || undefined,
      source: sourceFilter || undefined,
      interested_project: projectFilter || undefined,
      assigned_agent: agentFilter || undefined,
      priority: priorityFilter || undefined,
    });
    window.open(url, '_blank');
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Leads Directory</h2>
          <p className="text-xs text-slate-500">
            Total {totalCount} leads registered in PostgreSQL database
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5 text-slate-600" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openNewLeadModal}
          >
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {/* Search */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, phone, email..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Stages</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Interested">Interested</option>
            <option value="Site Visit Scheduled">Site Visit Scheduled</option>
            <option value="Site Visit Done">Site Visit Done</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Booked">Booked</option>
            <option value="Lost">Lost</option>
          </select>

          {/* Project */}
          <select
            value={projectFilter}
            onChange={(e) => {
              setProjectFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Source */}
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sources</option>
            <option value="Website">Website</option>
            <option value="Meta Ads">Meta Ads</option>
            <option value="Google Ads">Google Ads</option>
            <option value="Walk-in">Walk-in</option>
            <option value="Referral">Referral</option>
            <option value="Channel Partner">Channel Partner</option>
            <option value="Property Portal">Property Portal</option>
          </select>

          {/* Agent */}
          <select
            value={agentFilter}
            onChange={(e) => {
              setAgentFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Agents</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.display_name}
              </option>
            ))}
          </select>

          {/* Follow-up Due */}
          <select
            value={followupFilter}
            onChange={(e) => {
              setFollowupFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Follow-ups: All</option>
            <option value="today">Due Today</option>
            <option value="overdue">Overdue</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>

        {/* Filter Reset Button */}
        {(search || statusFilter || sourceFilter || projectFilter || agentFilter || priorityFilter || followupFilter) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">Filtered view active</span>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="danger" size="sm" onClick={fetchLeads}>
            Retry
          </Button>
        </div>
      )}

      {/* Leads Table */}
      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : leads.length === 0 ? (
        <EmptyState
          title="No leads matching your criteria"
          description="Try clearing search filters or create a new lead enquiry."
          actionLabel="Add New Lead"
          onAction={openNewLeadModal}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200 select-none">
                <tr>
                  <th className="p-3 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === leads.length && leads.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-3">Lead Name</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Interested Project</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Budget</th>
                  <th className="p-3">Assigned Agent</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Current Stage</th>
                  <th className="p-3">Next Follow-up</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => {
                  const isSelected = selectedIds.includes(lead.id);
                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => openLeadDetails(lead.id)}
                    >
                      {/* Checkbox */}
                      <td
                        className="p-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectOne(lead.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Lead Name */}
                      <td className="p-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {lead.full_name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ID: #{lead.id} • {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Phone & Email */}
                      <td className="p-3">
                        <div className="font-mono text-slate-800 text-[11px]">{lead.phone}</div>
                        {lead.email && <div className="text-slate-400 text-[10px]">{lead.email}</div>}
                      </td>

                      {/* Project */}
                      <td className="p-3 text-slate-700 font-medium">
                        {lead.interested_project_name || 'General Inquiry'}
                      </td>

                      {/* Source */}
                      <td className="p-3 text-slate-600">{lead.source}</td>

                      {/* Budget */}
                      <td className="p-3 text-slate-800 font-medium">
                        {lead.min_budget
                          ? `₹${(Number(lead.min_budget) / 100000).toFixed(1)}L`
                          : 'Flexible'}
                      </td>

                      {/* Agent */}
                      <td className="p-3">
                        <span className="font-medium text-slate-700">
                          {lead.assigned_agent_name || 'Unassigned'}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="p-3">
                        <PriorityBadge priority={lead.priority} />
                      </td>

                      {/* Stage */}
                      <td className="p-3">
                        <StatusBadge status={lead.status} />
                      </td>

                      {/* Follow-up */}
                      <td className="p-3 text-slate-600">
                        {lead.next_followup_date ? (
                          <div className="flex items-center gap-1 text-[11px]">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {new Date(lead.next_followup_date).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">None</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td
                        className="p-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Schedule follow-up"
                            onClick={() => openFollowUpModal(lead)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Open lead profile drawer"
                            onClick={() => openLeadDetails(lead.id)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500">
              Showing {(page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, totalCount)} of {totalCount} records
            </div>

            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>

              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="px-3 py-1 flex items-center font-semibold text-slate-700">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeadsPage() {
  return (
    <React.Suspense fallback={<TableSkeleton rows={8} />}>
      <LeadsContent />
    </React.Suspense>
  );
}
