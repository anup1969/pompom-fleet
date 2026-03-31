'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/session-context';
import Modal from '@/components/Modal';

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ─── Types ─── */
interface Route {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  route_type: string | null;
  departure_time: string | null;
  arrival_time: string | null;
  stops_count: number;
  created_at: string;
}

interface StopArea {
  id: string;
  name: string | null;
  stop_area_id: string;
}

interface Stop {
  id: string;
  tenant_id: string;
  route_id: string | null;
  name: string;
  sequence_order: number;
  yearly_fee: number | null;
  areas: StopArea[];
  created_at: string;
}

interface Area {
  id: string;
  tenant_id: string;
  name: string;
  created_at: string;
}

interface ClassItem {
  id: string;
  tenant_id: string;
  name: string;
  created_at: string;
}

interface SectionItem {
  id: string;
  tenant_id: string;
  name: string;
  created_at: string;
}

interface StopAreaLink {
  id: string;
  stop_id: string;
  area_id: string;
  stop_name: string | null;
  area_name: string | null;
}

interface Admission {
  id: string;
  tenant_id: string;
  student_name: string;
  father_name: string;
  surname: string | null;
  gender: string | null;
  class_grade: string | null;
  section: string | null;
  grn: string | null;
  dob: string | null;
  address: string | null;
  address_line1: string | null;
  address_line2: string | null;
  area_id: string | null;
  area_name: string | null;
  city: string | null;
  primary_mobile: string | null;
  secondary_mobile: string | null;
  route_id: string | null;
  stop_id: string | null;
  pickup_route_id: string | null;
  pickup_stop_id: string | null;
  drop_route_id: string | null;
  drop_stop_id: string | null;
  photo_url: string | null;
  route_name: string | null;
  stop_name: string | null;
  pickup_route_name: string | null;
  pickup_stop_name: string | null;
  drop_route_name: string | null;
  drop_stop_name: string | null;
  created_at: string;
  updated_at: string | null;
}

type TabKey = 'admissions' | 'routes' | 'stops' | 'areas' | 'classes';

/* ─── Helpers ─── */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_PALETTE = [
  { bg: 'var(--lightprimary)', color: 'var(--primary)' },
  { bg: 'var(--lightsuccess)', color: 'var(--success)' },
  { bg: 'var(--lightwarning)', color: '#b45309' },
  { bg: 'var(--lightsecondary)', color: '#0e7490' },
  { bg: 'var(--lighterror)', color: 'var(--error)' },
  { bg: 'var(--lightaccent)', color: '#92400e' },
];

function avatarColors(idx: number) {
  return AVATAR_PALETTE[idx % AVATAR_PALETTE.length];
}

