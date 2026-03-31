'use client';

import { useState, useEffect, useCallback } from 'react';
import { downloadExcel } from '@/lib/excel';

/* eslint-disable @typescript-eslint/no-explicit-any */

const ADMIN_KEY = 'pompom2026';

interface Tenant {
  id: string;
  client_name: string;
}

interface AdminAdmission {
  id: string;
  tenant_id: string;
  client_name: string;
  student_name: string;
  father_name: string;
  surname: string | null;
  gender: string | null;
  class_grade: string | null;
  section: string | null;
  grn: string | null;
  dob: string | null;
  address_line1: string | null;
  address_line2: string | null;
  area_name: string | null;
  city: string | null;
  primary_mobile: string | null;
  secondary_mobile: string | null;
  pickup_route_name: string | null;
  pickup_stop_name: string | null;
  drop_route_name: string | null;
  drop_stop_name: string | null;
  created_at: string;
}

function fmtDate(d: string | null): string {
  if (!d) return '--';
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return d;
  }
}

export default function AdminAdmissionsPage() {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  // Data
  const [admissions, setAdmissions] = useState<AdminAdmission[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterTenant, setFilterTenant] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  // Check authorization via URL key param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('key');
    if (key === ADMIN_KEY) {
      setAuthorized(true);
    }
    setChecking(false);
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!authorized) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ key: ADMIN_KEY });
      if (filterTenant) params.set('tenant_id', filterTenant);
      if (filterClass) params.set('class_grade', filterClass);
      if (filterArea) params.set('area_name', filterArea);
      if (filterSearch) params.set('search', filterSearch);
      if (filterFrom) params.set('from_date', filterFrom);
      if (filterTo) params.set('to_date', filterTo);

      const res = await fetch(`/api/admin/admissions?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setAdmissions(json.admissions || []);
        setTenants(json.tenants || []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [authorized, filterTenant, filterClass, filterArea, filterSearch, filterFrom, filterTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Stats
  const totalAdmissions = admissions.length;
  const uniqueTenants = new Set(admissions.map((a) => a.tenant_id)).size;
  const thisMonth = admissions.filter((a) => {
    const d = new Date(a.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const unassigned = admissions.filter(
    (a) => !a.pickup_route_name && !a.drop_route_name
  ).length;

  // Unique classes for filter
  const uniqueClasses = Array.from(
    new Set(admissions.map((a) => a.class_grade).filter(Boolean))
  ).sort();

  function clearFilters() {
    setFilterTenant('');
    setFilterClass('');
    setFilterArea('');
    setFilterSearch('');
    setFilterFrom('');
    setFilterTo('');
  }

  function handleExportExcel() {
    const rows = admissions.map((a) => ({
      'Client Name': a.client_name,
      'GRN': a.grn || '',
      'Student Name': a.student_name,
      'Father Name': a.father_name,
      'Surname': a.surname || '',
      'Gender': a.gender || '',
      'Class': a.class_grade || '',
      'Section': a.section || '',
      'DOB': a.dob || '',
      'Primary Mobile': a.primary_mobile || '',
      'Secondary Mobile': a.secondary_mobile || '',
      'Address Line 1': a.address_line1 || '',
      'Address Line 2': a.address_line2 || '',
      'Area': a.area_name || '',
      'City': a.city || '',
      'Pickup Route': a.pickup_route_name || '',
      'Pickup Stop': a.pickup_stop_name || '',
      'Drop Route': a.drop_route_name || '',
      'Drop Stop': a.drop_stop_name || '',
      'Date Added': fmtDate(a.created_at),
    }));
    const today = new Date().toISOString().slice(0, 10);
    downloadExcel(rows, `PomPom_All_Admissions_${today}.xlsx`, 'Admissions');
  }

  // Unauthorized
  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--lightgray)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--bodytext)' }}>Checking access...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--lightgray)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: 400, textAlign: 'center' }}>
          <div className="card-body" style={{ padding: 40 }}>
            <div style={{ width: 56, height: 56, background: 'var(--accent)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22, fontWeight: 700, color: 'var(--dark)' }}>
              PP
            </div>
            <h2 style={{ marginBottom: 8 }}>Access Denied</h2>
            <p style={{ color: 'var(--bodytext)' }}>
              This page requires a valid admin key. Please check your URL.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--lightgray)' }}>
      {/* Admin Header Bar */}
      <div style={{
        background: 'var(--darkgray)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '3px solid var(--accent)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, background: 'var(--accent)', borderRadius: 'var(--radius)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: 'var(--dark)',
          }}>
            PP
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>PomPom Admin</div>
            <div style={{ color: 'var(--bodytext)', fontSize: 11 }}>All Admissions -- Cross-Tenant</div>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleExportExcel}>
          Export All to Excel
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px' }}>
        {/* Stats Row */}
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat-card bg-primary">
            <div className="stat-value">{totalAdmissions}</div>
            <div className="stat-label">Total Admissions</div>
          </div>
          <div className="stat-card bg-success">
            <div className="stat-value">{uniqueTenants}</div>
            <div className="stat-label">Total Clients</div>
          </div>
          <div className="stat-card bg-info">
            <div className="stat-value">{thisMonth}</div>
            <div className="stat-label">This Month</div>
          </div>
          <div className="stat-card bg-accent">
            <div className="stat-value">{unassigned}</div>
            <div className="stat-label">Unassigned (No Route)</div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <h3>Filters</h3>
            <button className="btn btn-outline btn-sm" onClick={clearFilters}>Clear All</button>
          </div>
          <div className="card-body">
            <div className="filter-row">
              <div className="form-group" style={{ marginBottom: 0, minWidth: 180 }}>
                <label className="form-label">Client / Tenant</label>
                <select
                  className="form-select"
                  style={{ height: 38 }}
                  value={filterTenant}
                  onChange={(e) => setFilterTenant(e.target.value)}
                >
                  <option value="">All Clients</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.client_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0, minWidth: 120 }}>
                <label className="form-label">Class</label>
                <select
                  className="form-select"
                  style={{ height: 38 }}
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                >
                  <option value="">All</option>
                  {uniqueClasses.map((c) => (
                    <option key={c} value={c!}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0, minWidth: 140 }}>
                <label className="form-label">Area</label>
                <input
                  className="form-input"
                  style={{ height: 38 }}
                  placeholder="Area name..."
                  value={filterArea}
                  onChange={(e) => setFilterArea(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0, minWidth: 140 }}>
                <label className="form-label">From Date</label>
                <input
                  type="date"
                  className="form-input"
                  style={{ height: 38 }}
                  value={filterFrom}
                  onChange={(e) => setFilterFrom(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0, minWidth: 140 }}>
                <label className="form-label">To Date</label>
                <input
                  type="date"
                  className="form-input"
                  style={{ height: 38 }}
                  value={filterTo}
                  onChange={(e) => setFilterTo(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0, minWidth: 200 }}>
                <label className="form-label">Search</label>
                <input
                  className="form-input"
                  style={{ height: 38 }}
                  placeholder="Name, GRN, Mobile..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="card">
          <div className="card-header">
            <h3>
              All Admissions
              <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--bodytext)', marginLeft: 8 }}>
                ({admissions.length} record{admissions.length !== 1 ? 's' : ''})
              </span>
            </h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>
                Loading all admissions...
              </div>
            ) : admissions.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>
                No admissions found.
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Client Name</th>
                      <th>GRN</th>
                      <th>Student Name</th>
                      <th>Father Name</th>
                      <th>Class-Sec</th>
                      <th>Mobile</th>
                      <th>Area</th>
                      <th>City</th>
                      <th>Pickup Route</th>
                      <th>Pickup Stop</th>
                      <th>Drop Route</th>
                      <th>Drop Stop</th>
                      <th>Date Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admissions.map((a, idx) => {
                      const classSec = [a.class_grade, a.section].filter(Boolean).join('-');
                      return (
                        <tr key={a.id}>
                          <td>{idx + 1}</td>
                          <td>
                            <span className="badge badge-accent">{a.client_name}</span>
                          </td>
                          <td>{a.grn || '--'}</td>
                          <td style={{ fontWeight: 500 }}>{a.student_name}</td>
                          <td>{a.father_name}</td>
                          <td>
                            {classSec ? <span className="badge badge-primary">{classSec}</span> : '--'}
                          </td>
                          <td>{a.primary_mobile || '--'}</td>
                          <td>{a.area_name || '--'}</td>
                          <td>{a.city || '--'}</td>
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
                          <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(a.created_at)}</td>
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
    </div>
  );
}
