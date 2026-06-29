/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Building2, Contact, Percent, Sparkles, FolderKanban, PlusCircle, 
  Download, Settings, Edit, Trash2, Search, Check, MapPin, Save, X
} from 'lucide-react';
import { Project, Lead, MalaysianState, PropertyType } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { STATE_AREAS, DEVELOPERS } from '../constants/mockData';

interface AdminPanelProps {
  projects: Project[];
  leads: Lead[];
  lang: 'en' | 'zh';
  onAddProject: (proj: Project) => void;
  onEditProject: (proj: Project) => void;
  onDeleteProject: (projId: string) => void;
  onUpdateLeadStatus: (leadId: string, status: 'New' | 'In Contact' | 'Qualified' | 'Archived') => void;
}

export default function AdminPanel({
  projects,
  leads,
  lang,
  onAddProject,
  onEditProject,
  onDeleteProject,
  onUpdateLeadStatus
}: AdminPanelProps) {
  const t = TRANSLATIONS[lang];

  // Search and view states
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'leads' | 'listings'>('leads');
  const [leadSearchText, setLeadSearchText] = useState<string>('');
  const [projectSearchText, setProjectSearchText] = useState<string>('');

  // Form overlay modal states
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form values state
  const [formName, setFormName] = useState<string>('');
  const [formDev, setFormDev] = useState<string>('');
  const [formState, setFormState] = useState<MalaysianState>('Kuala Lumpur');
  const [formArea, setFormArea] = useState<string>('KLCC');
  const [formPriceMin, setFormPriceMin] = useState<number>(450000);
  const [formPriceMax, setFormPriceMax] = useState<number>(950000);
  const [formType, setFormType] = useState<PropertyType>('Serviced Apartment');
  const [formBedrooms, setFormBedrooms] = useState<number>(2);
  const [formBathrooms, setFormBathrooms] = useState<number>(2);
  const [formBuiltMin, setFormBuiltMin] = useState<number>(850);
  const [formBuiltMax, setFormBuiltMax] = useState<number>(1200);
  const [formMaintenance, setFormMaintenance] = useState<number>(0.35);
  const [formYield, setFormYield] = useState<number>(5.5);
  const [formCarPark, setFormCarPark] = useState<number>(2);
  const [formTotalUnits, setFormTotalUnits] = useState<number>(300);
  const [formTotalFloors, setFormTotalFloors] = useState<number>(40);
  const [formFeatured, setFormFeatured] = useState<boolean>(false);
  const [formAirbnb, setFormAirbnb] = useState<boolean>(true);
  const [formHighlights, setFormHighlights] = useState<string>('Connected directly to premier shopping hubs & MRT stations.');
  const [formDescription, setFormDescription] = useState<string>('Luxury residential suites engineered for peak investment returns and maximum urban living.');

  // Area option helper based on formState
  const areaOptions = STATE_AREAS[formState] || [];

  // KPI Calculations
  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const totalLeads = leads.length;
    const featuredCount = projects.filter((p) => p.featured).length;
    const avgYield = totalProjects > 0 
      ? (projects.reduce((acc, p) => acc + p.rentalYield, 0) / totalProjects).toFixed(1) 
      : '0.0';

    return {
      totalProjects,
      totalLeads,
      featuredCount,
      avgYield
    };
  }, [projects, leads]);

  // Filter leads by search Text
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const searchLower = leadSearchText.toLowerCase();
      return (
        l.name.toLowerCase().includes(searchLower) ||
        (l.email && l.email.toLowerCase().includes(searchLower)) ||
        l.phone.includes(searchLower) ||
        (l.projectInterested && l.projectInterested.toLowerCase().includes(searchLower))
      );
    });
  }, [leads, leadSearchText]);

  // Filter projects inside manager list
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const searchLower = projectSearchText.toLowerCase();
      return (
        p.name.toLowerCase().includes(searchLower) ||
        p.developer.toLowerCase().includes(searchLower) ||
        p.area.toLowerCase().includes(searchLower)
      );
    });
  }, [projects, projectSearchText]);

  // Handle open modal for creating
  const openCreateModal = () => {
    setEditingProject(null);
    setFormName('');
    setFormDev('EcoWorld Development');
    setFormState('Kuala Lumpur');
    setFormArea('KLCC');
    setFormPriceMin(450000);
    setFormPriceMax(950000);
    setFormType('Serviced Apartment');
    setFormBedrooms(2);
    setFormBathrooms(2);
    setFormBuiltMin(850);
    setFormBuiltMax(1200);
    setFormMaintenance(0.35);
    setFormYield(5.5);
    setFormCarPark(2);
    setFormTotalUnits(300);
    setFormTotalFloors(40);
    setFormFeatured(false);
    setFormAirbnb(true);
    setFormHighlights('Premier direct connection to urban MRT high tracks.');
    setFormDescription('An elite residential project styled for international buyers.');
    setShowFormModal(true);
  };

  // Handle open modal for editing
  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setFormName(proj.name);
    setFormDev(proj.developer);
    setFormState(proj.state);
    setFormArea(proj.area || STATE_AREAS[proj.state][0]);
    setFormPriceMin(proj.priceMin);
    setFormPriceMax(proj.priceMax);
    setFormType(proj.propertyType);
    setFormBedrooms(proj.bedrooms);
    setFormBathrooms(proj.bathrooms);
    setFormBuiltMin(proj.builtUpMin);
    setFormBuiltMax(proj.builtUpMax);
    setFormMaintenance(proj.maintenanceFee);
    setFormYield(proj.rentalYield);
    setFormCarPark(proj.carPark || 2);
    setFormTotalUnits(proj.totalUnits || 300);
    setFormTotalFloors(proj.totalFloors || 40);
    setFormFeatured(proj.featured);
    setFormAirbnb(proj.airbnbFriendly);
    setFormHighlights(proj.keyHighlights[0] || '');
    setFormDescription(proj.description || '');
    setShowFormModal(true);
  };

  // Handle saving the project form (Create or Update)
  const handleSaveProjectForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formDev) return;

    // Use high quality royalty free unsplash templates matching specified parameters
    let computedImage = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
    if (formType === 'Landed') {
      computedImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
    } else if (formPriceMin > 1200000) {
      computedImage = 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=800&q=80';
    }

    const payload: Project = {
      id: editingProject ? editingProject.id : `project-${Date.now()}`,
      name: formName,
      developer: formDev,
      state: formState,
      area: formArea,
      priceMin: Number(formPriceMin),
      priceMax: Number(formPriceMax),
      completionYear: 2027,
      propertyType: formType,
      tenure: formType === 'Landed' ? 'Freehold' : 'Leasehold',
      furnishing: 'Fully Furnished',
      bedrooms: Number(formBedrooms),
      bathrooms: Number(formBathrooms),
      carPark: Number(formCarPark),
      totalUnits: Number(formTotalUnits),
      totalFloors: Number(formTotalFloors),
      builtUpMin: Number(formBuiltMin),
      builtUpMax: Number(formBuiltMax),
      maintenanceFee: Number(formMaintenance),
      airbnbFriendly: formAirbnb,
      investmentScore: formAirbnb ? 9.0 : 7.8,
      ownStayScore: formType === 'Landed' ? 9.5 : 8.4,
      rentalYield: Number(formYield),
      keyHighlights: [formHighlights, 'High strategic transit node with automated security perimeter coverage.'],
      nearbyAmenities: [`Transit hub & Mall Enclave (2 mins drive)`, `Public International Schools (5 mins walk)`],
      featured: formFeatured,
      image: editingProject ? editingProject.image : computedImage,
      gallery: editingProject ? editingProject.gallery : [computedImage],
      vrTourLink: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
      droneViewLink: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
      description: formDescription
    };

    if (editingProject) {
      onEditProject(payload);
    } else {
      onAddProject(payload);
    }

    setShowFormModal(false);
  };

  // CSV Lead exporter download builder
  const downloadLeadsCSV = () => {
    if (leads.length === 0) return;

    // Set headers
    const headers = ['Lead ID', 'Client Name', 'Phone Number', 'Email', 'Budget Pref', 'Purpose Pref', 'Project Enquired', 'Registered Timestamp', 'Follow-up Status'];
    const rows = leads.map((l) => [
      l.id,
      l.name,
      l.phone,
      l.email || 'N/A',
      l.budgetRange || 'N/A',
      l.purpose || 'N/A',
      l.projectInterested || 'N/A',
      l.timestamp,
      l.status
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `malaysianhomes-crm-leads-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-left" id="developer-admin-panel">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <Settings className="h-6 w-6 text-teal-705 animate-spin-slow" />
            <h2 className="font-display text-2xl font-black text-stone-900">
              {t.adminTitle}
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1 font-bold">
            {t.adminSub}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-1.5 rounded-xl bg-stone-900 text-white hover:bg-stone-850 px-5 py-3 text-xs font-black shadow-xs transition-colors cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>{t.createProject}</span>
        </button>
      </div>

      {/* KPI METRICS WIDGET BANNER */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-[#ebdcb9] bg-white p-5 shadow-xs flex items-center space-x-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-50 text-stone-900 border border-stone-200">
            <FolderKanban className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="block text-[11px] font-black uppercase tracking-wider text-stone-400">{t.statsTotalProjects}</span>
            <span className="font-mono text-xl font-black text-stone-900">{stats.totalProjects}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#ebdcb9] bg-white p-5 shadow-xs flex items-center space-x-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#C5A059] border border-stone-200">
            <Contact className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="block text-[11px] font-black uppercase tracking-wider text-stone-400">{t.statsTotalLeads}</span>
            <span className="font-mono text-xl font-black text-stone-900">{stats.totalLeads}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#ebdcb9] bg-white p-5 shadow-xs flex items-center space-x-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAF8F5] text-teal-705 border border-stone-200">
            <Percent className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="block text-[11px] font-black uppercase tracking-wider text-stone-400">{t.statsAvgYield}</span>
            <span className="font-mono text-xl font-black text-stone-900">{stats.avgYield}% p.a.</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#ebdcb9] bg-white p-5 shadow-xs flex items-center space-x-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAF8F5] text-teal-800 border border-stone-200">
            <Sparkles className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="block text-[11px] font-black uppercase tracking-wider text-stone-400">{t.statsFeaturedCount}</span>
            <span className="font-mono text-xl font-black text-stone-900">{stats.featuredCount}</span>
          </div>
        </div>
      </div>

      {/* SUB MENU SUB TABS SELECTION */}
      <div className="mb-6 flex border-b border-stone-200 pb-px">
        <button
          onClick={() => setActiveAdminSubTab('leads')}
          className={`px-4 py-3 text-sm font-black border-b-2 transition-all cursor-pointer ${
            activeAdminSubTab === 'leads'
              ? 'border-teal-705 text-teal-705'
              : 'border-transparent text-stone-500 hover:text-stone-850'
          }`}
        >
          {t.activeLeads} ({leads.length})
        </button>
        <button
          onClick={() => setActiveAdminSubTab('listings')}
          className={`px-4 py-3 text-sm font-black border-b-2 transition-all cursor-pointer ${
            activeAdminSubTab === 'listings'
              ? 'border-teal-705 text-teal-705'
              : 'border-transparent text-stone-500 hover:text-stone-850'
          }`}
        >
          Manage Listing Projects ({projects.length})
        </button>
      </div>

      {/* SUB BLOCK 1: LEADS/CRM LIST */}
      {activeAdminSubTab === 'leads' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={leadSearchText}
                onChange={(e) => setLeadSearchText(e.target.value)}
                placeholder="Search leads by name, email, or intent project..."
                className="block w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-4 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-teal-705"
              />
            </div>

            {leads.length > 0 && (
              <button
                onClick={downloadLeadsCSV}
                className="flex items-center space-x-1.5 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-black text-stone-700 hover:bg-stone-50 transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t.exportCSV}</span>
              </button>
            )}
          </div>

          {filteredLeads.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-[#ebdcb9] bg-[#FAF8F5] p-6">
              <p className="text-xs font-black text-stone-400">{t.noLeads}</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto rounded-xl border border-[#ebdcb9] bg-white">
              <table className="w-full min-w-[700px] border-collapse text-xs">
                <thead className="bg-[#FAF8F5] text-[10px] font-black uppercase tracking-wider text-stone-500">
                  <tr>
                    <th className="p-4 text-left">Timestamp</th>
                    <th className="p-4 text-left">Client Contact</th>
                    <th className="p-4 text-left">Preferred Budget</th>
                    <th className="p-4 text-left">Interest Sector</th>
                    <th className="p-4 text-left">Follow-Up Action Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-bold text-stone-700">
                  {filteredLeads.map((ld) => (
                    <tr key={ld.id} className="hover:bg-[#FAF8F5]/50">
                      <td className="p-4 font-mono select-none">
                        {new Date(ld.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <p className="font-black text-stone-900">{ld.name}</p>
                        <p className="text-stone-400 mt-0.5">{ld.phone} • {ld.email}</p>
                      </td>
                      <td className="p-4">
                        <span className="rounded bg-teal-50 px-2.5 py-1 font-black text-teal-850">
                          {ld.budgetRange || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 text-stone-900 max-w-[180px] truncate">
                        {ld.projectInterested}
                      </td>
                      <td className="p-4">
                        <select
                          value={ld.status}
                          onChange={(e) => onUpdateLeadStatus(ld.id, e.target.value as any)}
                          className={`rounded border px-2.5 py-1 text-xs font-black focus:outline-hidden cursor-pointer ${
                            ld.status === 'New' 
                              ? 'border-blue-200 bg-blue-50 text-blue-700' 
                              : ld.status === 'In Contact' 
                              ? 'border-amber-200 bg-amber-50 text-amber-800'
                              : ld.status === 'Qualified'
                              ? 'border-green-200 bg-green-50 text-green-800'
                              : 'border-stone-200 bg-stone-50 text-stone-500'
                          }`}
                        >
                          <option value="New">🔵 New</option>
                          <option value="In Contact">🟡 In Contact</option>
                          <option value="Qualified">🟢 Qualified</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB BLOCK 2: MANAGE LISTINGS */}
      {activeAdminSubTab === 'listings' && (
        <div className="space-y-4">
          <div className="relative max-w-md text-left">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={projectSearchText}
              onChange={(e) => setProjectSearchText(e.target.value)}
              placeholder="Search properties by title, developer, or location..."
              className="block w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-4 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-teal-705"
            />
          </div>

          <div className="w-full overflow-x-auto rounded-xl border border-[#ebdcb9] bg-white">
            <table className="w-full min-w-[700px] border-collapse text-xs">
              <thead className="bg-[#FAF8F5] text-[10px] font-black uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="p-4 text-left">Thumbnail</th>
                  <th className="p-4 text-left">Project Name & Developer</th>
                  <th className="p-4 text-left">Region Coordinates</th>
                  <th className="p-4 text-left">Base Starting Price</th>
                  <th className="p-4 text-left">Yield %</th>
                  <th className="p-4 text-left">Features</th>
                  <th className="p-4 text-center">Control Panel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-bold text-stone-700">
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF8F5]/50">
                    <td className="p-4">
                      <img 
                        src={p.image || undefined} 
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="h-10 w-12 rounded object-cover shadow-xs border border-stone-100"
                      />
                    </td>
                    <td className="p-4 text-left">
                      <p className="font-black text-stone-900">{p.name}</p>
                      <p className="text-stone-400 mt-0.5">{p.developer} • {p.propertyType}</p>
                    </td>
                    <td className="p-4 text-left">
                      {p.area}, {p.state}
                    </td>
                    <td className="p-4 font-mono font-black text-stone-900">
                      RM {p.priceMin.toLocaleString()}
                    </td>
                    <td className="p-4 text-teal-755 font-black font-mono text-sm">
                      {p.rentalYield.toFixed(1)}%
                    </td>
                    <td className="p-4 text-left">
                      <div className="flex flex-wrap gap-1.5">
                        {p.featured && <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Featured</span>}
                        {p.airbnbFriendly && <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Airbnb Ready</span>}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-teal-800 p-2 cursor-pointer"
                          title="Edit Technical Spec"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Erase structural project: ${p.name}?`)) onDeleteProject(p.id);
                          }}
                          className="rounded-lg bg-red-50 hover:bg-red-150 border border-stone-200 text-red-500 p-2 cursor-pointer"
                          title="Purge listings completely"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CRUD POPUP FORM MODAL CONTAINER */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-[#ebdcb9] text-left max-h-[90vh] overflow-y-auto animate-in zoom-in duration-150">
            
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute top-4 right-4 rounded-full p-1.5 text-stone-400 hover:bg-stone-50 hover:text-stone-850 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-display text-lg font-black text-stone-900 border-b border-stone-100 pb-2 mb-4">
              {editingProject ? t.editProject : t.createProject}
            </h3>

            <form onSubmit={handleSaveProjectForm} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Project Name</label>
                  <input 
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. TRX Residences Block C"
                    className="block w-full rounded-lg border border-stone-200 bg-white py-2 px-3 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-teal-705"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Developer Company</label>
                  <select
                    value={formDev}
                    onChange={(e) => setFormDev(e.target.value)}
                    className="block w-full rounded-lg border border-stone-200 bg-white py-2 px-3 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-teal-705 cursor-pointer"
                  >
                    {DEVELOPERS.map((dev) => (
                      <option key={dev} value={dev}>{dev}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">State Division</label>
                  <select
                    value={formState}
                    onChange={(e) => {
                      const st = e.target.value as MalaysianState;
                      setFormState(st);
                      setFormArea(STATE_AREAS[st][0]); 
                    }}
                    className="block w-full rounded-lg border border-stone-200 bg-white py-2 px-3 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-teal-705 cursor-pointer"
                  >
                    <option value="Kuala Lumpur">Kuala Lumpur</option>
                    <option value="Selangor">Selangor</option>
                    <option value="Johor">Johor</option>
                    <option value="Penang">Penang</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Micro Area</label>
                  <select
                    value={formArea}
                    onChange={(e) => setFormArea(e.target.value)}
                    className="block w-full rounded-lg border border-stone-200 bg-white py-2 px-3 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-teal-705 cursor-pointer"
                  >
                    {areaOptions.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Floor Starting Price (RM)</label>
                  <input 
                    type="number"
                    min="10000"
                    required
                    value={formPriceMin}
                    onChange={(e) => setFormPriceMin(Number(e.target.value))}
                    className="block w-full rounded-lg border border-stone-200 bg-white py-2 px-3 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-teal-705"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Ceiling Cap Price (RM)</label>
                  <input 
                    type="number"
                    min="10000"
                    required
                    value={formPriceMax}
                    onChange={(e) => setFormPriceMax(Number(e.target.value))}
                    className="block w-full rounded-lg border border-stone-200 bg-white py-2 px-3 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-teal-705"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Property Type Badge</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as PropertyType)}
                    className="block w-full rounded-lg border border-stone-200 bg-white py-2 px-3 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-teal-705 cursor-pointer"
                  >
                    <option value="Serviced Apartment">Serviced Apartment</option>
                    <option value="Condo">Condo</option>
                    <option value="Landed">Landed</option>
                    <option value="Penthouse">Penthouse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Bedrooms</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={formBedrooms}
                    onChange={(e) => setFormBedrooms(Number(e.target.value))}
                    className="block w-full rounded-lg border border-stone-200 bg-white py-2 px-3 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-teal-705"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Bathrooms</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={formBathrooms}
                    onChange={(e) => setFormBathrooms(Number(e.target.value))}
                    className="block w-full rounded-lg border border-stone-200 bg-white py-2 px-3 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-teal-705"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Built-Up Min (sqft)</label>
                  <input 
                    type="number"
                    min="100"
                    required
                    value={formBuiltMin}
                    onChange={(e) => setFormBuiltMin(Number(e.target.value))}
                    className="block w-full rounded-lg border border-stone-200 bg-white py-2 px-3 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-teal-705"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Built-Up Max (sqft)</label>
                  <input 
                    type="number"
                    min="100"
                    required
                    value={formBuiltMax}
                    onChange={(e) => setFormBuiltMax(Number(e.target.value))}
                    className="block w-full rounded-lg border border-stone-200 bg-white py-2 px-3 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-teal-705"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1 font-sans">Maintenance Fee (RM/sqft)</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formMaintenance}
                    onChange={(e) => setFormMaintenance(Number(e.target.value))}
                    className="block w-full rounded-lg border border-stone-200 bg-white py-2 px-3 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-teal-705"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Car Park Bays</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={formCarPark}
                    onChange={(e) => setFormCarPark(Number(e.target.value))}
                    className="block w-full rounded-lg border border-stone-200 bg-white py-2 px-3 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-teal-705"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Total Units</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={formTotalUnits}
                    onChange={(e) => setFormTotalUnits(Number(e.target.value))}
                    className="block w-full rounded-lg border border-stone-200 bg-white py-2 px-3 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-teal-705"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Total Floors</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={formTotalFloors}
                    onChange={(e) => setFormTotalFloors(Number(e.target.value))}
                    className="block w-full rounded-lg border border-stone-200 bg-white py-2 px-3 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-teal-705"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 whitespace-nowrap pt-2">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Estimated Rental Yield %</label>
                  <input 
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={formYield}
                    onChange={(e) => setFormYield(Number(e.target.value))}
                    className="block w-full rounded-lg border border-stone-200 bg-white py-2 px-3 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-teal-705"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-5">
                  <input 
                    type="checkbox"
                    id="form-checkbox-featured"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="h-4.5 w-4.5 accent-stone-950 cursor-pointer"
                  />
                  <label htmlFor="form-checkbox-featured" className="text-xs font-bold text-stone-700 select-none cursor-pointer">Feature on Core Slider</label>
                </div>
                <div className="flex items-center space-x-2 pt-5">
                  <input 
                    type="checkbox"
                    id="form-checkbox-airbnb"
                    checked={formAirbnb}
                    onChange={(e) => setFormAirbnb(e.target.checked)}
                    className="h-4.5 w-4.5 accent-stone-950 cursor-pointer"
                  />
                  <label htmlFor="form-checkbox-airbnb" className="text-xs font-bold text-stone-700 select-none cursor-pointer">Airbnb Friendly</label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Primary Selling Highlight</label>
                <input 
                  type="text"
                  required
                  value={formHighlights}
                  onChange={(e) => setFormHighlights(e.target.value)}
                  className="block w-full rounded-lg border border-stone-200 bg-white py-2 px-3 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-teal-705"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Full Description Overview</label>
                <textarea 
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="block w-full rounded-lg border border-stone-200 bg-white py-2 px-3 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-teal-705"
                />
              </div>

              <div className="flex justify-end space-x-2 border-t border-stone-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="rounded-lg border border-stone-250 px-4.5 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-stone-900 text-white hover:bg-stone-800 px-5.5 py-2 text-xs font-black cursor-pointer flex items-center space-x-1"
                >
                  <Save className="h-4 w-4" />
                  <span>{t.saveBtn}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
