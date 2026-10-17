'use client';

import React, { useState, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { LeadCreateModal } from '@/components/leads/LeadCreateModal';
import { LeadDetailDrawer } from '@/components/leads/LeadDetailDrawer';
import { FollowUpModal } from '@/components/tasks/FollowUpModal';
import { SiteVisitModal } from '@/components/site-visits/SiteVisitModal';
import { Lead } from '@/lib/api';

interface ShellContextType {
  openNewLeadModal: () => void;
  openLeadDetails: (leadId: number) => void;
  openFollowUpModal: (lead: Lead) => void;
  openSiteVisitModal: (lead: Lead) => void;
  openMobileMenu: () => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const ShellContext = createContext<ShellContextType | undefined>(undefined);

export const useShell = () => {
  const context = useContext(ShellContext);
  if (!context) throw new Error('useShell must be used within AppShell');
  return context;
};

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newLeadModalOpen, setNewLeadModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [leadDrawerOpen, setLeadDrawerOpen] = useState(false);
  const [modalLead, setModalLead] = useState<Lead | null>(null);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [siteVisitModalOpen, setSiteVisitModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  const openMobileMenu = () => setMobileMenuOpen(true);
  const openNewLeadModal = () => setNewLeadModalOpen(true);
  const openLeadDetails = (leadId: number) => {
    setSelectedLeadId(leadId);
    setLeadDrawerOpen(true);
  };
  const openFollowUpModal = (lead: Lead) => {
    setModalLead(lead);
    setFollowUpModalOpen(true);
  };
  const openSiteVisitModal = (lead: Lead) => {
    setModalLead(lead);
    setSiteVisitModalOpen(true);
  };

  return (
    <ShellContext.Provider
      value={{
        openNewLeadModal,
        openLeadDetails,
        openFollowUpModal,
        openSiteVisitModal,
        openMobileMenu,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      <div className="flex h-screen overflow-hidden bg-[#F5F7FB] text-slate-900 font-sans">
        {/* Desktop Compact Sidebar */}
        <div className="hidden md:flex md:shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex flex-col w-[160px] max-w-xs bg-[#100D2B] h-full z-10 shadow-2xl">
              <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Workspace Column */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {pathname !== '/' && (
            <TopNav
              onOpenMobileMenu={openMobileMenu}
              onOpenNewLeadModal={openNewLeadModal}
            />
          )}
          <main className={`flex-1 overflow-y-auto ${pathname === '/' ? 'bg-[#F5F7FB]' : 'p-4 md:p-6 space-y-6 bg-slate-50'}`}>
            {children}
          </main>
        </div>

        {/* Global Modals & Drawers */}
        <LeadCreateModal
          isOpen={newLeadModalOpen}
          onClose={() => setNewLeadModalOpen(false)}
          onLeadCreated={triggerRefresh}
        />

        <LeadDetailDrawer
          leadId={selectedLeadId}
          isOpen={leadDrawerOpen}
          onClose={() => setLeadDrawerOpen(false)}
          onLeadUpdated={triggerRefresh}
          onOpenScheduleFollowUp={openFollowUpModal}
          onOpenScheduleSiteVisit={openSiteVisitModal}
        />

        <FollowUpModal
          isOpen={followUpModalOpen}
          onClose={() => setFollowUpModalOpen(false)}
          lead={modalLead}
          onFollowUpScheduled={triggerRefresh}
        />

        <SiteVisitModal
          isOpen={siteVisitModalOpen}
          onClose={() => setSiteVisitModalOpen(false)}
          lead={modalLead}
          onVisitScheduled={triggerRefresh}
        />
      </div>
    </ShellContext.Provider>
  );
};
