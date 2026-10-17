export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000/api/v1';

export interface Organization {
  id: number;
  name: string;
  slug: string;
  currency_symbol: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'EXECUTIVE';
  job_title?: string;
  phone?: string;
  avatar_url?: string;
  organization?: Organization;
  is_active: boolean;
  is_owner_or_admin: boolean;
  is_manager_or_above: boolean;
}

export interface PropertyUnit {
  id: number;
  project: number;
  project_name?: string;
  unit_number: string;
  tower: string;
  floor: number;
  unit_type: string;
  area_sqft: number;
  price: string;
  status: 'Available' | 'Reserved' | 'Sold';
}

export interface Project {
  id: number;
  name: string;
  slug: string;
  developer_name: string;
  location: string;
  city: string;
  property_type: 'Apartment' | 'Villa' | 'Penthouse' | 'Commercial' | 'Plot';
  price_min: string;
  price_max: string;
  total_units: number;
  available_units_count: number;
  reserved_units_count: number;
  sold_units_count: number;
  leads_count?: number;
  status: 'Pre-Launch' | 'Under Construction' | 'Ready to Move' | 'Sold Out';
  description: string;
  amenities: string[];
  image_url: string;
  gallery: string[];
  brochure_url?: string;
  is_active: boolean;
  units?: PropertyUnit[];
  created_at: string;
}

