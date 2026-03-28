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
  stops_count: number;
  created_at: string;
}

interface Stop {
  id: string;
  tenant_id: string;
  route_id: string;
  name: string;
  route_name: string | null;
  sequence_order: number;
  created_at: string;
}

interface Admission {
  id: string;
  tenant_id: string;
  student_name: string;
  father_name: string;
  surname: string | null;
  gender: string | null;
  class_grade: string | null;
  dob: string | null;
  address: string | null;
  primary_mobile: string | null;
  secondary_mobile: string | null;
  route_id: string | null;
  stop_id: string | null;
  photo_url: string | null;
  route_name: string | null;
  stop_name: string | null;
  created_at: string;
  updated_at: string | null;
}

type TabKey = 'admissions' | 'routes' | 'stops';

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
        <button onClick={() => { onEdit(); setOpen(false); }}>&#9998; Edit</button>
        <button className="danger" onClick={() => { onDelete(); setOpen(false); }}>&#128465; Delete</button>
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

  /* ── Shared: routes list (used by stops & admissions) ── */
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
  const [stopsRouteFilter, setStopsRouteFilter] = useState('');

  const fetchStops = useCallback(async () => {
    if (!tenant?.id) return;
    setLoadingStops(true);
    try {
      let url = `/api/stops?tenant_id=${tenant.id}`;
      if (stopsRouteFilter) url += `&route_id=${stopsRouteFilter}`;
      const res = await fetch(url);
      if (res.ok) setStops(await res.json());
    } catch { /* ignore */ }
    finally { setLoadingStops(false); }
  }, [tenant?.id, stopsRouteFilter]);

  useEffect(() => { fetchStops(); }, [fetchStops]);

  /* ── Admissions ── */
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loadingAdmissions, setLoadingAdmissions] = useState(true);
  const [search, setSearch] = useState('');
  const [routeFilter, setRouteFilter] = useState('all');

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

  /* ── Route Modal ── */
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [editRoute, setEditRoute] = useState<Route | null>(null);
  const [routeForm, setRouteForm] = useState({ name: '', description: '' });
  const [savingRoute, setSavingRoute] = useState(false);

  function openRouteModal(route?: Route) {
    if (route) {
      setEditRoute(route);
      setRouteForm({ name: route.name, description: route.description || '' });
    } else {
      setEditRoute(null);
      setRouteForm({ name: '', description: '' });
    }
    setRouteModalOpen(true);
  }

  async function handleSaveRoute() {
    if (!tenant?.id || !routeForm.name.trim()) return;
    setSavingRoute(true);
    try {
      const payload = { tenant_id: tenant.id, name: routeForm.name.trim(), description: routeForm.description.trim() || null };
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
    if (!confirm(`Delete route "${route.name}"? All stops under it will also be affected.`)) return;
    try {
      const res = await fetch(`/api/routes/${route.id}`, { method: 'DELETE' });
      if (res.ok) fetchRoutes();
    } catch { /* ignore */ }
  }

  /* ── Stop Modal ── */
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [editStop, setEditStop] = useState<Stop | null>(null);
  const [stopForm, setStopForm] = useState({ route_id: '', name: '', sequence_order: 1 });
  const [savingStop, setSavingStop] = useState(false);

  function openStopModal(stop?: Stop) {
    if (stop) {
      setEditStop(stop);
      setStopForm({ route_id: stop.route_id, name: stop.name, sequence_order: stop.sequence_order });
    } else {
      setEditStop(null);
      setStopForm({ route_id: routes.length > 0 ? routes[0].id : '', name: '', sequence_order: 1 });
    }
    setStopModalOpen(true);
  }

  async function handleSaveStop() {
    if (!tenant?.id || !stopForm.name.trim() || !stopForm.route_id) return;
    setSavingStop(true);
    try {
      const payload = { tenant_id: tenant.id, route_id: stopForm.route_id, name: stopForm.name.trim(), sequence_order: stopForm.sequence_order };
      const url = editStop ? `/api/stops/${editStop.id}` : '/api/stops';
      const method = editStop ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        setStopModalOpen(false);
        setEditStop(null);
        fetchStops();
        fetchRoutes(); // refresh stops_count
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save stop');
      }
    } catch { alert('Network error'); }
    finally { setSavingStop(false); }
  }

  async function handleDeleteStop(stop: Stop) {
    if (!confirm(`Delete stop "${stop.name}"?`)) return;
    try {
      const res = await fetch(`/api/stops/${stop.id}`, { method: 'DELETE' });
      if (res.ok) { fetchStops(); fetchRoutes(); }
    } catch { /* ignore */ }
  }

  /* ── Admission Modal ── */
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);
  const [editAdmission, setEditAdmission] = useState<Admission | null>(null);
  const [admForm, setAdmForm] = useState({
    student_name: '', father_name: '', surname: '', gender: '', class_grade: '',
    dob: '', primary_mobile: '', secondary_mobile: '', address: '',
    route_id: '', stop_id: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [savingAdmission, setSavingAdmission] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  /* Stops for selected route in admission form */
  const [formStops, setFormStops] = useState<Stop[]>([]);
  useEffect(() => {
    if (!admForm.route_id || !tenant?.id) { setFormStops([]); return; }
    fetch(`/api/stops?tenant_id=${tenant.id}&route_id=${admForm.route_id}`)
      .then((r) => r.json())
      .then((data) => setFormStops(data))
      .catch(() => setFormStops([]));
  }, [admForm.route_id, tenant?.id]);

  function openAdmissionModal(admission?: Admission) {
    setPhotoFile(null);
    if (admission) {
      setEditAdmission(admission);
      setAdmForm({
        student_name: admission.student_name,
        father_name: admission.father_name,
        surname: admission.surname || '',
        gender: admission.gender || '',
        class_grade: admission.class_grade || '',
        dob: admission.dob || '',
        primary_mobile: admission.primary_mobile || '',
        secondary_mobile: admission.secondary_mobile || '',
        address: admission.address || '',
        route_id: admission.route_id || '',
        stop_id: admission.stop_id || '',
      });
    } else {
      setEditAdmission(null);
      setAdmForm({
        student_name: '', father_name: '', surname: '', gender: '', class_grade: '',
        dob: '', primary_mobile: '', secondary_mobile: '', address: '',
        route_id: '', stop_id: '',
      });
    }
    setAdmissionModalOpen(true);
  }

  async function handleSaveAdmission() {
    if (!tenant?.id || !admForm.student_name.trim() || !admForm.father_name.trim()) return;
    setSavingAdmission(true);
    try {
      const payload: any = {
        tenant_id: tenant.id,
        student_name: admForm.student_name.trim(),
        father_name: admForm.father_name.trim(),
        surname: admForm.surname.trim() || null,
        gender: admForm.gender || null,
        class_grade: admForm.class_grade.trim() || null,
        dob: admForm.dob || null,
        primary_mobile: admForm.primary_mobile.trim() || null,
        secondary_mobile: admForm.secondary_mobile.trim() || null,
        address: admForm.address.trim() || null,
        route_id: admForm.route_id || null,
        stop_id: admForm.stop_id || null,
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
          // Update admission with photo_url
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

  /* ── Filtered admissions ── */
  const filteredAdmissions = admissions.filter((a) => {
    // Route filter
    if (routeFilter !== 'all' && a.route_id !== routeFilter) return false;
    // Search
    if (search) {
      const q = search.toLowerCase();
      const matches =
        a.student_name.toLowerCase().includes(q) ||
        a.father_name.toLowerCase().includes(q) ||
        (a.primary_mobile && a.primary_mobile.includes(q));
      if (!matches) return false;
    }
    return true;
  });

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

  return (
    <>
      {/* ══════════ Page Tabs ══════════ */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid var(--border)' }}>
        <button
          className={`att-page-tab${activeTab === 'admissions' ? ' active' : ''}`}
          onClick={() => setActiveTab('admissions')}
        >
          Admissions
        </button>
        <button
          className={`att-page-tab${activeTab === 'routes' ? ' active' : ''}`}
          onClick={() => setActiveTab('routes')}
        >
          Routes
        </button>
        <button
          className={`att-page-tab${activeTab === 'stops' ? ' active' : ''}`}
          onClick={() => setActiveTab('stops')}
        >
          Stops
        </button>
      </div>

      {/* ══════════ TAB: Routes ══════════ */}
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
                      <th>Description</th>
                      <th style={{ textAlign: 'center' }}>Stops Count</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes.map((r, idx) => (
                      <tr key={r.id}>
                        <td>{idx + 1}</td>
                        <td style={{ fontWeight: 600 }}>{r.name}</td>
                        <td>{r.description || '\u2014'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge badge-primary">{r.stops_count}</span>
                        </td>
                        <td>
                          <ActionMenu
                            onEdit={() => openRouteModal(r)}
                            onDelete={() => handleDeleteRoute(r)}
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

      {/* ══════════ TAB: Stops ══════════ */}
      <div className={`att-view${activeTab === 'stops' ? ' active' : ''}`}>
        <div className="card">
          <div className="card-header">
            <h3>Stops</h3>
            <button className="btn btn-primary btn-sm" onClick={() => openStopModal()}>+ Add Stop</button>
          </div>
          <div className="card-body">
            {/* Route filter dropdown */}
            <div style={{ marginBottom: 16 }}>
              <select
                className="form-select"
                style={{ width: 260, height: 38 }}
                value={stopsRouteFilter}
                onChange={(e) => setStopsRouteFilter(e.target.value)}
              >
                <option value="">All Routes</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

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
                      <th>Route</th>
                      <th style={{ textAlign: 'center' }}>Sequence</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stops.map((s, idx) => (
                      <tr key={s.id}>
                        <td>{idx + 1}</td>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td>
                          <span className="badge badge-primary">{s.route_name || '\u2014'}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>{s.sequence_order}</td>
                        <td>
                          <ActionMenu
                            onEdit={() => openStopModal(s)}
                            onDelete={() => handleDeleteStop(s)}
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

      {/* ══════════ TAB: Admissions ══════════ */}
      <div className={`att-view${activeTab === 'admissions' ? ' active' : ''}`}>
        <div className="card">
          <div className="card-header">
            <h3>Student Admissions</h3>
            <button className="btn btn-primary btn-sm" onClick={() => openAdmissionModal()}>+ Add Admission</button>
          </div>
          <div className="card-body">
            {/* Search */}
            <div style={{ marginBottom: 16 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by name, father name, or mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', maxWidth: 400, height: 38 }}
              />
            </div>

            {/* Route filter pills */}
            <div className="tab-pills">
              <button
                className={`tab-pill${routeFilter === 'all' ? ' active' : ''}`}
                onClick={() => setRouteFilter('all')}
              >
                All ({admissions.length})
              </button>
              {routes.map((r) => {
                const count = admissions.filter((a) => a.route_id === r.id).length;
                return (
                  <button
                    key={r.id}
                    className={`tab-pill${routeFilter === r.id ? ' active' : ''}`}
                    onClick={() => setRouteFilter(r.id)}
                  >
                    {r.name} ({count})
                  </button>
                );
              })}
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
                      <th>Photo</th>
                      <th>Student Name</th>
                      <th>Father Name</th>
                      <th>Surname</th>
                      <th>Class</th>
                      <th>Gender</th>
                      <th>Mobile</th>
                      <th>Route</th>
                      <th>Stop</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmissions.map((a, idx) => {
                      const colors = avatarColors(idx);
                      return (
                        <tr key={a.id}>
                          <td>{idx + 1}</td>
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
                          <td>{a.surname || '\u2014'}</td>
                          <td>{a.class_grade || '\u2014'}</td>
                          <td>{a.gender || '\u2014'}</td>
                          <td>{a.primary_mobile || '\u2014'}</td>
                          <td>
                            {a.route_name ? (
                              <span className="badge badge-primary">{a.route_name}</span>
                            ) : '\u2014'}
                          </td>
                          <td>
                            {a.stop_name ? (
                              <span className="badge badge-success">{a.stop_name}</span>
                            ) : '\u2014'}
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

      {/* ══════════ MODAL: Route Add/Edit ══════════ */}
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

      {/* ══════════ MODAL: Stop Add/Edit ══════════ */}
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
        <div className="form-group">
          <label className="form-label">Route *</label>
          <select
            className="form-select"
            value={stopForm.route_id}
            onChange={(e) => setStopForm({ ...stopForm, route_id: e.target.value })}
          >
            <option value="">Select Route</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
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
          <label className="form-label">Sequence Order</label>
          <input
            type="number"
            className="form-input"
            value={stopForm.sequence_order}
            onChange={(e) => setStopForm({ ...stopForm, sequence_order: parseInt(e.target.value) || 1 })}
            min={1}
          />
        </div>
      </Modal>

      {/* ══════════ MODAL: Admission Add/Edit ══════════ */}
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
        {/* Row 1 */}
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
        {/* Row 2 */}
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
            <label className="form-label">Class / Grade</label>
            <input
              className="form-input"
              value={admForm.class_grade}
              onChange={(e) => setAdmForm({ ...admForm, class_grade: e.target.value })}
              placeholder="e.g. Class 5"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-input"
              value={admForm.dob}
              onChange={(e) => setAdmForm({ ...admForm, dob: e.target.value })}
            />
          </div>
        </div>
        {/* Row 3 */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Primary Mobile</label>
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
        {/* Row 4 */}
        <div className="form-group">
          <label className="form-label">Address</label>
          <textarea
            className="form-input"
            value={admForm.address}
            onChange={(e) => setAdmForm({ ...admForm, address: e.target.value })}
            placeholder="Full address"
            rows={2}
            style={{ resize: 'vertical' }}
          />
        </div>
        {/* Row 5 */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Route</label>
            <select
              className="form-select"
              value={admForm.route_id}
              onChange={(e) => setAdmForm({ ...admForm, route_id: e.target.value, stop_id: '' })}
            >
              <option value="">Select Route</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Stop</label>
            <select
              className="form-select"
              value={admForm.stop_id}
              onChange={(e) => setAdmForm({ ...admForm, stop_id: e.target.value })}
              disabled={!admForm.route_id}
            >
              <option value="">{admForm.route_id ? 'Select Stop' : 'Select route first'}</option>
              {formStops.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Row 6: Photo */}
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

      {/* ══════════ MODAL: View Admission Details ══════════ */}
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
            }}>&#9998; Edit</button>
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
              <DetailItem label="Student Name" value={viewAdmission.student_name} />
              <DetailItem label="Father Name" value={viewAdmission.father_name} />
              <DetailItem label="Surname" value={viewAdmission.surname} />
              <DetailItem label="Gender" value={viewAdmission.gender} />
              <DetailItem label="Class / Grade" value={viewAdmission.class_grade} />
              <DetailItem label="Date of Birth" value={viewAdmission.dob} />
              <DetailItem label="Primary Mobile" value={viewAdmission.primary_mobile} />
              <DetailItem label="Secondary Mobile" value={viewAdmission.secondary_mobile} />
              <div style={{ gridColumn: '1 / -1' }}>
                <DetailItem label="Address" value={viewAdmission.address} />
              </div>
              <DetailItem label="Route" value={viewAdmission.route_name} />
              <DetailItem label="Stop" value={viewAdmission.stop_name} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

/* ─── Detail Item helper ─── */
function DetailItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{value || '\u2014'}</div>
    </div>
  );
}
