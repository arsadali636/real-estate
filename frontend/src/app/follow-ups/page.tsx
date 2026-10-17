'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck,
  Clock,
  Phone,
  MessageSquare,
  Mail,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  RotateCcw,
  Calendar,
  Filter,
} from 'lucide-react';
import { api, FollowUpTask, User as UserType } from '@/lib/api';
import { useShell } from '@/components/layout/AppShell';
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TableSkeleton } from '@/components/ui/EmptyState';

export default function FollowUpsPage() {
  const { openLeadDetails, refreshTrigger, triggerRefresh } = useShell();

  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [dueFilter, setDueFilter] = useState('today');
  const [typeFilter, setTypeFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');

  // Complete Task Modal
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<FollowUpTask | null>(null);
  const [completionOutcome, setCompletionOutcome] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  // Reschedule Modal
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [taskToReschedule, setTaskToReschedule] = useState<FollowUpTask | null>(null);
  const [newDueDatetime, setNewDueDatetime] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getTasks({
        due_filter: dueFilter || undefined,
        task_type: typeFilter || undefined,
        assigned_to: agentFilter || undefined,
      });
      const list = Array.isArray(res) ? res : res.results;
      setTasks(list || []);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [dueFilter, typeFilter, agentFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, refreshTrigger]);

  useEffect(() => {
    api.getTeamMembers().then((res) => {
      const list = Array.isArray(res) ? res : (res as { results?: UserType[] }).results;
      setTeamMembers(list || []);
    });
  }, []);

  const handleOpenCompleteModal = (task: FollowUpTask) => {
    setTaskToComplete(task);
    setCompletionOutcome('');
    setCompleteModalOpen(true);
  };

  const handleConfirmComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskToComplete) return;
    setIsCompleting(true);
    try {
      await api.completeTask(taskToComplete.id, completionOutcome.trim());
      setCompleteModalOpen(false);
      setTaskToComplete(null);
      triggerRefresh();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleOpenRescheduleModal = (task: FollowUpTask) => {
    setTaskToReschedule(task);
    const date = new Date(task.due_datetime);
    date.setDate(date.getDate() + 1);
    setNewDueDatetime(date.toISOString().slice(0, 16));
    setRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskToReschedule || !newDueDatetime) return;
    setIsRescheduling(true);
    try {
      await api.rescheduleTask(taskToReschedule.id, new Date(newDueDatetime).toISOString());
      setRescheduleModalOpen(false);
      setTaskToReschedule(null);
      triggerRefresh();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setIsRescheduling(false);
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'Call':
        return <Phone className="w-4 h-4 text-blue-600" />;
      case 'WhatsApp follow-up':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'Email':
        return <Mail className="w-4 h-4 text-amber-600" />;
      default:
        return <CalendarCheck className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Follow-ups & Client Communication</h2>
          <p className="text-xs text-slate-500">
            Action reminders, client call schedules, and task completions
          </p>
        </div>

        {/* Due Status Tabs */}
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
          {[
            { id: 'today', label: 'Due Today' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDueFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                dueFilter === tab.id
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        {/* Task Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Task Types</option>
          <option value="Call">Call</option>
          <option value="Meeting">Meeting</option>
          <option value="Email">Email</option>
          <option value="WhatsApp follow-up">WhatsApp follow-up</option>
          <option value="General reminder">General reminder</option>
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

        <Button variant="outline" size="sm" onClick={fetchTasks} isLoading={isLoading}>
          Sync Tasks
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Follow-up Cards / List */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : tasks.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-xl border border-dashed border-slate-300">
          <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No follow-ups for this filter</h3>
          <p className="text-xs text-slate-400 mt-1">Great job! You have addressed all action items.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      {getTaskIcon(task.task_type)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900">{task.task_type}</span>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Due: {new Date(task.due_datetime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                </div>

                {/* Lead Contact Info */}
                <div
                  onClick={() => openLeadDetails(task.lead)}
                  className="p-3 bg-slate-50/70 hover:bg-blue-50/40 rounded-lg border border-slate-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{task.lead_name}</span>
                    <span className="font-mono text-slate-500 text-[11px]">{task.lead_phone}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Project: {task.lead_project_name || 'General Inquiry'}
                  </div>
                </div>

                {/* Notes */}
                {task.notes && (
                  <p className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-100">
                    {task.notes}
                  </p>
                )}

                {/* Outcome if completed */}
                {task.outcome && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded text-xs text-emerald-800">
                    <span className="font-semibold">Recorded Outcome: </span>
                    {task.outcome}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  Assigned: {task.assigned_to_name}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenRescheduleModal(task)}
                  >
                    Reschedule
                  </Button>
                  {task.status === 'Pending' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenCompleteModal(task)}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complete Task Modal */}
      <Modal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title="Complete Follow-up Task"
        description="Record the call or communication outcome to update CRM activity history."
        maxWidth="md"
      >
        <form onSubmit={handleConfirmComplete} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Outcome & Client Response <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={completionOutcome}
              onChange={(e) => setCompletionOutcome(e.target.value)}
              placeholder="e.g. Discussed pricing for 3 BHK unit. Client requested a site visit this coming Saturday."
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setCompleteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isCompleting}>
              Mark Completed
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Task Modal */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="Reschedule Follow-up"
        description="Select a new due date and time for this client task."
        maxWidth="md"
      >
        <form onSubmit={handleConfirmReschedule} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Date & Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={newDueDatetime}
              onChange={(e) => setNewDueDatetime(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setRescheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isRescheduling}>
              Save Rescheduled Date
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
