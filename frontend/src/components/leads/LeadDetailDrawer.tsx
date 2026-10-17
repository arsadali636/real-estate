'use client';

import React, { useState, useEffect } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { api, Lead, LeadActivity, FollowUpTask, SiteVisit, User } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Phone,
  MessageSquare,
  Mail,
  Building,
  User as UserIcon,
  Calendar,
  Clock,
  Send,
  AlertCircle,
  PlusCircle,
  MapPin,
  CheckCircle2,
  CalendarPlus,
  Compass,
} from 'lucide-react';

interface LeadDetailDrawerProps {
  leadId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated: () => void;
  onOpenScheduleFollowUp?: (lead: Lead) => void;
  onOpenScheduleSiteVisit?: (lead: Lead) => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  leadId,
  isOpen,
  onClose,
  onLeadUpdated,
  onOpenScheduleFollowUp,
  onOpenScheduleSiteVisit,
}) => {
  const { user } = useAuth();
  const [lead, setLead] = useState<
    (Lead & { activities: LeadActivity[]; tasks: FollowUpTask[]; site_visits: SiteVisit[] }) | null
  >(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [demoActionNotice, setDemoActionNotice] = useState<string | null>(null);
  const [statusChange, setStatusChange] = useState('');
  const [lostReason, setLostReason] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'tasks' | 'visits'>('timeline');

  useEffect(() => {
    if (leadId && isOpen) {
      setIsLoading(true);
      api
        .getLead(leadId)
        .then((res) => {
          setLead(res);
          setStatusChange(res.status);
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));

      api.getTeamMembers().then((res) => {
        const list = Array.isArray(res) ? res : (res as { results?: User[] }).results;
        setTeamMembers(list || []);
      }).catch(() => {});
    }
  }, [leadId, isOpen]);

  if (!lead && !isLoading) return null;

  const handleSimulateCall = () => {
    setDemoActionNotice(
      `[DEMO ACTION] Initialized outbound dialer to ${lead?.phone}. (Simulation only — live telephony gateway integration configured in enterprise settings).`
    );
    // Log Call activity on lead
    if (lead) {
      api.createTask({
        lead: lead.id,
        task_type: 'Call',
        due_datetime: new Date().toISOString(),
        status: 'Completed',
        notes: 'Outbound CRM Call initiated by ' + user?.display_name,
        outcome: 'Connected with client, discussed requirements and requested floor plans.',
      }).then(() => {
        api.getLead(lead.id).then(setLead);
        onLeadUpdated();
      });
    }
    setTimeout(() => setDemoActionNotice(null), 8000);
  };

  const handleSimulateWhatsApp = () => {
    setDemoActionNotice(
      `[DEMO ACTION] Pre-filled WhatsApp Business template message for ${lead?.full_name}. (Simulation only — live Meta Cloud API webhook not configured).`
    );
    if (lead) {
      api.createTask({
        lead: lead.id,
        task_type: 'WhatsApp follow-up',
        due_datetime: new Date().toISOString(),
        status: 'Completed',
        notes: 'WhatsApp brochure shared with client by ' + user?.display_name,
        outcome: 'Brochure link and pricing deck dispatched.',
      }).then(() => {
        api.getLead(lead.id).then(setLead);
        onLeadUpdated();
      });
    }
    setTimeout(() => setDemoActionNotice(null), 8000);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !newNote.trim()) return;
    setIsAddingNote(true);
    try {
      await api.addLeadNote(lead.id, newNote.trim());
      setNewNote('');
      const updated = await api.getLead(lead.id);
      setLead(updated);
      onLeadUpdated();
    } catch {
      // Handle error
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleStatusChangeSubmit = async () => {
    if (!lead || statusChange === lead.status) return;
    if (statusChange === 'Lost' && !lostReason.trim()) {
      alert('Please enter a lost reason when moving lead to Lost.');
      return;
    }
    setIsUpdatingStatus(true);
    try {
      await api.changeLeadStatus(lead.id, statusChange, {
        lost_reason: lostReason.trim(),
      });
      const updated = await api.getLead(lead.id);
      setLead(updated);
      onLeadUpdated();
      setLostReason('');
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleReassign = async (agentId: string) => {
    if (!lead) return;
    try {
      await api.assignLead(lead.id, agentId ? Number(agentId) : null);
      const updated = await api.getLead(lead.id);
      setLead(updated);
      onLeadUpdated();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={lead?.full_name || 'Lead Details'}
      subtitle={`Enquiry ID: #LEAD-${lead?.id} • Created ${lead ? new Date(lead.created_at).toLocaleDateString() : ''}`}
      width="2xl"
    >
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-20 bg-slate-100 rounded-xl" />
          <div className="h-40 bg-slate-100 rounded-xl" />
        </div>
      ) : lead ? (
        <div className="space-y-6">
          {/* Demo Action Notification */}
          {demoActionNotice && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs flex items-start gap-2 shadow-xs">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>{demoActionNotice}</div>
            </div>
          )}

          {/* Quick Contact & Demo Action Bar */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                {lead.phone}
              </div>
              <div className="text-xs text-slate-500">{lead.email || 'No email provided'}</div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Phone className="w-3.5 h-3.5 text-blue-600" />}
                onClick={handleSimulateCall}
              >
                Call (Demo)
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
                onClick={handleSimulateWhatsApp}
              >
                WhatsApp (Demo)
              </Button>
            </div>
          </div>

          {/* Key Properties & Status Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Stage</span>
              <div className="mt-1">
                <StatusBadge status={lead.status} />
              </div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Priority</span>
              <div className="mt-1">
                <PriorityBadge priority={lead.priority} />
              </div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Source</span>
              <div className="mt-1 font-semibold text-xs text-slate-800 truncate">{lead.source}</div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Budget</span>
              <div className="mt-1 font-semibold text-xs text-slate-800">
                {lead.min_budget ? `₹${(Number(lead.min_budget) / 100000).toFixed(1)}L` : 'Flexible'}
              </div>
            </div>
          </div>

          {/* Project & Assignment Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Building className="w-4 h-4 text-blue-600" />
                Interested Project
              </div>
              <div className="font-bold text-sm text-slate-900">
                {lead.interested_project_name || 'General Inquiry'}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {lead.preferred_location || 'Bengaluru'}
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <UserIcon className="w-4 h-4 text-blue-600" />
                Assigned Executive
              </div>
              {user?.is_manager_or_above ? (
                <select
                  value={lead.assigned_agent || ''}
                  onChange={(e) => handleReassign(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.display_name} ({m.role})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs font-semibold text-slate-800">
                  {lead.assigned_agent_name || 'Unassigned'}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stage Progression */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Update Pipeline Stage</span>
              <span className="text-[11px] text-slate-500">Live DRF Status Update</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={statusChange}
                onChange={(e) => setStatusChange(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-medium focus:ring-2 focus:ring-blue-500 flex-1 min-w-[150px]"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Interested">Interested</option>
                <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                <option value="Site Visit Done">Site Visit Done</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Booked">Booked</option>
                <option value="Lost">Lost</option>
              </select>

              <Button
                variant="primary"
                size="sm"
                onClick={handleStatusChangeSubmit}
                isLoading={isUpdatingStatus}
                disabled={statusChange === lead.status}
              >
                Update Stage
              </Button>
            </div>

            {statusChange === 'Lost' && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-rose-700 mb-1">
                  Lost Reason (Required by CRM rule)
                </label>
                <input
                  type="text"
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  placeholder="e.g. Budget mismatch, bought competitor property, delayed plans..."
                  className="w-full text-xs bg-white border border-rose-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-rose-500"
                />
              </div>
            )}
          </div>

          {/* Action Shortcuts */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CalendarPlus className="w-3.5 h-3.5 text-blue-600" />}
              className="flex-1"
              onClick={() => onOpenScheduleFollowUp?.(lead)}
            >
              Schedule Follow-up
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Compass className="w-3.5 h-3.5 text-emerald-600" />}
              className="flex-1"
              onClick={() => onOpenScheduleSiteVisit?.(lead)}
            >
              Book Site Visit
            </Button>
          </div>

          {/* Tab Navigation: Timeline / Tasks / Visits */}
          <div>
            <div className="flex border-b border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`pb-2.5 px-3 border-b-2 transition-colors ${
                  activeTab === 'timeline'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Activity Timeline ({lead.activities?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`pb-2.5 px-3 border-b-2 transition-colors ${
                  activeTab === 'tasks'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Follow-ups ({lead.tasks?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('visits')}
                className={`pb-2.5 px-3 border-b-2 transition-colors ${
                  activeTab === 'visits'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Site Visits ({lead.site_visits?.length || 0})
              </button>
            </div>

            {/* Tab 1: Timeline & Notes */}
            {activeTab === 'timeline' && (
              <div className="pt-4 space-y-4">
                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Log a client interaction or note..."
                    className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button type="submit" variant="primary" size="sm" isLoading={isAddingNote}>
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>

                {/* Activity List */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {lead.activities?.length ? (
                    lead.activities.map((act) => (
                      <div
                        key={act.id}
                        className="p-3 bg-white border border-slate-100 rounded-lg shadow-2xs text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-slate-500 text-[11px]">
                          <span className="font-semibold text-slate-700">{act.activity_type}</span>
                          <span>{new Date(act.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                        <div className="font-medium text-slate-900">{act.title}</div>
                        {act.description && <div className="text-slate-600">{act.description}</div>}
                        <div className="text-[10px] text-slate-400">
                          By {act.performed_by_name || 'System'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 text-center py-4">No logged activities yet.</div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Follow-up Tasks */}
            {activeTab === 'tasks' && (
              <div className="pt-4 space-y-2">
                {lead.tasks?.length ? (
                  lead.tasks.map((task) => (
                    <div key={task.id} className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{task.task_type}</span>
                        <StatusBadge status={task.status} />
                      </div>
                      <div className="text-slate-600 flex items-center gap-1.5 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Due: {new Date(task.due_datetime).toLocaleString()}
                      </div>
                      {task.outcome && (
                        <div className="text-[11px] text-emerald-700 bg-emerald-50 p-1.5 rounded">
                          Outcome: {task.outcome}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 text-center py-4">No follow-ups recorded.</div>
                )}
              </div>
            )}

            {/* Tab 3: Site Visits */}
            {activeTab === 'visits' && (
              <div className="pt-4 space-y-2">
                {lead.site_visits?.length ? (
                  lead.site_visits.map((sv) => (
                    <div key={sv.id} className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{sv.project_name}</span>
                        <StatusBadge status={sv.status} />
                      </div>
                      <div className="text-slate-600 flex items-center gap-1.5 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(sv.scheduled_datetime).toLocaleString()}
                      </div>
                      {sv.outcome && (
                        <div className="text-[11px] text-blue-700 bg-blue-50 p-1.5 rounded">
                          Tour Outcome: {sv.outcome}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 text-center py-4">No site visits scheduled yet.</div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Drawer>
  );
};
