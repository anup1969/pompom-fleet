'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/session-context';
import AddBusModal from '@/components/modals/AddBusModal';
import BusProfileModal from '@/components/modals/BusProfileModal';

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ─── Helper: determine status from bus data ─── */
function getBusStatus(bus: any): { label: string; badge: string } {
  const now = new Date();
  if (bus.puc_due && new Date(bus.puc_due) < now) return { label: 'PUC Due', badge: 'badge-warning' };
  if (bus.passing_due && new Date(bus.passing_due) < now) return { label: 'Passing Due', badge: 'badge-warning' };
  if (bus.next_service_km && bus.odometer && Number(bus.next_service_km) - Number(bus.odometer) < 1000) {
    return { label: 'Service Soon', badge: 'badge-warning' };
  }
  return { label: bus.status || 'Active', badge: 'badge-success' };
}

/* ─── Action Menu Component ─── */
function ActionMenu({
  bus,
  onView,
  onEdit,
  onDelete,
}: {
  bus: any;
  onView: (b: any) => void;
  onEdit: (b: any) => void;
  onDelete: (b: any) => void;
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
        <button onClick={() => { onView(bus); setOpen(false); }}>&#128065; View</button>
        <button onClick={() => { onEdit(bus); setOpen(false); }}>&#9998; Edit</button>
        <button className="danger" onClick={() => { onDelete(bus); setOpen(false); }}>&#128465; Delete</button>
      </div>
    </div>
  );
}

export default function BusFleetPage() {
  const { tenant, loading: sessionLoading } = useSession();

  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [addOpen, setAddOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<any>(null);

  const fetchBuses = useCallback(async () => {
    if (!tenant?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/buses?tenant_id=${tenant.id}`);
      if (res.ok) {
        setBuses(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [tenant?.id]);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  function handleView(bus: any) {
    setSelectedBus(bus);
    setProfileOpen(true);
  }

  function handleEdit(bus: any) {
    setEditData(bus);
    setAddOpen(true);
  }

  async function handleDelete(bus: any) {
    if (!confirm(`Delete bus ${bus.vehicle_no}? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/buses/${bus.id}`, { method: 'DELETE' });
      if (res.ok) fetchBuses();
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

  function handleEditFromProfile(bus: any) {
    setProfileOpen(false);
    setSelectedBus(null);
    setEditData(bus);
    setAddOpen(true);
  }

  if (sessionLoading || loading) {
    return (
      <div className="card">
        <div className="card-body" style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>
          Loading buses...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3>Bus Fleet</h3>
          <button className="btn btn-primary btn-sm" onClick={handleAddNew}>+ Add Bus</button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {buses.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>
              No buses found. Add your first bus.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Vehicle No</th>
                    <th>Make / Model</th>
                    <th>Chassis No</th>
                    <th>Engine No</th>
                    <th>Seats</th>
                    <th>Odometer</th>
                    <th>Passing Due</th>
                    <th>PUC Due</th>
                    <th>Service Due</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {buses.map((bus, idx) => {
                    const status = getBusStatus(bus);
                    const pucExpired = bus.puc_due && new Date(bus.puc_due) < new Date();
                    return (
                      <tr key={bus.id}>
                        <td>{idx + 1}</td>
                        <td>
                          <a className="clickable-link" onClick={() => handleView(bus)}>
                            {bus.vehicle_no}
                          </a>
                        </td>
                        <td>{bus.make_model || '\u2014'}</td>
                        <td>{bus.chassis_no || '\u2014'}</td>
                        <td>{bus.engine_no || '\u2014'}</td>
                        <td>{bus.seats ?? '\u2014'}</td>
                        <td>{bus.odometer ? `${Number(bus.odometer).toLocaleString('en-IN')} km` : '\u2014'}</td>
                        <td>{bus.passing_due || '\u2014'}</td>
                        <td>
                          {pucExpired ? (
                            <span style={{ color: 'var(--error)', fontWeight: 600 }}>Expired!</span>
                          ) : (
                            bus.puc_due || '\u2014'
                          )}
                        </td>
                        <td>{bus.next_service_km ? `${Number(bus.next_service_km).toLocaleString('en-IN')} km` : '\u2014'}</td>
                        <td>
                          <span className={`badge ${status.badge}`}>{status.label}</span>
                        </td>
                        <td>
                          <ActionMenu
                            bus={bus}
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

      {/* Add / Edit Bus Modal */}
      <AddBusModal
        isOpen={addOpen}
        onClose={handleModalClose}
        onSaved={fetchBuses}
        tenantId={tenant?.id}
        editData={editData}
      />

      {/* Bus Profile Modal */}
      <BusProfileModal
        isOpen={profileOpen}
        onClose={() => { setProfileOpen(false); setSelectedBus(null); }}
        bus={selectedBus}
        onEdit={handleEditFromProfile}
      />
    </>
  );
}
