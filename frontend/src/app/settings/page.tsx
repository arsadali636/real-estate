'use client';

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Building,
  Key,
  Database,
  Radio,
  Server,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Mail,
  Phone,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { API_BASE_URL } from '@/lib/api';

export default function SettingsPage() {
  const { user } = useAuth();
  const [currency, setCurrency] = useState('₹ (INR)');
  const [saveNotice, setSaveNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900">Organization Settings & Integrations</h2>
        <p className="text-xs text-slate-500">
          Configure branding, currency preferences, telephony gateways, and database connections
        </p>
      </div>

      {saveNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Organization settings saved successfully.</span>
        </div>
      )}

      {/* Organization Info Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-600" />
          Company Profile & Real Estate Identity
        </h3>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company / Agency Name</label>
              <input
                type="text"
                defaultValue={user?.organization?.name || 'Apex Horizon Realty Partners'}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Organization Slug</label>
              <input
                type="text"
                disabled
                defaultValue={user?.organization?.slug || 'apex-horizon-realty'}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Support Email</label>
              <input
                type="email"
                defaultValue="contact@apexhorizonrealty.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                defaultValue="+91 80 4920 1800"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Registered Office Address</label>
              <input
                type="text"
                defaultValue="Level 14, Prestige Nebula, Outer Ring Road, Bengaluru, Karnataka 560103"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="sm">
              Save Preferences
            </Button>
          </div>
        </form>
      </div>

      {/* Backend & Deployment Status */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Server className="w-4 h-4 text-blue-600" />
          Backend Architecture & PostgreSQL Connection
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800">REST API Base URL</span>
              <div className="font-mono text-[11px] text-blue-600 mt-0.5">{API_BASE_URL}</div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-semibold text-[11px]">
              Connected
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800">PostgreSQL Database Engine</span>
              <div className="text-[11px] text-slate-500 mt-0.5">Local / Managed PostgreSQL (estatevo_crm / estateflow_crm)</div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-semibold text-[11px]">
              Active & Migrated
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800">Telephony & WhatsApp Integration Status</span>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Simulated demo mode active. Live Twilio / Meta Cloud API gateway can be connected with env credentials.
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md font-semibold text-[11px]">
              Demo Mode
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
