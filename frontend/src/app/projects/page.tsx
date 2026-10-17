'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Search,
  Filter,
  Plus,
  MapPin,
  IndianRupee,
  Home,
  CheckCircle2,
  Clock,
  Download,
  Share2,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  X,
  FileText,
} from 'lucide-react';
import { api, Project, PropertyUnit } from '@/lib/api';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { TableSkeleton } from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected project for detailed inventory drawer
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectUnits, setProjectUnits] = useState<PropertyUnit[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);
  const [copyLinkNotice, setCopyLinkNotice] = useState(false);

  // Add Project Modal
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    developer_name: '',
    location: '',
    city: 'Bengaluru',
    property_type: 'Apartment',
    price_min: '',
    price_max: '',
    total_units: '50',
    status: 'Under Construction',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&auto=format&fit=crop&q=80',
    brochure_url: 'https://example.com/brochures/project-deck.pdf',
  });
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getProjects({
        search: search.trim() || undefined,
        property_type: typeFilter || undefined,
        status: statusFilter || undefined,
      });
      const list = Array.isArray(res) ? res : res.results;
      setProjects(list || []);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [search, typeFilter, statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleOpenProjectDetails = async (p: Project) => {
    setSelectedProject(p);
    setIsLoadingUnits(true);
    try {
      const res = await api.getPropertyUnits({ project: p.id });
      const unitsList = Array.isArray(res) ? res : res.results;
      setProjectUnits(unitsList || []);
    } catch {
      // Ignore
    } finally {
      setIsLoadingUnits(false);
    }
  };

  const handleUpdateUnitStatus = async (unitId: number, newStatus: 'Available' | 'Reserved' | 'Sold') => {
    try {
      await api.updatePropertyUnit(unitId, { status: newStatus });
      setProjectUnits((prev) =>
        prev.map((u) => (u.id === unitId ? { ...u, status: newStatus } : u))
      );
      // Refresh projects
      fetchProjects();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    }
  };

  const handleCopyPublicLink = () => {
    if (selectedProject) {
      const link = `${window.location.origin}/projects?view=${selectedProject.slug}`;
      navigator.clipboard.writeText(link);
      setCopyLinkNotice(true);
      setTimeout(() => setCopyLinkNotice(false), 4000);
    }
  };

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingProject(true);
    try {
      await api.createProject({
        ...newProject,
        property_type: newProject.property_type as Project['property_type'],
        status: newProject.status as Project['status'],
        price_min: newProject.price_min,
        price_max: newProject.price_max,
        total_units: Number(newProject.total_units),
        amenities: ['Clubhouse', 'Swimming Pool', 'Gymnasium', 'Landscaped Gardens', '24/7 Security'],
      });
      setAddProjectOpen(false);
      fetchProjects();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setIsCreatingProject(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Projects & Property Inventory</h2>
          <p className="text-xs text-slate-500">
            Real estate catalog, developer details, unit availability, and brochures
          </p>
        </div>

        {user?.is_manager_or_above && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setAddProjectOpen(true)}
          >
            Add Project
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects, developers, localities..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="Apartment">Apartment</option>
          <option value="Villa">Villa</option>
          <option value="Commercial">Commercial</option>
          <option value="Penthouse">Penthouse</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="Pre-Launch">Pre-Launch</option>
          <option value="Under Construction">Under Construction</option>
          <option value="Ready to Move">Ready to Move</option>
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Projects Grid */}
      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : projects.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-sm font-semibold text-slate-700">No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleOpenProjectDetails(project)}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer overflow-hidden flex flex-col group"
            >
              {/* Project Image */}
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <img
                  src={project.image_url}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <StatusBadge status={project.status} />
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                  {project.property_type}
                </div>
              </div>

              {/* Project Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                    {project.developer_name}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {project.location}, {project.city}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Pricing & Units Stats */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium uppercase">Price Range</span>
                    <div className="font-bold text-slate-900">
                      ₹{(Number(project.price_min) / 100000).toFixed(1)}L - ₹
                      {(Number(project.price_max) / 10000000).toFixed(2)} Cr
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-medium uppercase">Available Inventory</span>
                    <div className="font-bold text-emerald-600">
                      {project.available_units_count} / {project.total_units} Units
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Detail Drawer */}
      <Drawer
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        title={selectedProject?.name || 'Project Details'}
        subtitle={`${selectedProject?.developer_name} • ${selectedProject?.location}, ${selectedProject?.city}`}
        width="2xl"
      >
        {selectedProject && (
          <div className="space-y-6">
            {/* Copy Public Link Notice */}
            {copyLinkNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  Public-safe project link copied to clipboard! (Internal leads and notes are never exposed externally).
                </span>
              </div>
            )}

            {/* Hero Image */}
            <div className="h-56 w-full rounded-xl overflow-hidden border border-slate-200 relative">
              <img
                src={selectedProject.image_url}
                alt={selectedProject.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90 backdrop-blur-xs text-xs font-semibold"
                  leftIcon={<Share2 className="w-3.5 h-3.5" />}
                  onClick={handleCopyPublicLink}
                >
                  Share Link
                </Button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <div className="text-lg font-bold text-emerald-700">
                  {selectedProject.available_units_count}
                </div>
                <div className="text-[11px] font-semibold text-emerald-600">Available</div>
              </div>
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                <div className="text-lg font-bold text-amber-700">
                  {selectedProject.reserved_units_count}
                </div>
                <div className="text-[11px] font-semibold text-amber-600">Reserved</div>
              </div>
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl">
                <div className="text-lg font-bold text-slate-700">
                  {selectedProject.sold_units_count}
                </div>
                <div className="text-[11px] font-semibold text-slate-500">Sold</div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Project Overview
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {selectedProject.description}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Key Amenities
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedProject.amenities?.map((amenity) => (
                  <span
                    key={amenity}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* Brochure Link Section */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Official Project Brochure & Floor Plans</div>
                  <div className="text-[11px] text-slate-500">Includes master layout, specifications & payment schedule</div>
                </div>
              </div>
              <a
                href={selectedProject.brochure_url || '#'}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download Deck
              </a>
            </div>

            {/* Inventory Units Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Unit Inventory Management
                </h4>
                <span className="text-[11px] text-slate-500">
                  {projectUnits.length} configured units
                </span>
              </div>

              {isLoadingUnits ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading units...</div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                      <tr>
                        <th className="p-2.5">Unit / Tower</th>
                        <th className="p-2.5">Type & Area</th>
                        <th className="p-2.5">Price</th>
                        <th className="p-2.5">Status</th>
                        {user?.is_manager_or_above && <th className="p-2.5 text-right">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {projectUnits.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-bold text-slate-900">
                            {u.unit_number}
                            <div className="text-[10px] text-slate-400 font-normal">
                              {u.tower} • Floor {u.floor}
                            </div>
                          </td>
                          <td className="p-2.5 text-slate-700">
                            {u.unit_type}
                            <div className="text-[10px] text-slate-400">{u.area_sqft} sq.ft</div>
                          </td>
                          <td className="p-2.5 font-semibold text-slate-900">
                            ₹{(Number(u.price) / 100000).toFixed(1)}L
                          </td>
                          <td className="p-2.5">
                            <StatusBadge status={u.status} />
                          </td>
                          {user?.is_manager_or_above && (
                            <td className="p-2.5 text-right">
                              <select
                                value={u.status}
                                onChange={(e) =>
                                  handleUpdateUnitStatus(
                                    u.id,
                                    e.target.value as 'Available' | 'Reserved' | 'Sold'
                                  )
                                }
                                className="text-[11px] bg-slate-50 border border-slate-200 rounded px-1.5 py-1 focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="Available">Available</option>
                                <option value="Reserved">Reserved</option>
                                <option value="Sold">Sold</option>
                              </select>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Add Project Modal */}
      <Modal
        isOpen={addProjectOpen}
        onClose={() => setAddProjectOpen(false)}
        title="Register New Real Estate Project"
        description="Add a project to the organization inventory."
        maxWidth="xl"
      >
        <form onSubmit={handleCreateProjectSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name *</label>
              <input
                type="text"
                required
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="e.g. Prestige Lavender"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Developer Name *</label>
              <input
                type="text"
                required
                value={newProject.developer_name}
                onChange={(e) => setNewProject({ ...newProject, developer_name: e.target.value })}
                placeholder="e.g. Prestige Estates"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location *</label>
              <input
                type="text"
                required
                value={newProject.location}
                onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                placeholder="e.g. Sarjapur Road"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Property Type</label>
              <select
                value={newProject.property_type}
                onChange={(e) => setNewProject({ ...newProject, property_type: e.target.value as typeof newProject.property_type })}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Commercial">Commercial</option>
                <option value="Penthouse">Penthouse</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Min Price (₹) *</label>
              <input
                type="number"
                required
                value={newProject.price_min}
                onChange={(e) => setNewProject({ ...newProject, price_min: e.target.value })}
                placeholder="e.g. 12000000"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Price (₹) *</label>
              <input
                type="number"
                required
                value={newProject.price_max}
                onChange={(e) => setNewProject({ ...newProject, price_max: e.target.value })}
                placeholder="e.g. 24000000"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Project overview and unique selling proposition..."
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setAddProjectOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isCreatingProject}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
