'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Mail,
  Phone,
  Award,
  CalendarCheck,
  MapPin,
  TrendingUp,
  AlertCircle,
  Shield,
  Key,
} from 'lucide-react';
import { api, TeamMember, User } from '@/lib/api';
import { useAuth, SEEDED_DEMO_ACCOUNTS } from '@/context/AuthContext';
import { RoleBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TableSkeleton } from '@/components/ui/EmptyState';

export default function TeamPage() {
  const { user, switchDemoRole } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Member Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'EXECUTIVE',
    job_title: '',
    phone: '',
    password: 'EstateFlow@2026',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTeam = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getTeamMembers();
      const list = Array.isArray(res) ? res : res.results;
      setMembers(list || []);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createTeamMember({
        ...newMember,
        role: newMember.role as User['role'],
      });
      setAddModalOpen(false);
      setNewMember({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        role: 'EXECUTIVE',
        job_title: '',
        phone: '',
        password: 'EstateFlow@2026',
      });
      fetchTeam();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Team Directory & Performance</h2>
          <p className="text-xs text-slate-500">
            Organization members, assigned leads, visit stats, and conversion metrics
          </p>
        </div>

        {user?.is_owner_or_admin && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => setAddModalOpen(true)}
          >
            Add Team Member
          </Button>
        )}
      </div>

      {/* Role Permission Scope Card */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-blue-900">
          <Shield className="w-4 h-4 text-blue-600" />
          Server-Side Role Permissions Architecture
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-700">
          <div className="p-2.5 bg-white rounded-lg border border-blue-100">
            <span className="font-bold text-slate-900">Owner / Admin:</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Full organization control, reassign leads across team, add/edit projects, view organization-wide reports & analytics.
            </p>
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-blue-100">
            <span className="font-bold text-slate-900">Sales Manager:</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Assign leads to executives, review team performance, oversee follow-up tasks & site visits, monitor pipeline velocity.
            </p>
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-blue-100">
            <span className="font-bold text-slate-900">Executive:</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Scoped strictly to assigned leads. Record activities, complete tasks, conduct site visits, view own performance.
            </p>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Team Table */}
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Member</th>
                  <th className="p-3">Role & Title</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3 text-center">Assigned Leads</th>
                  <th className="p-3 text-center">Tasks Done</th>
                  <th className="p-3 text-center">Tours Done</th>
                  <th className="p-3 text-center">Bookings</th>
                  <th className="p-3 text-right">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* User */}
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            member.avatar_url ||
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={member.display_name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{member.display_name}</div>
                          <div className="text-[10px] text-slate-400">@{member.username}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role & Title */}
                    <td className="p-3">
                      <RoleBadge role={member.role} />
                      <div className="text-[11px] text-slate-500 mt-0.5">{member.job_title || 'Advisor'}</div>
                    </td>

                    {/* Contact */}
                    <td className="p-3">
                      <div className="text-slate-800">{member.email}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{member.phone}</div>
                    </td>

                    {/* Assigned Leads */}
                    <td className="p-3 text-center font-bold text-slate-800">
                      {member.assigned_leads_count}
                    </td>

                    {/* Tasks Done */}
                    <td className="p-3 text-center font-semibold text-slate-700">
                      {member.completed_tasks_count}
                    </td>

                    {/* Tours Done */}
                    <td className="p-3 text-center font-semibold text-slate-700">
                      {member.completed_visits_count}
                    </td>

                    {/* Bookings */}
                    <td className="p-3 text-center font-bold text-emerald-600">
                      {member.booked_leads_count}
                    </td>

                    {/* Conversion Rate */}
                    <td className="p-3 text-right">
                      <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        {member.conversion_rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Invite Team Member"
        description="Add a new executive or manager to the organization."
        maxWidth="md"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={newMember.first_name}
                onChange={(e) => setNewMember({ ...newMember, first_name: e.target.value })}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={newMember.last_name}
                onChange={(e) => setNewMember({ ...newMember, last_name: e.target.value })}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value, username: e.target.value.split('@')[0] })}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={newMember.phone}
              onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role *</label>
              <select
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="EXECUTIVE">Executive</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                value={newMember.job_title}
                onChange={(e) => setNewMember({ ...newMember, job_title: e.target.value })}
                placeholder="e.g. Sales Associate"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Invite Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
