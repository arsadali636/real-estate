'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { api, Lead, User } from '@/lib/api';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
  onFollowUpScheduled: () => void;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  lead,
  onFollowUpScheduled,
}) => {
  const [taskType, setTaskType] = useState<'Call' | 'Meeting' | 'Email' | 'WhatsApp follow-up' | 'General reminder'>('Call');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [dueDatetime, setDueDatetime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Default to tomorrow 11:00 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(11, 0, 0, 0);
      setDueDatetime(tomorrow.toISOString().slice(0, 16));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    setIsSubmitting(true);
    try {
      await api.createTask({
        lead: lead.id,
        task_type: taskType,
        priority: priority,
        due_datetime: new Date(dueDatetime).toISOString(),
        notes: notes,
      });
      onFollowUpScheduled();
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
      title="Schedule Follow-up Task"
      description={lead ? `Setting reminder for ${lead.full_name} (${lead.phone})` : 'Schedule task'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Task Type</label>
          <select
            value={taskType}
            onChange={(e) => setTaskType(e.target.value as typeof taskType)}
            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="Call">Call</option>
            <option value="Meeting">Meeting</option>
            <option value="Email">Email</option>
            <option value="WhatsApp follow-up">WhatsApp follow-up</option>
            <option value="General reminder">General reminder</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as typeof priority)}
            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date & Time</label>
          <input
            type="datetime-local"
            required
            value={dueDatetime}
            onChange={(e) => setDueDatetime(e.target.value)}
            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Notes & Agenda</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Key discussion points, payment terms, or unit specifications..."
            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Schedule Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};
