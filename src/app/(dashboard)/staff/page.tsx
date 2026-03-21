'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/session-context';
import AddStaffModal from '@/components/modals/AddStaffModal';
import StaffProfileModal from '@/components/modals/StaffProfileModal';

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ─── Types ─── */
type StaffTabKey = 'all' | 'Driver' | 'Assistant' | 'Lady Attendant';

/* ─── Helpers ─── */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function roleBadge(role: string): string {
  switch (role) {
    case 'Driver': return 'badge-primary';
    case 'Assistant': return 'badge-info';
    case 'Lady Attendant': return 'badge-accent';
    default: return 'badge-primary';
  }
}

function avatarColors(idx: number): { bg: string; color: string } {
  const palette = [
    { bg: 'var(--lightprimary)', color: 'var(--primary)' },
    { bg: 'var(--lightsuccess)', color: 'var(--success)' },
    { bg: 'var(--lightwarning)', color: '#b45309' },
    { bg: 'var(--lightsecondary)', color: '#0e7490' },
    { bg: 'var(--lighterror)', color: 'var(--error)' },
    { bg: 'var(--lightaccent)', color: '#92400e' },
  ];
  return palette[idx % palette.length];
}

/* ─── Action Menu Component ─── */
function ActionMenu({
  staff,
  onView,
  onEdit,
  onDelete,
}: {
  staff: any;
  onView: (s: any) => void;
  onEdit: (s: any) => void;
  onDelete: (s: any) => void;
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
        <button onClick={() => { onView(staff); setOpen(false); }}>&#128065; View</button>
        <button onClick={() => { onEdit(staff); setOpen(false); }}>&#9998; Edit</button>
        <button className="danger" onClick={() => { onDelete(staff); setOpen(false); }}>&#128465; Delete</button>
      </div>
    </div>
  );
}

export default function StaffPage() {
  const { tenant, loading: sessionLoading } = useSession();

  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StaffTabKey>('all');

  // Modal state
  const [addOpen, setAddOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  const fetchStaff = useCallback(async () => {
    if (!tenant?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/staff?tenant_id=${tenant.id}`);
      if (res.ok) {
        setStaffList(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [tenant?.id]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Filtered data
  const filtered = activeTab === 'all' ? staffList : staffList.filter((s) => s.role === activeTab);

  // Counts for tabs
  const allCount = staffList.length;
  const driverCount = staffList.filter((s) => s.role === 'Driver').length;
  const assistantCount = staffList.filter((s) => s.role === 'Assistant').length;
  const ladyAttendantCount = staffList.filter((s) => s.role === 'Lady Attendant').length;

  function handleView(staff: any) {
    setSelectedStaff(staff);
    setProfileOpen(true);
  }

  function handleEdit(staff: any) {
    setEditData(staff);
    setAddOpen(true);
  }

  async function handleDelete(staff: any) {
    if (!confirm(`Delete ${staff.name}? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/staff/${staff.id}`, { method: 'DELETE' });
      if (res.ok) fetchStaff();
    } catch {
      // ignore
    }
  }

  function handleAddNew() {
    setEditData(null);
    setAddOpen(true);
  }

  function handleModalClose() {
    setAddOpen(false);
    setEditData(null);
  }

  function handleEditFromProfile(staff: any) {
    setProfileOpen(false);
    setSelectedStaff(null);
    setEditData(staff);
    setAddOpen(true);
  }

  if (sessionLoading || loading) {
    return (
      <div className="card">
        <div className="card-body" style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>
          Loading staff...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3>Transport Staff</h3>
          <button className="btn btn-primary btn-sm" onClick={handleAddNew}>+ Add Staff</button>
        </div>
        <div className="card-body">
          {/* Tab Pills */}
          <div className="tab-pills">
            <button
              className={`tab-pill${activeTab === 'all' ? ' active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({allCount})
            </button>
            <button
              className={`tab-pill${activeTab === 'Driver' ? ' active' : ''}`}
              onClick={() => setActiveTab('Driver')}
            >
              Drivers ({driverCount})
            </button>
            <button
              className={`tab-pill${activeTab === 'Assistant' ? ' active' : ''}`}
              onClick={() => setActiveTab('Assistant')}
            >
              Assistants ({assistantCount})
            </button>
            <button
              className={`tab-pill${activeTab === 'Lady Attendant' ? ' active' : ''}`}
              onClick={() => setActiveTab('Lady Attendant')}
            >
              Lady Attendants ({ladyAttendantCount})
            </button>
          </div>

          {/* Staff Table */}
          {filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>
              {staffList.length === 0
                ? 'No staff found. Add your first staff member.'
                : 'No staff in this category.'}
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Father&apos;s Name</th>
                    <th>Role</th>
                    <th>DOB</th>
                    <th>Aadhar</th>
                    <th>License</th>
                    <th>License Expiry</th>
                    <th>Phone</th>
                    <th>Salary (&#8377;)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((staff, idx) => {
                    const colors = avatarColors(idx);
                    const licenseExpired = staff.license_expiry && new Date(staff.license_expiry) < new Date();
                    return (
                      <tr key={staff.id} data-role={staff.role}>
                        <td>{idx + 1}</td>
                        <td>
                          <div
                            className="avatar"
                            style={{ background: colors.bg, color: colors.color }}
                          >
                            {getInitials(staff.name || 'NA')}
                          </div>
                        </td>
                        <td>
                          <a className="clickable-link" onClick={() => handleView(staff)}>
                            {staff.name}
                          </a>
                        </td>
                        <td>{staff.father_name || '\u2014'}</td>
                        <td>
                          <span className={`badge ${roleBadge(staff.role)}`}>{staff.role || '\u2014'}</span>
                        </td>
                        <td>{staff.dob || '\u2014'}</td>
                        <td>
                          <a className="clickable-link">{staff.aadhar || '\u2014'}</a>
                        </td>
                        <td>
                          {staff.license_no ? (
                            <a className="clickable-link">{staff.license_no}</a>
                          ) : (
                            '\u2014'
                          )}
                        </td>
                        <td>
                          {licenseExpired ? (
                            <span style={{ color: 'var(--error)', fontWeight: 600 }}>
                              {staff.license_expiry}
                            </span>
                          ) : (
                            staff.license_expiry || '\u2014'
                          )}
                        </td>
                        <td>{staff.phone || '\u2014'}</td>
                        <td>{staff.salary ? `\u20B9${Number(staff.salary).toLocaleString('en-IN')}` : '\u2014'}</td>
                        <td>
                          <span className="badge badge-success">{staff.status || 'Active'}</span>
                        </td>
                        <td>
                          <ActionMenu
                            staff={staff}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
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

      {/* Add / Edit Staff Modal */}
      <AddStaffModal
        isOpen={addOpen}
        onClose={handleModalClose}
        onSaved={fetchStaff}
        tenantId={tenant?.id}
        editData={editData}
      />

      {/* Staff Profile Modal */}
      <StaffProfileModal
        isOpen={profileOpen}
        onClose={() => { setProfileOpen(false); setSelectedStaff(null); }}
        staff={selectedStaff}
        onEdit={handleEditFromProfile}
      />
    </>
  );
}
