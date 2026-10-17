'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { api, Lead, Project, User } from '@/lib/api';

interface SiteVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
  onVisitScheduled: () => void;
}

export const SiteVisitModal: React.FC<SiteVisitModalProps> = ({
  isOpen,
  onClose,
  lead,
  onVisitScheduled,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [assignedExecutive, setAssignedExecutive] = useState<string>('');
  const [scheduledDatetime, setScheduledDatetime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getProjects().then((res) => {
        const list = Array.isArray(res) ? res : res.results;
        setProjects(list || []);
      });
      api.getTeamMembers().then((res) => {
        const list = Array.isArray(res) ? res : (res as { results?: User[] }).results;
        setTeamMembers(list || []);
      });

      // Default to next Saturday 11:30 AM
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 2);
      nextDate.setHours(11, 30, 0, 0);
      setScheduledDatetime(nextDate.toISOString().slice(0, 16));

      if (lead?.interested_project) {
        setSelectedProject(String(lead.interested_project));
      }
      if (lead?.assigned_agent) {
        setAssignedExecutive(String(lead.assigned_agent));
      }
    }
  }, [isOpen, lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !selectedProject) return;
    setIsSubmitting(true);
    try {
      await api.createSiteVisit({
        lead: lead.id,
        project: Number(selectedProject),
        assigned_executive: assignedExecutive ? Number(assignedExecutive) : undefined,
        scheduled_datetime: new Date(scheduledDatetime).toISOString(),
        notes: notes,
      });
      onVisitScheduled();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Project Site Visit"
      description={lead ? `Scheduling on-site tour for ${lead.full_name}` : 'Book Site Visit'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Select Project / Property <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select project for walkthrough...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.location})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Site Visit Date & Time <span className="text-rose-500">*</span>
          </label>
          <input
            type="datetime-local"
            required
            value={scheduledDatetime}
            onChange={(e) => setScheduledDatetime(e.target.value)}
            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Executive</label>
          <select
            value={assignedExecutive}
            onChange={(e) => setAssignedExecutive(e.target.value)}
            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Current Agent / Self</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.display_name} ({m.role})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Visit Notes / Special Requests</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Client requested to inspect 3 BHK show flat and check Vastu compliance..."
            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Confirm Site Visit
          </Button>
        </div>
      </form>
    </Modal>
  );
};
