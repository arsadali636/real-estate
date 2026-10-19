'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  Briefcase,
  Target,
  BadgeCheck,
} from 'lucide-react';
import { useAuth, SEEDED_DEMO_ACCOUNTS } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, switchDemoRole } = useAuth();

  const [username, setUsername] = useState('admin@estatevo.io');
  const [password, setPassword] = useState('EstateFlow@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quick' | 'credentials'>('quick');

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both email/username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      await login(username.trim(), password.trim());
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Invalid login credentials. Please check and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleQuickLogin = async (role: string, targetUsername: string, email: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setUsername(email);
    setPassword('EstateFlow@2026');

    try {
      // Direct token login using seeded credentials or switchDemoRole
      try {
        await login(email, 'EstateFlow@2026');
      } catch {
        await switchDemoRole(role, targetUsername);
      }
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Unable to sign in as ' + targetUsername);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const roleProfiles = [
    {
      role: 'OWNER',
      title: 'Owner / Admin',
      name: 'Rajesh Sharma',
      jobTitle: 'Managing Director & Founder',
      username: 'admin',
      email: 'admin@estatevo.io',
      scope: 'Organization-Wide Access',
      leadCount: '75 Leads (All Data)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      accentColor: 'hover:border-purple-500/60',
      icon: ShieldCheck,
      description: 'Complete visibility into all projects, organizational revenue, global reports, and user access.',
    },
    {
      role: 'MANAGER',
      title: 'Sales Manager',
      name: 'Ananya Verma',
      jobTitle: 'VP of Residential Sales',
      username: 'manager',
      email: 'manager@estatevo.io',
      scope: 'Sales Department Operations',
      leadCount: '75 Leads (Pipeline & Reassignment)',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      accentColor: 'hover:border-blue-500/60',
      icon: Briefcase,
      description: 'Full team pipeline management, site visit targets, lead redistribution, and stage conversion analytics.',
    },
    {
      role: 'TEAM_LEAD',
      title: 'Team Lead (New Role)',
      name: 'Rahul Saxena',
      jobTitle: 'Residential Team Lead (East Bengaluru)',
      username: 'rahul.tl',
      email: 'rahul.tl@estatevo.io',
      scope: 'Team Members: Rahul + Sarah + Priya',
      leadCount: '36 Team Leads & Tasks',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      accentColor: 'hover:border-amber-500/60',
      icon: Target,
      description: 'Manages assigned team of agents, tracks team follow-ups & site visits, and reassigns leads within team.',
    },
    {
      role: 'EXECUTIVE',
      title: 'Senior Relationship Mgr',
      name: 'Sarah Jenkins',
      jobTitle: 'Sr. Relationship Manager (East Team)',
      username: 'sarah.agent',
      email: 'sarah.agent@estatevo.io',
      scope: 'Personal Assigned Leads Only',
      leadCount: '12 Assigned Leads',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      accentColor: 'hover:border-emerald-500/60',
      icon: Users,
      description: 'Focused high-velocity workflow: personalized reminders, calling queues, visits, and direct bookings.',
    },
    {
      role: 'EXECUTIVE',
      title: 'Luxury Consultant',
      name: 'Vikram Malhotra',
      jobTitle: 'Luxury Portfolio Consultant',
      username: 'vikram.agent',
      email: 'vikram.agent@estatevo.io',
      scope: 'Personal Assigned Leads Only',
      leadCount: '13 Assigned Leads',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      accentColor: 'hover:border-cyan-500/60',
      icon: BadgeCheck,
      description: 'Ultra-luxury client management with high-ticket villa & penthouse buyer pipelines.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0D0B21] text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Banner Navigation */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#211C47] bg-[#120F2E]/70 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#100D2B] rounded-[10px] flex items-center justify-center">
              <span className="font-black text-xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-300">
                E
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-white">ESTATEVO</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                CRM 2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Enterprise Real Estate Intelligence Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-medium">Backend Live & Connected</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8 items-start justify-center">
        {/* Left Column: Brand & Role Selector */}
        <div className="w-full lg:w-7/12 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Role-Based Authentication & Data Scoping
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Select Your Role to Access <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-300">
                Role-Specific CRM Intelligence
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-xl">
              Each user role is strictly partitioned with server-side Django permissions. 
              Click any profile below for <strong>instant 1-click login</strong> into that exact data scope.
            </p>
          </div>

          {/* Quick 1-Click Role Profiles Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              <span>Configured Roles ({roleProfiles.length})</span>
              <span className="text-emerald-400 lowercase font-mono">Password: EstateFlow@2026</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roleProfiles.map((prof) => {
                const IconComponent = prof.icon;
                return (
                  <button
                    key={prof.username}
                    type="button"
                    onClick={() => handleRoleQuickLogin(prof.role, prof.username, prof.email)}
                    disabled={isLoading}
                    className={`w-full text-left p-3.5 rounded-xl bg-[#171338]/80 hover:bg-[#1E1949] border border-[#2D2660] ${prof.accentColor} transition-all duration-200 shadow-md hover:shadow-indigo-500/10 group cursor-pointer relative overflow-hidden`}
                  >
                    {/* Top Role Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${prof.badgeColor}`}>
                        {prof.title}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {prof.leadCount}
                      </span>
                    </div>

                    {/* User Info Row */}
                    <div className="flex items-center gap-3 mt-1">
                      <img
                        src={prof.avatar}
                        alt={prof.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-600/50 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors truncate">
                          {prof.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{prof.jobTitle}</div>
                        <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">{prof.email}</div>
                      </div>
                    </div>

                    {/* Scope details */}
                    <div className="mt-3 pt-2.5 border-t border-[#251F52] flex items-center justify-between text-[11px] text-slate-300">
                      <span className="truncate text-slate-400">{prof.scope}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                        Sign In <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Login Form */}
        <div className="w-full lg:w-5/12 bg-[#171338] border border-[#2F2766] rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          <div className="flex items-center justify-between border-b border-[#2A235D] pb-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Sign In to Workspace</h2>
              <p className="text-xs text-slate-400 mt-0.5">Use email/username or 1-click role logins</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            {/* Username / Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username or Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@estatevo.io or rahul.tl"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0F0C27] border border-[#342B6E] rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">Default: <code className="text-indigo-300 font-mono">EstateFlow@2026</code></span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-[#0F0C27] border border-[#342B6E] rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {username.split('@')[0]}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Helper Footer */}
          <div className="mt-6 pt-5 border-t border-[#261F54] space-y-2 text-xs text-slate-400">
            <div className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
              Role Credentials Summary:
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded-lg bg-[#0F0C27] border border-[#2A225E]">
                <div className="text-purple-300 font-bold">Admin:</div>
                <div className="truncate">admin@estatevo.io</div>
              </div>
              <div className="p-2 rounded-lg bg-[#0F0C27] border border-[#2A225E]">
                <div className="text-blue-300 font-bold">Manager:</div>
                <div className="truncate">manager@estatevo.io</div>
              </div>
              <div className="p-2 rounded-lg bg-[#0F0C27] border border-[#2A225E]">
                <div className="text-amber-300 font-bold">Team Lead:</div>
                <div className="truncate">rahul.tl@estatevo.io</div>
              </div>
              <div className="p-2 rounded-lg bg-[#0F0C27] border border-[#2A225E]">
                <div className="text-emerald-300 font-bold">Senior Agent:</div>
                <div className="truncate">sarah.agent@estatevo.io</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-[#211C47] text-center text-xs text-slate-500">
        ESTATEVO Real Estate CRM &copy; 2026. Production Cloud Deployment on Railway.
      </footer>
    </div>
  );
}
