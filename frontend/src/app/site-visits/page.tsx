'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  User,
  Building,
  CheckCircle2,
  AlertCircle,
  Plus,
  Filter,
  Check,
  XCircle,
} from 'lucide-react';
import { api, SiteVisit, Project, User as UserType } from '@/lib/api';
import { useShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TableSkeleton } from '@/components/ui/EmptyState';

export default function SiteVisitsPage() {
  const { openLeadDetails, refreshTrigger, triggerRefresh } = useShell();

  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');

  // Update Status Modal (Outcome)
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<SiteVisit | null>(null);
  const [targetStatus, setTargetStatus] = useState<'Completed' | 'Cancelled' | 'No-show'>('Completed');
  const [visitOutcome, setVisitOutcome] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Reschedule Modal
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [visitToReschedule, setVisitToReschedule] = useState<SiteVisit | null>(null);
  const [newVisitDatetime, setNewVisitDatetime] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);

  const fetchVisits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getSiteVisits({
        status: statusFilter || undefined,
        project: projectFilter || undefined,
        assigned_executive: agentFilter || undefined,
      });
      const list = Array.isArray(res) ? res : res.results;
      setVisits(list || []);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, projectFilter, agentFilter]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits, refreshTrigger]);

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

  const handleOpenStatusModal = (visit: SiteVisit, status: 'Completed' | 'Cancelled' | 'No-show') => {
    setSelectedVisit(visit);
    setTargetStatus(status);
    setVisitOutcome('');
    setStatusModalOpen(true);
  };

  const handleConfirmStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit) return;
    setIsUpdatingStatus(true);
    try {
      await api.updateSiteVisitStatus(selectedVisit.id, targetStatus, visitOutcome.trim());
      setStatusModalOpen(false);
      setSelectedVisit(null);
      triggerRefresh();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleOpenReschedule = (visit: SiteVisit) => {
    setVisitToReschedule(visit);
    const d = new Date(visit.scheduled_datetime);
    d.setDate(d.getDate() + 2);
    setNewVisitDatetime(d.toISOString().slice(0, 16));
    setRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitToReschedule || !newVisitDatetime) return;
    setIsRescheduling(true);
    try {
      await api.rescheduleSiteVisit(visitToReschedule.id, new Date(newVisitDatetime).toISOString());
      setRescheduleModalOpen(false);
      setVisitToReschedule(null);
      triggerRefresh();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setIsRescheduling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Site Visits & Property Inspections</h2>
          <p className="text-xs text-slate-500">
            Client show-flat tours, executive inspections, and visit outcome tracking
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
          {[
            { id: '', label: 'All Tours' },
            { id: 'Scheduled', label: 'Scheduled' },
            { id: 'Completed', label: 'Completed' },
            { id: 'No-show', label: 'No-show' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                statusFilter === tab.id
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

        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Tour Executives</option>
          {teamMembers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.display_name}
            </option>
          ))}
        </select>

        <Button variant="outline" size="sm" onClick={fetchVisits} isLoading={isLoading}>
          Sync Visits
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Site Visits List */}
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : visits.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-xl border border-dashed border-slate-300">
          <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No site visits found</h3>
          <p className="text-xs text-slate-400 mt-1">Book an appointment from any lead detail card.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visits.map((visit) => (
            <div
              key={visit.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-blue-600 shrink-0" />
                      {visit.project_name}
                    </h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {visit.project_location}
                    </div>
                  </div>

                  <StatusBadge status={visit.status} />
                </div>

                {/* Scheduled Time */}
                <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-blue-900 font-semibold">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    {new Date(visit.scheduled_datetime).toLocaleString([], {
                      dateStyle: 'full',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>

                {/* Lead Contact */}
                <div
                  onClick={() => openLeadDetails(visit.lead)}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{visit.lead_name}</span>
                    <span className="font-mono text-slate-500 text-[11px]">{visit.lead_phone}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Click to view lead dossier →</div>
                </div>

                {/* Notes */}
                {visit.notes && (
                  <p className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-100">
                    <span className="font-semibold text-slate-700">Special Notes: </span>
                    {visit.notes}
                  </p>
                )}

                {/* Outcome */}
                {visit.outcome && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded text-xs text-emerald-800">
                    <span className="font-semibold">Inspection Outcome: </span>
                    {visit.outcome}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  Host: {visit.assigned_executive_name}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenReschedule(visit)}
                  >
                    Reschedule
                  </Button>
                  {visit.status === 'Scheduled' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenStatusModal(visit, 'Completed')}
                      >
                        Complete
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50"
                        onClick={() => handleOpenStatusModal(visit, 'No-show')}
                      >
                        No-show
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status / Outcome Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Mark Site Visit as ${targetStatus}`}
        description="Records outcome in CRM and auto-advances lead pipeline stage to 'Site Visit Done'."
        maxWidth="md"
      >
        <form onSubmit={handleConfirmStatusUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Visit Outcome & Client Feedback <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={visitOutcome}
              onChange={(e) => setVisitOutcome(e.target.value)}
              placeholder="e.g. Client loved the 4 BHK penthouse layout, verified balcony view, requested commercial payment schedule..."
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isUpdatingStatus}>
              Save Visit Result
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Visit Modal */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="Reschedule Site Visit"
        description="Select new tour date and time."
        maxWidth="md"
      >
        <form onSubmit={handleConfirmReschedule} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Appointment Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={newVisitDatetime}
              onChange={(e) => setNewVisitDatetime(e.target.value)}
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
