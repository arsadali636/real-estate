'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Search,
  Plus,
  Menu,
  Shield,
  LogOut,
  ChevronDown,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth, SEEDED_DEMO_ACCOUNTS } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { RoleBadge } from '@/components/ui/Badge';

interface TopNavProps {
  onOpenMobileMenu: () => void;
  onOpenNewLeadModal: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenMobileMenu,
  onOpenNewLeadModal,
}) => {
  const pathname = usePathname();
  const { user, switchDemoRole, logout } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Dynamic breadcrumb title
  const getPageTitle = () => {
    switch (pathname) {
      case '/':
        return 'Executive Overview & KPI Dashboard';
      case '/leads':
        return 'Lead Management Workspace';
      case '/pipeline':
        return 'Visual Sales Pipeline & Kanban';
      case '/follow-ups':
        return 'Follow-ups & Client Communication';
      case '/site-visits':
        return 'Site Visits & Property Inspections';
      case '/projects':
        return 'Projects & Real Estate Inventory';
      case '/reports':
        return 'Reports & Performance Analytics';
      case '/team':
        return 'Team Directory & Role Permissions';
      case '/settings':
        return 'Organization Settings & Integrations';
      default:
        return 'ESTATEVO CRM';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <div className="text-xs text-slate-400 font-medium hidden sm:flex items-center gap-1.5">
            <span className="font-bold text-slate-700">ESTATEVO</span>
            <span>/</span>
            <span className="capitalize">{pathname === '/' ? 'Dashboard' : pathname.replace('/', '')}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Demo Role Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleDropdown(!showRoleDropdown);
              setShowUserDropdown(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Switch demo account to test role permissions"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Demo Role:</span>
            <span className="font-bold">{user?.role || 'OWNER'}</span>
            <ChevronDown className="w-3 h-3 text-blue-500" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  Client Demo Role Switcher
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Permissions are strictly enforced on Django backend for each account.
                </p>
              </div>
              <div className="py-1">
                {SEEDED_DEMO_ACCOUNTS.map((acc) => {
                  const isCurrent = user?.username === acc.username;
                  return (
                    <button
                      key={acc.username}
                      onClick={() => {
                        switchDemoRole(acc.role, acc.username);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-900">{acc.label}</div>
                        {acc.scope && (
                          <div className="text-[10px] text-blue-600 font-semibold">{acc.scope}</div>
                        )}
                        <div className="text-[10px] text-slate-400 font-mono">{acc.email}</div>
                      </div>
                      {isCurrent && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Quick Action: New Lead */}
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={onOpenNewLeadModal}
        >
          <span className="hidden sm:inline">Add Lead</span>
          <span className="sm:hidden">Add</span>
        </Button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowRoleDropdown(false);
              setShowUserDropdown(false);
            }}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">In-App Notifications</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                  Real-time CRM
                </span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-100 flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-800">Follow-ups scheduled for today</div>
                    <div className="text-[11px] text-slate-500">Check follow-ups workspace for today&apos;s calls &amp; WhatsApp reminders.</div>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-800">PostgreSQL Database Connected</div>
                    <div className="text-[11px] text-slate-500">Live API server synchronizing all leads &amp; property inventory.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserDropdown(!showUserDropdown);
              setShowRoleDropdown(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <img
              src={
                user?.avatar_url ||
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
              }
              alt={user?.display_name || 'User'}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="font-semibold text-slate-900 text-xs truncate">
                  {user?.display_name || 'Rajesh Sharma'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                <div className="mt-1">
                  <RoleBadge role={user?.role || 'OWNER'} />
                </div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    logout();
                    setShowUserDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
