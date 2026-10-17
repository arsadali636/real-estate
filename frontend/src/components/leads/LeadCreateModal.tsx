'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { api, Project, User } from '@/lib/api';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface LeadCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated: () => void;
}

export const LeadCreateModal: React.FC<LeadCreateModalProps> = ({
  isOpen,
  onClose,
  onLeadCreated,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    source: 'Website',
    campaign: '',
    interested_project: '',
    min_budget: '',
    max_budget: '',
    preferred_location: '',
    priority: 'Medium',
    assigned_agent: '',
    next_followup_date: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      // Load projects and team members
      api.getProjects().then((res) => {
        const list = Array.isArray(res) ? res : res.results;
        setProjects(list || []);
      }).catch(() => {});

      api.getTeamMembers().then((res) => {
        const list = Array.isArray(res) ? res : (res as { results?: User[] }).results;
        setTeamMembers(list || []);
      }).catch(() => {});
    }
  }, [isOpen]);

  const handlePhoneBlur = async () => {
    const phone = formData.phone.trim();
    if (phone.length >= 7) {
      try {
        const res = await api.checkDuplicatePhone(phone);
        if (res.duplicate && res.warning) {
          setDuplicateWarning(res.warning);
        } else {
          setDuplicateWarning(null);
        }
      } catch {
        // Ignore duplicate check error
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        source: formData.source,
        campaign: formData.campaign,
        preferred_location: formData.preferred_location,
        priority: formData.priority,
        notes: formData.notes,
      };

      if (formData.interested_project) {
        payload.interested_project = Number(formData.interested_project);
      }
      if (formData.assigned_agent) {
        payload.assigned_agent = Number(formData.assigned_agent);
      }
      if (formData.min_budget) {
        payload.min_budget = formData.min_budget;
      }
      if (formData.max_budget) {
        payload.max_budget = formData.max_budget;
      }
      if (formData.next_followup_date) {
        payload.next_followup_date = new Date(formData.next_followup_date).toISOString();
      }

      await api.createLead(payload);
      onLeadCreated();
      onClose();
      // Reset
      setFormData({
        full_name: '',
        phone: '',
        email: '',
        source: 'Website',
        campaign: '',
        interested_project: '',
        min_budget: '',
        max_budget: '',
        preferred_location: '',
        priority: 'Medium',
        assigned_agent: '',
        next_followup_date: '',
        notes: '',
      });
      setDuplicateWarning(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Parse validation error or set general
        const msg = err.message;
        const newErr: Record<string, string> = {};
        if (msg.includes('phone:')) {
          newErr.phone = msg.split('phone:')[1].split('|')[0].trim();
        }
        if (msg.includes('full_name:')) {
          newErr.full_name = msg.split('full_name:')[1].split('|')[0].trim();
        }
        if (Object.keys(newErr).length > 0) {
          setErrors(newErr);
        } else {
          setErrors({ general: msg });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Lead"
      description="Register an enquiry in ESTATEVO CRM. Data is validated on the Django backend."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errors.general}</span>
          </div>
        )}

        {duplicateWarning && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">Duplicate Lead Detected: </span>
              {duplicateWarning}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              placeholder="e.g. Ramesh Kulkarni"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.full_name && <p className="text-xs text-rose-500 mt-1">{errors.full_name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              onBlur={handlePhoneBlur}
              placeholder="+91 98450 12345"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="client@example.com"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Lead Source */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Source</label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Website">Website</option>
              <option value="Meta Ads">Meta Ads</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Walk-in">Walk-in</option>
              <option value="Referral">Referral</option>
              <option value="Channel Partner">Channel Partner</option>
              <option value="Property Portal">Property Portal</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Interested Project */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Interested Project</label>
            <select
              name="interested_project"
              value={formData.interested_project}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.location})
                </option>
              ))}
            </select>
          </div>

          {/* Campaign */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign</label>
            <input
              type="text"
              name="campaign"
              value={formData.campaign}
              onChange={handleChange}
              placeholder="e.g. Q4 Google Search"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Min Budget */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Budget (₹)</label>
            <input
              type="number"
              name="min_budget"
              value={formData.min_budget}
              onChange={handleChange}
              placeholder="e.g. 15000000"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Max Budget */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Budget (₹)</label>
            <input
              type="number"
              name="max_budget"
              value={formData.max_budget}
              onChange={handleChange}
              placeholder="e.g. 25000000"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          {/* Assigned Agent */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Agent</label>
            <select
              name="assigned_agent"
              value={formData.assigned_agent}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Unassigned (auto or pool)</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.display_name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Location */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Location</label>
            <input
              type="text"
              name="preferred_location"
              value={formData.preferred_location}
              onChange={handleChange}
              placeholder="e.g. Indiranagar, Koramangala or Whitefield"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Next Followup */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Next Follow-up Date & Time</label>
            <input
              type="datetime-local"
              name="next_followup_date"
              value={formData.next_followup_date}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Notes</label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Key client preferences, requirements, or meeting notes..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Create Lead
          </Button>
        </div>
      </form>
    </Modal>
  );
};