function fmtTime(t: string | null): string {
  if (!t) return '--';
  // t is HH:MM:SS or HH:MM, show HH:MM AM/PM
  const parts = t.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

/* ─── Action Menu ─── */
function ActionMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="action-wrap" ref={ref}>
      <button className="btn-icon" onClick={() => setOpen(!open)}>&#8942;</button>
      <div className={`action-menu${open ? ' show' : ''}`}>
        <button onClick={() => { onEdit(); setOpen(false); }}>Edit</button>
        <button className="danger" onClick={() => { onDelete(); setOpen(false); }}>Delete</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════════ */
export default function AdmissionsPage() {
  const { tenant, loading: sessionLoading } = useSession();

  const [activeTab, setActiveTab] = useState<TabKey>('admissions');

  /* ── Routes ── */
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  const fetchRoutes = useCallback(async () => {
    if (!tenant?.id) return;
    setLoadingRoutes(true);
    try {
      const res = await fetch(`/api/routes?tenant_id=${tenant.id}`);
      if (res.ok) setRoutes(await res.json());
    } catch { /* ignore */ }
    finally { setLoadingRoutes(false); }
  }, [tenant?.id]);

  useEffect(() => { fetchRoutes(); }, [fetchRoutes]);

  /* ── Stops ── */
  const [stops, setStops] = useState<Stop[]>([]);
  const [loadingStops, setLoadingStops] = useState(true);

  const fetchStops = useCallback(async () => {
    if (!tenant?.id) return;
    setLoadingStops(true);
    try {
      const res = await fetch(`/api/stops?tenant_id=${tenant.id}`);
      if (res.ok) setStops(await res.json());
    } catch { /* ignore */ }
    finally { setLoadingStops(false); }
  }, [tenant?.id]);

  useEffect(() => { fetchStops(); }, [fetchStops]);

  /* ── Areas ── */
  const [areas, setAreas] = useState<Area[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(true);

  const fetchAreas = useCallback(async () => {
    if (!tenant?.id) return;
    setLoadingAreas(true);
    try {
      const res = await fetch(`/api/areas?tenant_id=${tenant.id}`);
      if (res.ok) setAreas(await res.json());
    } catch { /* ignore */ }
    finally { setLoadingAreas(false); }
  }, [tenant?.id]);

  useEffect(() => { fetchAreas(); }, [fetchAreas]);

  /* ── Stop-Areas (all links) ── */
  const [stopAreaLinks, setStopAreaLinks] = useState<StopAreaLink[]>([]);

  const fetchStopAreaLinks = useCallback(async () => {
    try {
      const res = await fetch('/api/stop-areas');
      if (res.ok) setStopAreaLinks(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchStopAreaLinks(); }, [fetchStopAreaLinks]);

  /* ── Classes ── */
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const fetchClasses = useCallback(async () => {
    if (!tenant?.id) return;
    setLoadingClasses(true);
    try {
      const res = await fetch(`/api/classes?tenant_id=${tenant.id}`);
      if (res.ok) setClasses(await res.json());
    } catch { /* ignore */ }
    finally { setLoadingClasses(false); }
  }, [tenant?.id]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  /* ── Sections ── */
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);

  const fetchSections = useCallback(async () => {
    if (!tenant?.id) return;
    setLoadingSections(true);
    try {
      const res = await fetch(`/api/sections?tenant_id=${tenant.id}`);
      if (res.ok) setSections(await res.json());
    } catch { /* ignore */ }
    finally { setLoadingSections(false); }
  }, [tenant?.id]);

  useEffect(() => { fetchSections(); }, [fetchSections]);

  /* ── Admissions ── */
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loadingAdmissions, setLoadingAdmissions] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterRoute, setFilterRoute] = useState('');
  const [filterStop, setFilterStop] = useState('');

  const fetchAdmissions = useCallback(async () => {
    if (!tenant?.id) return;
    setLoadingAdmissions(true);
    try {
      const res = await fetch(`/api/admissions?tenant_id=${tenant.id}`);
      if (res.ok) setAdmissions(await res.json());
    } catch { /* ignore */ }
    finally { setLoadingAdmissions(false); }
  }, [tenant?.id]);

  useEffect(() => { fetchAdmissions(); }, [fetchAdmissions]);

  /* ── Filtered admissions ── */
  const filteredAdmissions = admissions.filter((a) => {
    if (filterClass && a.class_grade !== filterClass) return false;
    if (filterSection && a.section !== filterSection) return false;
    if (filterRoute) {
      if (a.pickup_route_id !== filterRoute && a.drop_route_id !== filterRoute && a.route_id !== filterRoute) return false;
    }
    if (filterStop) {
      if (a.pickup_stop_id !== filterStop && a.drop_stop_id !== filterStop && a.stop_id !== filterStop) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const matches =
        a.student_name.toLowerCase().includes(q) ||
        a.father_name.toLowerCase().includes(q) ||
        (a.grn && a.grn.toLowerCase().includes(q)) ||
        (a.primary_mobile && a.primary_mobile.includes(q));
      if (!matches) return false;
    }
    return true;
  });

  function clearFilters() {
    setFilterClass('');
    setFilterSection('');
    setFilterRoute('');
    setFilterStop('');
    setSearch('');
  }

  /* ── Helper: find stop for area (auto-fill) ── */
  function findStopForArea(areaId: string): Stop | null {
    // Check stop_areas links
    const link = stopAreaLinks.find((sa) => sa.area_id === areaId);
    if (link) {
      const stop = stops.find((s) => s.id === link.stop_id);
      if (stop) return stop;
    }
    // Fallback: check stops.areas array
    for (const stop of stops) {
      if (stop.areas && stop.areas.some((a) => a.id === areaId)) return stop;
    }
    return null;
  }

  /* ══════════════════════════════════════════════════════
     ROUTE MODAL
     ══════════════════════════════════════════════════════ */
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [editRoute, setEditRoute] = useState<Route | null>(null);
  const [routeForm, setRouteForm] = useState({ name: '', description: '', route_type: 'pickup', departure_time: '', arrival_time: '' });
  const [savingRoute, setSavingRoute] = useState(false);

  function openRouteModal(route?: Route) {
    if (route) {
      setEditRoute(route);
      setRouteForm({
        name: route.name,
        description: route.description || '',
        route_type: route.route_type || 'pickup',
        departure_time: route.departure_time || '',
        arrival_time: route.arrival_time || '',
      });
    } else {
      setEditRoute(null);
      setRouteForm({ name: '', description: '', route_type: 'pickup', departure_time: '', arrival_time: '' });
    }
    setRouteModalOpen(true);
  }

  async function handleSaveRoute() {
    if (!tenant?.id || !routeForm.name.trim()) return;
    setSavingRoute(true);
    try {
      const payload: any = {
        tenant_id: tenant.id,
        name: routeForm.name.trim(),
        description: routeForm.description.trim() || null,
        route_type: routeForm.route_type || null,
        departure_time: routeForm.departure_time || null,
        arrival_time: routeForm.arrival_time || null,
      };
      const url = editRoute ? `/api/routes/${editRoute.id}` : '/api/routes';
      const method = editRoute ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        setRouteModalOpen(false);
        setEditRoute(null);
        fetchRoutes();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save route');
      }
    } catch { alert('Network error'); }
    finally { setSavingRoute(false); }
  }

  async function handleDeleteRoute(route: Route) {
    if (!confirm(`Delete route "${route.name}"?`)) return;
    try {
      const res = await fetch(`/api/routes/${route.id}`, { method: 'DELETE' });
      if (res.ok) fetchRoutes();
    } catch { /* ignore */ }
  }

  /* ══════════════════════════════════════════════════════
     STOP MODAL
     ══════════════════════════════════════════════════════ */
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [editStop, setEditStop] = useState<Stop | null>(null);
  const [stopForm, setStopForm] = useState({ name: '', yearly_fee: '', selectedAreaIds: [] as string[] });
  const [savingStop, setSavingStop] = useState(false);

  function openStopModal(stop?: Stop) {
    if (stop) {
      setEditStop(stop);
      setStopForm({
        name: stop.name,
        yearly_fee: stop.yearly_fee != null ? String(stop.yearly_fee) : '',
        selectedAreaIds: stop.areas ? stop.areas.map((a) => a.id!) : [],
      });
    } else {
      setEditStop(null);
      setStopForm({ name: '', yearly_fee: '', selectedAreaIds: [] });
    }
    setStopModalOpen(true);
  }

  async function handleSaveStop() {
    if (!tenant?.id || !stopForm.name.trim()) return;
    setSavingStop(true);
    try {
      const payload: any = {
        tenant_id: tenant.id,
        name: stopForm.name.trim(),
        yearly_fee: stopForm.yearly_fee ? parseFloat(stopForm.yearly_fee) : null,
      };
      const url = editStop ? `/api/stops/${editStop.id}` : '/api/stops';
      const method = editStop ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to save stop');
        return;
      }
      const savedStop = await res.json();
      const stopId = savedStop.id;

      // Sync area links
      if (editStop) {
        // Remove old links that are no longer selected
        const existingAreas = editStop.areas || [];
        for (const ea of existingAreas) {
          if (!stopForm.selectedAreaIds.includes(ea.id!)) {
            await fetch(`/api/stop-areas/${ea.stop_area_id}`, { method: 'DELETE' });
          }
        }
        // Add new links
        const existingAreaIds = existingAreas.map((a) => a.id);
        for (const areaId of stopForm.selectedAreaIds) {
          if (!existingAreaIds.includes(areaId)) {
            await fetch('/api/stop-areas', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ stop_id: stopId, area_id: areaId }),
            });
          }
        }
      } else {
        // New stop -- link all selected areas
        for (const areaId of stopForm.selectedAreaIds) {
          await fetch('/api/stop-areas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stop_id: stopId, area_id: areaId }),
          });
        }
      }

      setStopModalOpen(false);
      setEditStop(null);
      fetchStops();
      fetchStopAreaLinks();
    } catch { alert('Network error'); }
    finally { setSavingStop(false); }
  }

  async function handleDeleteStop(stop: Stop) {
    if (!confirm(`Delete stop "${stop.name}"?`)) return;
    try {
      const res = await fetch(`/api/stops/${stop.id}`, { method: 'DELETE' });
      if (res.ok) { fetchStops(); fetchRoutes(); fetchStopAreaLinks(); }
    } catch { /* ignore */ }
  }

  /* ══════════════════════════════════════════════════════
     AREA CRUD
     ══════════════════════════════════════════════════════ */
  const [areaModalOpen, setAreaModalOpen] = useState(false);
  const [editArea, setEditArea] = useState<Area | null>(null);
  const [areaFormName, setAreaFormName] = useState('');
  const [savingArea, setSavingArea] = useState(false);

  function openAreaModal(area?: Area) {
    if (area) {
      setEditArea(area);
      setAreaFormName(area.name);
    } else {
      setEditArea(null);
      setAreaFormName('');
    }
    setAreaModalOpen(true);
  }

  async function handleSaveArea() {
    if (!tenant?.id || !areaFormName.trim()) return;
    setSavingArea(true);
    try {
      const payload = { tenant_id: tenant.id, name: areaFormName.trim() };
      const url = editArea ? `/api/areas/${editArea.id}` : '/api/areas';
      const method = editArea ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        setAreaModalOpen(false);
        setEditArea(null);
        fetchAreas();
        fetchStopAreaLinks();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save area');
      }
    } catch { alert('Network error'); }
    finally { setSavingArea(false); }
  }

  async function handleDeleteArea(area: Area) {
    if (!confirm(`Delete area "${area.name}"?`)) return;
    try {
      const res = await fetch(`/api/areas/${area.id}`, { method: 'DELETE' });
      if (res.ok) { fetchAreas(); fetchStopAreaLinks(); }
    } catch { /* ignore */ }
  }

  /* ══════════════════════════════════════════════════════
     CLASS CRUD
     ══════════════════════════════════════════════════════ */
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [editClass, setEditClass] = useState<ClassItem | null>(null);
  const [classFormName, setClassFormName] = useState('');
  const [savingClass, setSavingClass] = useState(false);

  function openClassModal(cls?: ClassItem) {
    if (cls) {
      setEditClass(cls);
      setClassFormName(cls.name);
    } else {
      setEditClass(null);
      setClassFormName('');
    }
    setClassModalOpen(true);
  }

  async function handleSaveClass() {
    if (!tenant?.id || !classFormName.trim()) return;
    setSavingClass(true);
    try {
      const payload = { tenant_id: tenant.id, name: classFormName.trim() };
      const url = editClass ? `/api/classes/${editClass.id}` : '/api/classes';
      const method = editClass ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        setClassModalOpen(false);
        setEditClass(null);
        fetchClasses();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save class');
      }
    } catch { alert('Network error'); }
    finally { setSavingClass(false); }
  }

  async function handleDeleteClass(cls: ClassItem) {
    if (!confirm(`Delete class "${cls.name}"?`)) return;
    try {
      const res = await fetch(`/api/classes/${cls.id}`, { method: 'DELETE' });
      if (res.ok) fetchClasses();
    } catch { /* ignore */ }
  }

  /* ══════════════════════════════════════════════════════
     SECTION CRUD
     ══════════════════════════════════════════════════════ */
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editSection, setEditSection] = useState<SectionItem | null>(null);
  const [sectionFormName, setSectionFormName] = useState('');
  const [savingSection, setSavingSection] = useState(false);

  function openSectionModal(sec?: SectionItem) {
    if (sec) {
      setEditSection(sec);
      setSectionFormName(sec.name);
    } else {
      setEditSection(null);
      setSectionFormName('');
    }
    setSectionModalOpen(true);
  }

  async function handleSaveSection() {
    if (!tenant?.id || !sectionFormName.trim()) return;
    setSavingSection(true);
    try {
      const payload = { tenant_id: tenant.id, name: sectionFormName.trim() };
      const url = editSection ? `/api/sections/${editSection.id}` : '/api/sections';
      const method = editSection ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        setSectionModalOpen(false);
        setEditSection(null);
        fetchSections();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save section');
      }
    } catch { alert('Network error'); }
    finally { setSavingSection(false); }
  }

  async function handleDeleteSection(sec: SectionItem) {
    if (!confirm(`Delete section "${sec.name}"?`)) return;
    try {
      const res = await fetch(`/api/sections/${sec.id}`, { method: 'DELETE' });
      if (res.ok) fetchSections();
    } catch { /* ignore */ }
  }

  /* ══════════════════════════════════════════════════════
     ADMISSION MODAL
     ══════════════════════════════════════════════════════ */
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);
  const [editAdmission, setEditAdmission] = useState<Admission | null>(null);
  const [admForm, setAdmForm] = useState({
    student_name: '', father_name: '', surname: '', gender: '', class_grade: '', section: '',
    grn: '', dob: '', primary_mobile: '', secondary_mobile: '',
    address_line1: '', address_line2: '', area_id: '', area_name: '', city: '',
    pickup_route_id: '', pickup_stop_id: '', drop_route_id: '', drop_stop_id: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [savingAdmission, setSavingAdmission] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [suggestedStop, setSuggestedStop] = useState<Stop | null>(null);

  /* Pickup stops: all stops (independent) */
  const [pickupStopsForRoute, setPickupStopsForRoute] = useState<Stop[]>([]);
  useEffect(() => {
    if (!admForm.pickup_route_id || !tenant?.id) { setPickupStopsForRoute([]); return; }
    fetch(`/api/stops?tenant_id=${tenant.id}&route_id=${admForm.pickup_route_id}`)
      .then((r) => r.json())
      .then((data) => setPickupStopsForRoute(data))
      .catch(() => setPickupStopsForRoute([]));
  }, [admForm.pickup_route_id, tenant?.id]);

  /* Drop stops */
  const [dropStopsForRoute, setDropStopsForRoute] = useState<Stop[]>([]);
  useEffect(() => {
    if (!admForm.drop_route_id || !tenant?.id) { setDropStopsForRoute([]); return; }
    fetch(`/api/stops?tenant_id=${tenant.id}&route_id=${admForm.drop_route_id}`)
      .then((r) => r.json())
      .then((data) => setDropStopsForRoute(data))
      .catch(() => setDropStopsForRoute([]));
  }, [admForm.drop_route_id, tenant?.id]);

  /* Auto-fill: when area changes, suggest a stop */
  useEffect(() => {
    if (!admForm.area_id) { setSuggestedStop(null); return; }
    const stop = findStopForArea(admForm.area_id);
    setSuggestedStop(stop);
    if (stop) {
      setAdmForm((prev) => ({
        ...prev,
        pickup_stop_id: stop.id,
        drop_stop_id: stop.id,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admForm.area_id, stopAreaLinks, stops]);

  const pickupRoutes = routes.filter((r) => !r.route_type || r.route_type === 'pickup');
  const dropRoutes = routes.filter((r) => !r.route_type || r.route_type === 'drop');

  function openAdmissionModal(admission?: Admission) {
    setPhotoFile(null);
    setSuggestedStop(null);
    if (admission) {
      setEditAdmission(admission);
      setAdmForm({
        student_name: admission.student_name,
        father_name: admission.father_name,
        surname: admission.surname || '',
        gender: admission.gender || '',
        class_grade: admission.class_grade || '',
        section: admission.section || '',
        grn: admission.grn || '',
        dob: admission.dob || '',
        primary_mobile: admission.primary_mobile || '',
        secondary_mobile: admission.secondary_mobile || '',
        address_line1: admission.address_line1 || '',
        address_line2: admission.address_line2 || '',
        area_id: admission.area_id || '',
        area_name: admission.area_name || '',
        city: admission.city || '',
        pickup_route_id: admission.pickup_route_id || '',
        pickup_stop_id: admission.pickup_stop_id || '',
        drop_route_id: admission.drop_route_id || '',
        drop_stop_id: admission.drop_stop_id || '',
      });
    } else {
      setEditAdmission(null);
      setAdmForm({
        student_name: '', father_name: '', surname: '', gender: '', class_grade: '', section: '',
        grn: '', dob: '', primary_mobile: '', secondary_mobile: '',
        address_line1: '', address_line2: '', area_id: '', area_name: '', city: '',
        pickup_route_id: '', pickup_stop_id: '', drop_route_id: '', drop_stop_id: '',
      });
    }
    setAdmissionModalOpen(true);
  }

  async function handleSaveAdmission() {
    if (!tenant?.id || !admForm.student_name.trim() || !admForm.father_name.trim()) return;
    setSavingAdmission(true);
    try {
      const selectedArea = areas.find((a) => a.id === admForm.area_id);
      const payload: any = {
        tenant_id: tenant.id,
        student_name: admForm.student_name.trim(),
        father_name: admForm.father_name.trim(),
        surname: admForm.surname.trim() || null,
        gender: admForm.gender || null,
        class_grade: admForm.class_grade || null,
        section: admForm.section || null,
        grn: admForm.grn.trim() || null,
        dob: admForm.dob || null,
        primary_mobile: admForm.primary_mobile.trim() || null,
        secondary_mobile: admForm.secondary_mobile.trim() || null,
        address_line1: admForm.address_line1.trim() || null,
        address_line2: admForm.address_line2.trim() || null,
        area_id: admForm.area_id || null,
        area_name: selectedArea ? selectedArea.name : (admForm.area_name.trim() || null),
        city: admForm.city.trim() || null,
        pickup_route_id: admForm.pickup_route_id || null,
        pickup_stop_id: admForm.pickup_stop_id || null,
        drop_route_id: admForm.drop_route_id || null,
        drop_stop_id: admForm.drop_stop_id || null,
      };

      const url = editAdmission ? `/api/admissions/${editAdmission.id}` : '/api/admissions';
      const method = editAdmission ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to save admission');
        return;
      }

      const saved = await res.json();

      // Upload photo if selected
      if (photoFile) {
        const fd = new FormData();
        fd.append('file', photoFile);
        fd.append('owner_type', 'admission');
        fd.append('owner_id', saved.id);
        fd.append('doc_type', 'photo');
        fd.append('tenant_id', tenant.id);

        const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
        if (upRes.ok) {
          const upData = await upRes.json();
          await fetch(`/api/admissions/${saved.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photo_url: upData.file_url }),
          });
        }
      }

      setAdmissionModalOpen(false);
      setEditAdmission(null);
      fetchAdmissions();
    } catch { alert('Network error'); }
    finally { setSavingAdmission(false); }
  }

  async function handleDeleteAdmission(admission: Admission) {
    if (!confirm(`Delete admission for "${admission.student_name}"?`)) return;
    try {
      const res = await fetch(`/api/admissions/${admission.id}`, { method: 'DELETE' });
      if (res.ok) fetchAdmissions();
    } catch { /* ignore */ }
  }

  /* ── View Admission Modal ── */
  const [viewAdmission, setViewAdmission] = useState<Admission | null>(null);

  /* ── Parent Link Modal ── */
  const [parentLinkModalOpen, setParentLinkModalOpen] = useState(false);
  const [parentLink, setParentLink] = useState('');
  const [parentLinkCopied, setParentLinkCopied] = useState(false);

  async function openParentLinkModal() {
    if (!tenant?.id) return;
    setParentLinkCopied(false);
    try {
      const res = await fetch(`/api/parent-link?tenant_id=${tenant.id}`);
      if (res.ok) {
        const data = await res.json();
        // Replace localhost with production domain
        const url = data.url as string;
        setParentLink(url.includes('localhost') ? url.replace(/https?:\/\/[^/]+/, 'https://fleet.pompombus.com') : url);
      }
    } catch { /* ignore */ }
    setParentLinkModalOpen(true);
  }

  function copyParentLink() {
    if (!parentLink) return;
    navigator.clipboard.writeText(parentLink).then(() => {
      setParentLinkCopied(true);
      setTimeout(() => setParentLinkCopied(false), 2000);
    }).catch(() => {});
  }

  function shareWhatsApp() {
    if (!parentLink) return;
    const text = encodeURIComponent(`Please fill the student transport admission form using this link:\n${parentLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  /* ── Loading state ── */
  if (sessionLoading) {
    return (
      <div className="card">
        <div className="card-body" style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>
          Loading...
        </div>
      </div>
    );
  }

  /* ── Helper to get stop name covering an area ── */
  function getStopNameForArea(areaId: string): string | null {
    const link = stopAreaLinks.find((sa) => sa.area_id === areaId);
    return link ? link.stop_name || null : null;
  }

  return (
    <>
      {/* ======== Page Tabs ======== */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid var(--border)' }}>
        {(['admissions', 'routes', 'stops', 'areas', 'classes'] as TabKey[]).map((tab) => (
          <button
            key={tab}
            className={`att-page-tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'classes' ? 'Classes & Sections' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ======== TAB 1: Admissions ======== */}
      <div className={`att-view${activeTab === 'admissions' ? ' active' : ''}`}>
        <div className="card">
          <div className="card-header">
            <h3>Student Admissions</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={openParentLinkModal}>Share Parent Form</button>
              <button className="btn btn-primary btn-sm" onClick={() => openAdmissionModal()}>+ Add Admission</button>
            </div>
          </div>
          <div className="card-body">
            {/* Filters row */}
            <div className="filter-row">
              <div>
                <input
                  className="form-input"
                  style={{ width: 160, height: 36 }}
                  placeholder="Class"
                  list="class-list"
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                />
                <datalist id="class-list">
                  {classes.map((c) => <option key={c.id} value={c.name} />)}
                </datalist>
              </div>
              <div>
                <input
                  className="form-input"
                  style={{ width: 120, height: 36 }}
                  placeholder="Section"
                  list="section-list"
                  value={filterSection}
                  onChange={(e) => setFilterSection(e.target.value)}
                />
                <datalist id="section-list">
                  {sections.map((s) => <option key={s.id} value={s.name} />)}
                </datalist>
              </div>
              <div>
                <input
                  className="form-input"
                  style={{ width: 180, height: 36 }}
                  placeholder="Route"
                  list="route-list"
                  value={filterRoute ? routes.find((r) => r.id === filterRoute)?.name || '' : ''}
                  onChange={(e) => {
                    const matched = routes.find((r) => r.name === e.target.value);
                    setFilterRoute(matched ? matched.id : '');
                  }}
                />
                <datalist id="route-list">
                  {routes.map((r) => <option key={r.id} value={r.name} />)}
                </datalist>
              </div>
              <div>
                <input
                  className="form-input"
                  style={{ width: 160, height: 36 }}
                  placeholder="Stop"
                  list="stop-list"
                  value={filterStop ? stops.find((s) => s.id === filterStop)?.name || '' : ''}
                  onChange={(e) => {
                    const matched = stops.find((s) => s.name === e.target.value);
                    setFilterStop(matched ? matched.id : '');
                  }}
                />
                <datalist id="stop-list">
                  {stops.map((s) => <option key={s.id} value={s.name} />)}
                </datalist>
              </div>
              <button className="btn btn-outline btn-sm" onClick={clearFilters}>Clear Filters</button>
            </div>

            {/* Search bar */}
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by name, father name, GRN, or mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', maxWidth: 420, height: 38 }}
              />
            </div>

            {/* Result count */}
            <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--bodytext)', fontWeight: 500 }}>
              {filteredAdmissions.length} student{filteredAdmissions.length !== 1 ? 's' : ''}
            </div>

            {loadingAdmissions ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>Loading admissions...</div>
            ) : filteredAdmissions.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>
                {admissions.length === 0 ? 'No admissions found. Add your first student.' : 'No students match your search/filter.'}
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>GRN</th>
                      <th>Photo</th>
                      <th>Student Name</th>
                      <th>Father Name</th>
                      <th>Surname</th>
                      <th>Class-Sec</th>
                      <th>Gender</th>
                      <th>Mobile</th>
                      <th>Pickup Route</th>
                      <th>Pickup Stop</th>
                      <th>Drop Route</th>
                      <th>Drop Stop</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmissions.map((a, idx) => {
                      const colors = avatarColors(idx);
                      const classSec = [a.class_grade, a.section].filter(Boolean).join('-');
                      return (
                        <tr key={a.id}>
                          <td>{idx + 1}</td>
                          <td>{a.grn || '--'}</td>
                          <td>
                            {a.photo_url ? (
                              <div className="avatar avatar-sm" style={{ backgroundImage: `url(${a.photo_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                            ) : (
                              <div className="avatar avatar-sm" style={{ background: colors.bg, color: colors.color }}>
                                {getInitials(a.student_name)}
                              </div>
                            )}
                          </td>
                          <td>
                            <a className="clickable-link" onClick={() => setViewAdmission(a)}>
                              {a.student_name}
                            </a>
                          </td>
                          <td>{a.father_name}</td>
                          <td>{a.surname || '--'}</td>
                          <td>
                            {classSec ? <span className="badge badge-primary">{classSec}</span> : '--'}
                          </td>
                          <td>{a.gender || '--'}</td>
                          <td>{a.primary_mobile || '--'}</td>
                          <td>
                            {a.pickup_route_name ? (
                              <span className="badge badge-success">{a.pickup_route_name}</span>
                            ) : '--'}
                          </td>
                          <td>
                            {a.pickup_stop_name ? (
                              <span className="badge badge-info">{a.pickup_stop_name}</span>
                            ) : '--'}
                          </td>
                          <td>
                            {a.drop_route_name ? (
                              <span className="badge badge-error">{a.drop_route_name}</span>
                            ) : '--'}
                          </td>
                          <td>
                            {a.drop_stop_name ? (
                              <span className="badge badge-info">{a.drop_stop_name}</span>
                            ) : '--'}
                          </td>
                          <td>
                            <ActionMenu
                              onEdit={() => openAdmissionModal(a)}
                              onDelete={() => handleDeleteAdmission(a)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======== TAB 2: Routes ======== */}
      <div className={`att-view${activeTab === 'routes' ? ' active' : ''}`}>
        <div className="card">
          <div className="card-header">
            <h3>Routes</h3>
            <button className="btn btn-primary btn-sm" onClick={() => openRouteModal()}>+ Add Route</button>
          </div>
          <div className="card-body">
            {loadingRoutes ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>Loading routes...</div>
            ) : routes.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>
                No routes found. Add your first route.
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Route Name</th>
                      <th>Type</th>
                      <th>Departure</th>
                      <th>Arrival</th>
                      <th>Description</th>
                      <th style={{ textAlign: 'center' }}>Stops</th>
                      <th style={{ textAlign: 'center' }}>Students</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes.map((r, idx) => {
                      const studentCount = admissions.filter(
                        (a) => a.pickup_route_id === r.id || a.drop_route_id === r.id || a.route_id === r.id
                      ).length;
                      return (
                        <tr key={r.id}>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: 600 }}>{r.name}</td>
                          <td>
                            {r.route_type === 'pickup' ? (
                              <span className="badge badge-success">Pickup</span>
                            ) : r.route_type === 'drop' ? (
                              <span className="badge badge-error">Drop</span>
                            ) : (
                              <span className="badge badge-warning">--</span>
                            )}
                          </td>
                          <td>{fmtTime(r.departure_time)}</td>
                          <td>{fmtTime(r.arrival_time)}</td>
                          <td>{r.description || '--'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="badge badge-primary">{r.stops_count}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="badge badge-info">{studentCount}</span>
                          </td>
                          <td>
                            <ActionMenu
                              onEdit={() => openRouteModal(r)}
                              onDelete={() => handleDeleteRoute(r)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======== TAB 3: Stops ======== */}
      <div className={`att-view${activeTab === 'stops' ? ' active' : ''}`}>
        <div className="card">
          <div className="card-header">
            <h3>Stops</h3>
            <button className="btn btn-primary btn-sm" onClick={() => openStopModal()}>+ Add Stop</button>
          </div>
          <div className="card-body">
            {loadingStops ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>Loading stops...</div>
            ) : stops.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>
                No stops found. Add your first stop.
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Stop Name</th>
                      <th>Yearly Fee</th>
                      <th>Areas Covered</th>
                      <th style={{ textAlign: 'center' }}>Students</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stops.map((s, idx) => {
                      const studentCount = admissions.filter(
                        (a) => a.pickup_stop_id === s.id || a.drop_stop_id === s.id || a.stop_id === s.id
                      ).length;
                      return (
                        <tr key={s.id}>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: 600 }}>{s.name}</td>
                          <td>
                            {s.yearly_fee != null ? (
                              <span style={{ fontWeight: 600 }}>{'\u20B9'}{Number(s.yearly_fee).toLocaleString('en-IN')}</span>
                            ) : '--'}
                          </td>
                          <td>
                            {s.areas && s.areas.length > 0 ? (
                              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {s.areas.map((a, i) => (
                                  <span key={i} className="badge badge-info">{a.name}</span>
                                ))}
                              </div>
                            ) : '--'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="badge badge-primary">{studentCount}</span>
                          </td>
                          <td>
                            <ActionMenu
                              onEdit={() => openStopModal(s)}
                              onDelete={() => handleDeleteStop(s)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======== TAB 4: Areas ======== */}
      <div className={`att-view${activeTab === 'areas' ? ' active' : ''}`}>
        <div className="card">
          <div className="card-header">
            <h3>Areas</h3>
            <button className="btn btn-primary btn-sm" onClick={() => openAreaModal()}>+ Add Area</button>
          </div>
          <div className="card-body">
            {loadingAreas ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>Loading areas...</div>
            ) : areas.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>
                No areas found. Add your first area.
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Area Name</th>
                      <th>Covered By Stop</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {areas.map((a, idx) => {
                      const stopName = getStopNameForArea(a.id);
                      return (
                        <tr key={a.id}>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: 600 }}>{a.name}</td>
                          <td>
                            {stopName ? (
                              <span className="badge badge-success">{stopName}</span>
                            ) : (
                              <span style={{ color: 'var(--bodytext)' }}>--</span>
                            )}
                          </td>
                          <td>
                            <ActionMenu
                              onEdit={() => openAreaModal(a)}
                              onDelete={() => handleDeleteArea(a)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======== TAB 5: Classes & Sections ======== */}
      <div className={`att-view${activeTab === 'classes' ? ' active' : ''}`}>
        <div className="two-col">
          {/* Classes */}
          <div className="card">
            <div className="card-header">
              <h3>Classes</h3>
              <button className="btn btn-primary btn-sm" onClick={() => openClassModal()}>+ Add Class</button>
            </div>
            <div className="card-body">
              {loadingClasses ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--bodytext)' }}>Loading...</div>
              ) : classes.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--bodytext)' }}>No classes. Add one.</div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Class Name</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classes.map((c, idx) => (
                        <tr key={c.id}>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: 600 }}>{c.name}</td>
                          <td>
                            <ActionMenu
                              onEdit={() => openClassModal(c)}
                              onDelete={() => handleDeleteClass(c)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sections */}
          <div className="card">
            <div className="card-header">
              <h3>Sections</h3>
              <button className="btn btn-primary btn-sm" onClick={() => openSectionModal()}>+ Add Section</button>
            </div>
            <div className="card-body">
              {loadingSections ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--bodytext)' }}>Loading...</div>
              ) : sections.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--bodytext)' }}>No sections. Add one.</div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Section Name</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sections.map((s, idx) => (
                        <tr key={s.id}>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: 600 }}>{s.name}</td>
                          <td>
                            <ActionMenu
                              onEdit={() => openSectionModal(s)}
                              onDelete={() => handleDeleteSection(s)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======== MODAL: Route Add/Edit ======== */}
      <Modal
        isOpen={routeModalOpen}
        onClose={() => { setRouteModalOpen(false); setEditRoute(null); }}
        title={editRoute ? 'Edit Route' : 'Add Route'}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={() => { setRouteModalOpen(false); setEditRoute(null); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveRoute} disabled={savingRoute}>
              {savingRoute ? 'Saving...' : 'Save'}
            </button>
          </div>
        }
      >
        <div className="form-group">
          <label className="form-label">Route Name *</label>
          <input
            className="form-input"
            value={routeForm.name}
            onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
            placeholder="e.g. Route A - North"
          />
        </div>
        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Type *</label>
            <select
              className="form-select"
              value={routeForm.route_type}
              onChange={(e) => setRouteForm({ ...routeForm, route_type: e.target.value })}
            >
              <option value="pickup">Pickup</option>
              <option value="drop">Drop</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Departure Time</label>
            <input
              type="time"
              className="form-input"
              value={routeForm.departure_time}
              onChange={(e) => setRouteForm({ ...routeForm, departure_time: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Arrival Time</label>
            <input
              type="time"
              className="form-input"
              value={routeForm.arrival_time}
              onChange={(e) => setRouteForm({ ...routeForm, arrival_time: e.target.value })}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <input
            className="form-input"
            value={routeForm.description}
            onChange={(e) => setRouteForm({ ...routeForm, description: e.target.value })}
            placeholder="Optional description"
          />
        </div>
      </Modal>

      {/* ======== MODAL: Stop Add/Edit ======== */}
      <Modal
        isOpen={stopModalOpen}
        onClose={() => { setStopModalOpen(false); setEditStop(null); }}
        title={editStop ? 'Edit Stop' : 'Add Stop'}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={() => { setStopModalOpen(false); setEditStop(null); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveStop} disabled={savingStop}>
              {savingStop ? 'Saving...' : 'Save'}
            </button>
          </div>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Stop Name *</label>
            <input
              className="form-input"
              value={stopForm.name}
              onChange={(e) => setStopForm({ ...stopForm, name: e.target.value })}
              placeholder="e.g. Main Gate"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Yearly Fee</label>
            <input
              className="form-input"
              type="number"
              min="0"
              step="100"
              value={stopForm.yearly_fee}
              onChange={(e) => setStopForm({ ...stopForm, yearly_fee: e.target.value })}
              placeholder="e.g. 18000"
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Areas Covered (select multiple)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '8px 0' }}>
            {areas.map((a) => {
              const isSelected = stopForm.selectedAreaIds.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  className={`tab-pill${isSelected ? ' active' : ''}`}
                  onClick={() => {
                    setStopForm((prev) => ({
                      ...prev,
                      selectedAreaIds: isSelected
                        ? prev.selectedAreaIds.filter((id) => id !== a.id)
                        : [...prev.selectedAreaIds, a.id],
                    }));
                  }}
                >
                  {a.name}
                </button>
              );
            })}
            {areas.length === 0 && (
              <span style={{ color: 'var(--bodytext)', fontSize: 13 }}>No areas available. Add areas first.</span>
            )}
          </div>
        </div>
      </Modal>

      {/* ======== MODAL: Area Add/Edit ======== */}
      <Modal
        isOpen={areaModalOpen}
        onClose={() => { setAreaModalOpen(false); setEditArea(null); }}
        title={editArea ? 'Edit Area' : 'Add Area'}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={() => { setAreaModalOpen(false); setEditArea(null); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveArea} disabled={savingArea}>
              {savingArea ? 'Saving...' : 'Save'}
            </button>
          </div>
        }
      >
        <div className="form-group">
          <label className="form-label">Area Name *</label>
          <input
            className="form-input"
            value={areaFormName}
            onChange={(e) => setAreaFormName(e.target.value)}
            placeholder="e.g. Satellite"
          />
        </div>
      </Modal>

      {/* ======== MODAL: Class Add/Edit ======== */}
      <Modal
        isOpen={classModalOpen}
        onClose={() => { setClassModalOpen(false); setEditClass(null); }}
        title={editClass ? 'Edit Class' : 'Add Class'}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={() => { setClassModalOpen(false); setEditClass(null); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveClass} disabled={savingClass}>
              {savingClass ? 'Saving...' : 'Save'}
            </button>
          </div>
        }
      >
        <div className="form-group">
          <label className="form-label">Class Name *</label>
          <input
            className="form-input"
            value={classFormName}
            onChange={(e) => setClassFormName(e.target.value)}
            placeholder="e.g. LKG, 1, 2, etc."
          />
        </div>
      </Modal>

      {/* ======== MODAL: Section Add/Edit ======== */}
      <Modal
        isOpen={sectionModalOpen}
        onClose={() => { setSectionModalOpen(false); setEditSection(null); }}
        title={editSection ? 'Edit Section' : 'Add Section'}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={() => { setSectionModalOpen(false); setEditSection(null); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveSection} disabled={savingSection}>
              {savingSection ? 'Saving...' : 'Save'}
            </button>
          </div>
        }
      >
        <div className="form-group">
          <label className="form-label">Section Name *</label>
          <input
            className="form-input"
            value={sectionFormName}
            onChange={(e) => setSectionFormName(e.target.value)}
            placeholder="e.g. A, B, C, D"
          />
        </div>
      </Modal>

      {/* ======== MODAL: Admission Add/Edit ======== */}
      <Modal
        isOpen={admissionModalOpen}
        onClose={() => { setAdmissionModalOpen(false); setEditAdmission(null); }}
        title={editAdmission ? 'Edit Admission' : 'Add Admission'}
        wide
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={() => { setAdmissionModalOpen(false); setEditAdmission(null); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveAdmission} disabled={savingAdmission}>
              {savingAdmission ? 'Saving...' : 'Save'}
            </button>
          </div>
        }
      >
        {/* GRN */}
        <div className="form-group">
          <label className="form-label">GRN (optional)</label>
          <input
            className="form-input"
            value={admForm.grn}
            onChange={(e) => setAdmForm({ ...admForm, grn: e.target.value })}
            placeholder="General Registration Number"
            style={{ maxWidth: 260 }}
          />
        </div>
        {/* Row 1: Names */}
        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Student Name *</label>
            <input
              className="form-input"
              value={admForm.student_name}
              onChange={(e) => setAdmForm({ ...admForm, student_name: e.target.value })}
              placeholder="First name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Father Name *</label>
            <input
              className="form-input"
              value={admForm.father_name}
              onChange={(e) => setAdmForm({ ...admForm, father_name: e.target.value })}
              placeholder="Father's name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Surname</label>
            <input
              className="form-input"
              value={admForm.surname}
              onChange={(e) => setAdmForm({ ...admForm, surname: e.target.value })}
              placeholder="Surname"
            />
          </div>
        </div>
        {/* Row 2: Gender, Class, Section, DOB */}
        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select
              className="form-select"
              value={admForm.gender}
              onChange={(e) => setAdmForm({ ...admForm, gender: e.target.value })}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Class</label>
            <select
              className="form-select"
              value={admForm.class_grade}
              onChange={(e) => setAdmForm({ ...admForm, class_grade: e.target.value })}
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Section</label>
            <select
              className="form-select"
              value={admForm.section}
              onChange={(e) => setAdmForm({ ...admForm, section: e.target.value })}
            >
              <option value="">Select Section</option>
              {sections.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
        {/* DOB */}
        <div className="form-group" style={{ maxWidth: 260 }}>
          <label className="form-label">Date of Birth</label>
          <input
            type="date"
            className="form-input"
            value={admForm.dob}
            onChange={(e) => setAdmForm({ ...admForm, dob: e.target.value })}
          />
        </div>
        {/* Row 3: Mobiles */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Primary Mobile *</label>
            <input
              className="form-input"
              value={admForm.primary_mobile}
              onChange={(e) => setAdmForm({ ...admForm, primary_mobile: e.target.value })}
              placeholder="10-digit mobile"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Secondary Mobile</label>
            <input
              className="form-input"
              value={admForm.secondary_mobile}
              onChange={(e) => setAdmForm({ ...admForm, secondary_mobile: e.target.value })}
              placeholder="Optional"
            />
          </div>
        </div>
        {/* Row 4: Address */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Address Line 1</label>
            <input
              className="form-input"
              value={admForm.address_line1}
              onChange={(e) => setAdmForm({ ...admForm, address_line1: e.target.value })}
              placeholder="House/Flat, Street"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address Line 2</label>
            <input
              className="form-input"
              value={admForm.address_line2}
              onChange={(e) => setAdmForm({ ...admForm, address_line2: e.target.value })}
              placeholder="Landmark, etc."
            />
          </div>
        </div>
        {/* Row 5: Area, City */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Area</label>
            <select
              className="form-select"
              value={admForm.area_id}
              onChange={(e) => {
                const areaId = e.target.value;
                const areaObj = areas.find((a) => a.id === areaId);
                setAdmForm({ ...admForm, area_id: areaId, area_name: areaObj ? areaObj.name : '' });
              }}
            >
              <option value="">Select Area</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">City</label>
            <input
              className="form-input"
              value={admForm.city}
              onChange={(e) => setAdmForm({ ...admForm, city: e.target.value })}
              placeholder="City"
            />
          </div>
        </div>

        {/* Auto-fill hint */}
        {suggestedStop && (
          <div style={{ padding: '10px 14px', background: 'var(--lightsuccess)', borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: 13, color: 'var(--success)' }}>
            Auto-filled stop: <strong>{suggestedStop.name}</strong>
            {suggestedStop.yearly_fee != null && (
              <span> -- Est. Fee: <strong>{'\u20B9'}{Number(suggestedStop.yearly_fee).toLocaleString('en-IN')}/year</strong></span>
            )}
            {' '}(covers selected area). You can override below.
          </div>
        )}

        {/* Pickup section */}
        <div style={{ background: 'var(--lightsuccess)', padding: 16, borderRadius: 'var(--radius)', marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Pickup</div>
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Pickup Route</label>
              <select
                className="form-select"
                value={admForm.pickup_route_id}
                onChange={(e) => setAdmForm({ ...admForm, pickup_route_id: e.target.value, pickup_stop_id: suggestedStop?.id || '' })}
              >
                <option value="">Select Route</option>
                {pickupRoutes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.departure_time ? `(${fmtTime(r.departure_time)})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Pickup Stop</label>
              <select
                className="form-select"
                value={admForm.pickup_stop_id}
                onChange={(e) => setAdmForm({ ...admForm, pickup_stop_id: e.target.value })}
              >
                <option value="">Select Stop</option>
                {(admForm.pickup_route_id ? pickupStopsForRoute : stops).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Drop section */}
        <div style={{ background: 'var(--lighterror)', padding: 16, borderRadius: 'var(--radius)', marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Drop</div>
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Drop Route</label>
              <select
                className="form-select"
                value={admForm.drop_route_id}
                onChange={(e) => setAdmForm({ ...admForm, drop_route_id: e.target.value, drop_stop_id: suggestedStop?.id || '' })}
              >
                <option value="">Select Route</option>
                {dropRoutes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.arrival_time ? `(${fmtTime(r.arrival_time)})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Drop Stop</label>
              <select
                className="form-select"
                value={admForm.drop_stop_id}
                onChange={(e) => setAdmForm({ ...admForm, drop_stop_id: e.target.value })}
              >
                <option value="">Select Stop</option>
                {(admForm.drop_route_id ? dropStopsForRoute : stops).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Photo */}
        <div className="form-group">
          <label className="form-label">Student Photo</label>
          <div
            className="file-upload"
            onClick={() => photoInputRef.current?.click()}
          >
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
            />
            <div style={{ textAlign: 'center', color: 'var(--bodytext)' }}>
              {photoFile ? (
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{photoFile.name}</span>
              ) : editAdmission?.photo_url ? (
                <span>Current photo uploaded. Click to replace.</span>
              ) : (
                <span>Click to upload photo (max 5 MB)</span>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* ======== MODAL: View Admission Details ======== */}
      <Modal
        isOpen={!!viewAdmission}
        onClose={() => setViewAdmission(null)}
        title="Student Details"
        wide
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={() => setViewAdmission(null)}>Close</button>
            <button className="btn btn-primary" onClick={() => {
              if (viewAdmission) { openAdmissionModal(viewAdmission); setViewAdmission(null); }
            }}>Edit</button>
          </div>
        }
      >
        {viewAdmission && (
          <div style={{ display: 'flex', gap: 24 }}>
            {/* Left: Photo */}
            <div style={{ flexShrink: 0 }}>
              {viewAdmission.photo_url ? (
                <div style={{ width: 100, height: 100, borderRadius: 'var(--radius)', backgroundImage: `url(${viewAdmission.photo_url})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '2px solid var(--border)' }} />
              ) : (
                <div className="avatar" style={{ width: 100, height: 100, fontSize: 32, background: 'var(--lightprimary)', color: 'var(--primary)' }}>
                  {getInitials(viewAdmission.student_name)}
                </div>
              )}
            </div>
            {/* Right: Details */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
              <DetailItem label="GRN" value={viewAdmission.grn} />
              <DetailItem label="Student Name" value={viewAdmission.student_name} />
              <DetailItem label="Father Name" value={viewAdmission.father_name} />
              <DetailItem label="Surname" value={viewAdmission.surname} />
              <DetailItem label="Gender" value={viewAdmission.gender} />
              <DetailItem label="Class" value={viewAdmission.class_grade} />
              <DetailItem label="Section" value={viewAdmission.section} />
              <DetailItem label="Date of Birth" value={viewAdmission.dob} />
              <DetailItem label="Primary Mobile" value={viewAdmission.primary_mobile} />
              <DetailItem label="Secondary Mobile" value={viewAdmission.secondary_mobile} />
              <div style={{ gridColumn: '1 / -1' }}>
                <DetailItem label="Address" value={[viewAdmission.address_line1, viewAdmission.address_line2].filter(Boolean).join(', ') || viewAdmission.address} />
              </div>
              <DetailItem label="Area" value={viewAdmission.area_name} />
              <DetailItem label="City" value={viewAdmission.city} />
              <DetailItem label="Pickup Route" value={viewAdmission.pickup_route_name} />
              <DetailItem label="Pickup Stop" value={viewAdmission.pickup_stop_name} />
              <DetailItem label="Drop Route" value={viewAdmission.drop_route_name} />
              <DetailItem label="Drop Stop" value={viewAdmission.drop_stop_name} />
            </div>
          </div>
        )}
      </Modal>

      {/* ======== MODAL: Share Parent Form ======== */}
      <Modal
        isOpen={parentLinkModalOpen}
        onClose={() => setParentLinkModalOpen(false)}
        title="Share Parent Admission Form"
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={() => setParentLinkModalOpen(false)}>Close</button>
          </div>
        }
      >
        <p style={{ fontSize: 13, color: 'var(--bodytext)', marginBottom: 16 }}>
          Share this link with parents so they can fill the admission form themselves. No login is required.
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            className="form-input"
            readOnly
            value={parentLink}
            style={{ flex: 1, fontSize: 13 }}
          />
          <button className="btn btn-primary btn-sm" onClick={copyParentLink}>
            {parentLinkCopied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-success btn-sm" onClick={shareWhatsApp}>
            Share via WhatsApp
          </button>
        </div>
      </Modal>
    </>
  );
}

/* ─── Detail Item helper ─── */
function DetailItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{value || '--'}</div>
    </div>
  );
}
