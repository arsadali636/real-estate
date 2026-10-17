'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Kanban,
  Filter,
  Plus,
  Building,
  User,
  Clock,
  IndianRupee,
  AlertCircle,
  MoreVertical,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { api, Lead, Project, User as UserType } from '@/lib/api';
import { useShell } from '@/components/layout/AppShell';
import { PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

const PIPELINE_STAGES: Array<{
  id: Lead['status'];
  label: string;
  color: string;
  bgLight: string;
}> = [
  { id: 'New', label: 'New Enquiries', color: '#06B6D4', bgLight: 'bg-cyan-50/60' },
  { id: 'Contacted', label: 'Contacted', color: '#2563EB', bgLight: 'bg-blue-50/60' },
  { id: 'Interested', label: 'Interested', color: '#8B5CF6', bgLight: 'bg-purple-50/60' },
  { id: 'Site Visit Scheduled', label: 'Visit Scheduled', color: '#F59E0B', bgLight: 'bg-amber-50/60' },
  { id: 'Site Visit Done', label: 'Visit Done', color: '#3B82F6', bgLight: 'bg-blue-50/60' },
  { id: 'Negotiation', label: 'Negotiation', color: '#D97706', bgLight: 'bg-amber-50/60' },
  { id: 'Booked', label: 'Booked', color: '#16A34A', bgLight: 'bg-emerald-50/60' },
  { id: 'Lost', label: 'Lost', color: '#DC2626', bgLight: 'bg-rose-50/60' },
];

export default function PipelinePage() {
  const { openNewLeadModal, openLeadDetails, refreshTrigger, triggerRefresh } = useShell();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [projectFilter, setProjectFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');

  // Drag and drop state
  const [draggingLeadId, setDraggingLeadId] = useState<number | null>(null);

  // Lost Reason Modal State
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [pendingLostLead, setPendingLostLead] = useState<Lead | null>(null);
  const [lostReason, setLostReason] = useState('');
  const [isSubmittingLost, setIsSubmittingLost] = useState(false);

  const fetchPipelineLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getLeads({
        interested_project: projectFilter || undefined,
        assigned_agent: agentFilter || undefined,
        page_size: 150, // Get active pipeline leads
      });
      const list = Array.isArray(res) ? res : res.results;
      setLeads(list || []);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [projectFilter, agentFilter]);

  useEffect(() => {
    fetchPipelineLeads();
  }, [fetchPipelineLeads, refreshTrigger]);

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

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, leadId: number) => {
    e.dataTransfer.setData('text/plain', String(leadId));
    setDraggingLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStage: Lead['status']) => {
    e.preventDefault();
    const leadIdStr = e.dataTransfer.getData('text/plain');
    const leadId = Number(leadIdStr);
    setDraggingLeadId(null);

    const leadToMove = leads.find((l) => l.id === leadId);
    if (!leadToMove || leadToMove.status === targetStage) return;

    if (targetStage === 'Lost') {
      // Prompt for lost reason
      setPendingLostLead(leadToMove);
      setLostReason('');
      setLostModalOpen(true);
      return;
    }

    // Optimistic Update
    const previousLeads = [...leads];
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: targetStage } : l))
    );

    try {
      await api.changeLeadStatus(leadId, targetStage);
      triggerRefresh();
    } catch (err: unknown) {
      // Rollback on failure
      setLeads(previousLeads);
      if (err instanceof Error) alert(`Pipeline update failed: ${err.message}`);
    }
  };

  const handleConfirmLost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingLostLead || !lostReason.trim()) return;

    setIsSubmittingLost(true);
    const previousLeads = [...leads];
    const leadId = pendingLostLead.id;

    // Optimistic
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: 'Lost', lost_reason: lostReason } : l))
    );

    try {
      await api.changeLeadStatus(leadId, 'Lost', { lost_reason: lostReason.trim() });
      setLostModalOpen(false);
      setPendingLostLead(null);
      triggerRefresh();
    } catch (err: unknown) {
      setLeads(previousLeads);
      if (err instanceof Error) alert(`Failed to update status: ${err.message}`);
    } finally {
      setIsSubmittingLost(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Kanban className="w-4 h-4 text-blue-600" />
            Pipeline Filters:
          </span>

          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Agent Filter */}
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Executives</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.display_name}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchPipelineLeads}
            isLoading={isLoading}
          >
            Sync Pipeline
          </Button>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Kanban Board with Horizontal Scroll */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1550px] items-start">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.status === stage.id);
            const totalStageBudget = stageLeads.reduce(
              (acc, l) => acc + (l.min_budget ? Number(l.min_budget) : 0),
              0
            );

            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`w-[230px] shrink-0 rounded-xl border border-slate-200 bg-slate-100/70 p-3 flex flex-col max-h-[calc(100vh-210px)] transition-all ${
                  draggingLeadId ? 'hover:border-blue-400 hover:bg-blue-50/20' : ''
                }`}
              >
                {/* Stage Header */}
                <div className="pb-2.5 mb-2.5 border-b border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="text-xs font-bold text-slate-800">
                        {stage.label}
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      {stageLeads.length}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium mt-1">
                    Vol: ₹{(totalStageBudget / 100000).toFixed(1)}L
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                  {stageLeads.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      No leads in {stage.label}
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => openLeadDetails(lead.id)}
                        className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing space-y-2 group"
                      >
                        {/* Title & Priority */}
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {lead.full_name}
                          </span>
                          <PriorityBadge priority={lead.priority} />
                        </div>

                        {/* Project Name */}
                        <div className="text-[11px] text-slate-600 flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{lead.interested_project_name || 'General Inquiry'}</span>
                        </div>

                        {/* Budget */}
                        <div className="text-[11px] font-semibold text-slate-800 flex items-center gap-1">
                          <IndianRupee className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {lead.min_budget
                              ? `₹${(Number(lead.min_budget) / 100000).toFixed(1)} Lakhs`
                              : 'Flexible Budget'}
                          </span>
                        </div>

                        {/* Agent & Follow-up */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                          <div className="flex items-center gap-1 truncate max-w-[120px]">
                            <User className="w-3 h-3 text-slate-400" />
                            <span className="truncate text-slate-600">
                              {lead.assigned_agent_name?.split(' ')[0] || 'Unassigned'}
                            </span>
                          </div>

                          {lead.next_followup_date && (
                            <div className="flex items-center gap-0.5 text-blue-600 font-medium">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(lead.next_followup_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lost Reason Required Modal */}
      <Modal
        isOpen={lostModalOpen}
        onClose={() => {
          setLostModalOpen(false);
          setPendingLostLead(null);
        }}
        title="Reason for Marking Lead as Lost"
        description="CRM data governance requires a lost justification reason."
        maxWidth="md"
      >
        <form onSubmit={handleConfirmLost} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select or Enter Lost Reason <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              placeholder="e.g. Budget constraint, bought competing project, delayed timeline..."
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setLostModalOpen(false);
                setPendingLostLead(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" isLoading={isSubmittingLost}>
              Confirm Lost
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