export interface Lead {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  source: string;
  campaign?: string;
  interested_project?: number;
  interested_project_name?: string;
  min_budget?: string;
  max_budget?: string;
  preferred_location?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'New' | 'Contacted' | 'Interested' | 'Site Visit Scheduled' | 'Site Visit Done' | 'Negotiation' | 'Booked' | 'Lost';
  assigned_agent?: number;
  assigned_agent_name?: string;
  assigned_agent_avatar?: string;
  next_followup_date?: string;
  notes?: string;
  lost_reason?: string;
  booked_date?: string;
  booked_amount?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadActivity {
  id: number;
  lead: number;
  lead_name?: string;
  performed_by?: number;
  performed_by_name?: string;
  performed_by_avatar?: string;
  activity_type: string;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface FollowUpTask {
  id: number;
  lead: number;
  lead_name?: string;
  lead_phone?: string;
  lead_project_name?: string;
  assigned_to: number;
  assigned_to_name?: string;
  assigned_to_avatar?: string;
  task_type: 'Call' | 'Meeting' | 'Email' | 'WhatsApp follow-up' | 'General reminder';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  due_datetime: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  notes?: string;
  outcome?: string;
  completed_at?: string;
  created_at: string;
}

export interface SiteVisit {
  id: number;
  lead: number;
  lead_name?: string;
  lead_phone?: string;
  project: number;
  project_name?: string;
  project_location?: string;
  assigned_executive: number;
  assigned_executive_name?: string;
  assigned_executive_avatar?: string;
  scheduled_datetime: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show';
  outcome?: string;
  notes?: string;
  completed_at?: string;
  created_at: string;
}

export interface DashboardSummary {
  kpis: {
    total_leads: number;
    active_leads: number;
    unassigned_leads: number;
    booked_leads: number;
    not_interested_leads: number;
    dropped_leads: number;
    new_leads: number;
    pending_leads: number;
    callbacks_due: number;
    meetings_scheduled: number;
    site_visits_scheduled: number;
    overdue_followups: number;
    new_enquiries: number;
    followups_due_today: number;
    upcoming_site_visits: number;
    conversion_rate: number;
    total_revenue: number;
  };
  leads_trend?: Array<{ date: string; count: number }>;
  source_distribution: Array<{
    source: string;
    count: number;
    percentage: number;
    category?: string;
  }>;
  activity_breakdown?: {
    whatsapp: number;
    call: number;
    sms: number;
    email: number;
    meeting: number;
    total: number;
  };
  pipeline_funnel: Array<{ stage: string; count: number; total_budget: number }>;
  booking_performance?: {
    booked_leads: number;
    total_revenue: number;
    conversion_rate: number;
    target_pct: number;
  };
  agent_performance: Array<{
    id: number;
    name: string;
    avatar: string;
    leads: number;
    visits: number;
    tasks_done?: number;
    bookings: number;
    conversion_rate: number;
  }>;
  reminders?: Array<{
    id: string;
    raw_id: number;
    item_type: 'task' | 'visit';
    type: string;
    title: string;
    lead_id: number;
    lead_name: string;
    lead_phone: string;
    project_name?: string;
    agent_name: string;
    datetime: string;
    date: string;
    time: string;
    group: string;
    is_overdue: boolean;
    is_today: boolean;
    is_tomorrow: boolean;
    status: string;
  }>;
  site_visits_vs_bookings?: Array<{ category: string; count: number }>;
  recent_activities?: LeadActivity[];
  upcoming_followups?: FollowUpTask[];
  recent_leads?: Lead[];
}

export interface TeamMember extends User {
  assigned_leads_count: number;
  completed_tasks_count: number;
  completed_visits_count: number;
  booked_leads_count: number;
  conversion_rate: number;
  date_joined: string;
}

// Request Helper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined'
    ? (localStorage.getItem('estatevo_token') || localStorage.getItem('estateflow_token'))
    : null;
  const headers = new Headers(options.headers || {});
  
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Token ${token}`);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        // Clear invalid token
        localStorage.removeItem('estatevo_token');
        localStorage.removeItem('estatevo_user');
        localStorage.removeItem('estateflow_token');
        localStorage.removeItem('estateflow_user');
      }
    }

    if (!res.ok) {
      let errorMsg = `API Error: ${res.status} ${res.statusText}`;
      try {
        const errorJson = await res.json();
        if (errorJson.error) {
          errorMsg = errorJson.error;
        } else if (errorJson.detail) {
          errorMsg = errorJson.detail;
        } else if (typeof errorJson === 'object') {
          // Format validation errors
          errorMsg = Object.entries(errorJson)
            .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(', ') : errs}`)
            .join(' | ');
        }
      } catch {
        // Non-JSON error
      }
      throw new Error(errorMsg);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return await res.json();
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error(`Cannot connect to ESTATEVO Django API at ${API_BASE_URL}. Ensure the backend server is running.`);
    }
    throw err;
  }
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ token: string; user: User; message: string }> {
    return request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async logout(): Promise<{ message: string }> {
    return request('/auth/logout/', { method: 'POST' });
  },

  async getMe(): Promise<{ user: User }> {
    return request('/auth/me/');
  },

  async switchDemoRole(roleOrUsername: { role?: string; username?: string }): Promise<{ token: string; user: User; demo_notice: string }> {
    return request('/auth/switch-demo-role/', {
      method: 'POST',
      body: JSON.stringify(roleOrUsername),
    });
  },

  // Dashboard
  async getDashboardSummary(params?: {
    time_range?: string;
    project_id?: number | string;
    agent_id?: number | string;
    start_date?: string;
    end_date?: string;
  }): Promise<DashboardSummary> {
    const q = new URLSearchParams();
    if (params?.time_range) q.set('time_range', params.time_range);
    if (params?.project_id) q.set('project_id', String(params.project_id));
    if (params?.agent_id) q.set('agent_id', String(params.agent_id));
    if (params?.start_date) q.set('start_date', params.start_date);
    if (params?.end_date) q.set('end_date', params.end_date);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request(`/dashboard/summary/${queryStr}`);
  },

  // Leads
  async getLeads(params?: Record<string, string | number | boolean | undefined>): Promise<{ count: number; results: Lead[] } | Lead[]> {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== null) q.set(k, String(v));
      });
    }
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request(`/leads/${queryStr}`);
  },

  async getLead(id: number): Promise<Lead & { activities: LeadActivity[]; tasks: FollowUpTask[]; site_visits: SiteVisit[] }> {
    return request(`/leads/${id}/`);
  },

  async createLead(data: Partial<Lead>): Promise<Lead> {
    return request('/leads/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateLead(id: number, data: Partial<Lead>): Promise<Lead> {
    return request(`/leads/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async assignLead(id: number, agentId: number | null): Promise<{ message: string; lead: Lead }> {
    return request(`/leads/${id}/assign/`, {
      method: 'POST',
      body: JSON.stringify({ agent_id: agentId }),
    });
  },

  async changeLeadStatus(
    id: number,
    status: string,
    options?: { lost_reason?: string; booked_amount?: number | string }
  ): Promise<{ message: string; lead: Lead }> {
    return request(`/leads/${id}/change-status/`, {
      method: 'POST',
      body: JSON.stringify({ status, ...options }),
    });
  },

  async checkDuplicatePhone(phone: string): Promise<{ duplicate: boolean; lead?: Partial<Lead>; warning?: string }> {
    return request('/leads/check-duplicate/', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  async addLeadNote(id: number, note: string): Promise<{ message: string }> {
    return request(`/leads/${id}/add-note/`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  },

  async getLeadActivities(id: number): Promise<LeadActivity[]> {
    return request(`/leads/${id}/activities/`);
  },

  // Tasks / Follow-ups
  async getTasks(params?: Record<string, string | number | undefined>): Promise<{ count: number; results: FollowUpTask[] } | FollowUpTask[]> {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') q.set(k, String(v));
      });
    }
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request(`/tasks/${queryStr}`);
  },

  async createTask(data: Partial<FollowUpTask>): Promise<FollowUpTask> {
    return request('/tasks/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async completeTask(id: number, outcome: string): Promise<{ message: string; task: FollowUpTask }> {
    return request(`/tasks/${id}/complete/`, {
      method: 'POST',
      body: JSON.stringify({ outcome }),
    });
  },

  async rescheduleTask(id: number, dueDatetime: string): Promise<{ message: string; task: FollowUpTask }> {
    return request(`/tasks/${id}/reschedule/`, {
      method: 'POST',
      body: JSON.stringify({ due_datetime: dueDatetime }),
    });
  },

  // Projects
  async getProjects(params?: Record<string, string | number | undefined>): Promise<{ count: number; results: Project[] } | Project[]> {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') q.set(k, String(v));
      });
    }
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request(`/projects/${queryStr}`);
  },

  async getProject(id: number): Promise<Project> {
    return request(`/projects/${id}/`);
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    return request('/projects/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProject(id: number, data: Partial<Project>): Promise<Project> {
    return request(`/projects/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Property Units
  async getPropertyUnits(params?: Record<string, string | number | undefined>): Promise<{ count: number; results: PropertyUnit[] } | PropertyUnit[]> {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') q.set(k, String(v));
      });
    }
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request(`/properties/${queryStr}`);
  },

  async updatePropertyUnit(id: number, data: Partial<PropertyUnit>): Promise<PropertyUnit> {
    return request(`/properties/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Site Visits
  async getSiteVisits(params?: Record<string, string | number | undefined>): Promise<{ count: number; results: SiteVisit[] } | SiteVisit[]> {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') q.set(k, String(v));
      });
    }
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request(`/site-visits/${queryStr}`);
  },

  async createSiteVisit(data: Partial<SiteVisit>): Promise<SiteVisit> {
    return request('/site-visits/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async rescheduleSiteVisit(id: number, scheduledDatetime: string): Promise<{ message: string; site_visit: SiteVisit }> {
    return request(`/site-visits/${id}/reschedule/`, {
      method: 'POST',
      body: JSON.stringify({ scheduled_datetime: scheduledDatetime }),
    });
  },

  async updateSiteVisitStatus(id: number, status: string, outcome?: string): Promise<{ message: string; site_visit: SiteVisit }> {
    return request(`/site-visits/${id}/update-status/`, {
      method: 'POST',
      body: JSON.stringify({ status, outcome }),
    });
  },

  // Team
  async getTeamMembers(): Promise<{ count: number; results: TeamMember[] } | TeamMember[]> {
    return request('/team/members/');
  },

  async createTeamMember(data: Partial<User & { password?: string }>): Promise<TeamMember> {
    return request('/team/members/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Reports
  async getReport(type: string, params?: Record<string, string | number | undefined>): Promise<unknown> {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') q.set(k, String(v));
      });
    }
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request(`/reports/${type}/${queryStr}`);
  },

  getExportCsvUrl(params?: Record<string, string | number | undefined>): string {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') q.set(k, String(v));
      });
    }
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('estatevo_token') || localStorage.getItem('estateflow_token') || '')
      : '';
    if (token) q.set('token', token);
    return `${API_BASE_URL}/reports/export/csv/?${q.toString()}`;
  },
};
