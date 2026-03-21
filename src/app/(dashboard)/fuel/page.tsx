'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/session-context';
import Modal from '@/components/Modal';

/* ──────────────── Types ──────────────── */
interface FuelLog {
  id: string;
  date: string;
  bus_id: string | null;
  vehicle_no?: string;
  station: string | null;
  litres: number;
  rate: number;
  amount: number;
  odometer: number | null;
  mileage: number | null;
  remarks: string | null;
}

function formatCurrency(n: number) {
  return '\u20B9' + n.toLocaleString('en-IN');
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function getMileageColor(mileage: number | null) {
  if (mileage === null) return 'var(--bodytext)';
  if (mileage >= 4.0) return 'var(--success)';
  if (mileage >= 3.5) return 'var(--warning)';
  return 'var(--error)';
}

function isToday(dateStr: string) {
  return dateStr === formatDateISO(new Date());
}

function isThisWeek(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return d >= weekStart && d <= now;
}

function isThisMonth(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export default function FuelPage() {
  const { tenant } = useSession();

  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [periodFilter, setPeriodFilter] = useState('all');
  const [busFilter, setBusFilter] = useState('');

  /* ── Add Fuel Entry modal ── */
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [fDate, setFDate] = useState('');
  const [fBus, setFBus] = useState('');
  const [fStation, setFStation] = useState('');
  const [fLitres, setFLitres] = useState('');
  const [fRate, setFRate] = useState('');
  const [fOdo, setFOdo] = useState('');
  const [fMileage, setFMileage] = useState('');
  const [fRemarks, setFRemarks] = useState('');
  const [fSaving, setFSaving] = useState(false);

  /* ── Fetch fuel logs ── */
  const fetchFuelLogs = useCallback(async () => {
    if (!tenant?.id) return;
    try {
      const res = await fetch(`/api/fuel-logs?tenant_id=${tenant.id}`);
      if (res.ok) {
        setFuelLogs(await res.json());
      }
    } catch {
      // silent
    }
  }, [tenant?.id]);

  useEffect(() => {
    if (!tenant?.id) return;
    setLoading(true);
    fetchFuelLogs().finally(() => setLoading(false));
  }, [tenant?.id, fetchFuelLogs]);

  /* ── Derived ── */
  const uniqueBuses = Array.from(new Set(fuelLogs.map((f) => f.vehicle_no).filter(Boolean))) as string[];

  // Period filter
  const periodFiltered = fuelLogs.filter((f) => {
    if (periodFilter === 'today') return isToday(f.date);
    if (periodFilter === 'week') return isThisWeek(f.date);
    if (periodFilter === 'month') return isThisMonth(f.date);
    return true;
  });

  // Bus filter
  const filtered = periodFiltered.filter((f) => {
    if (busFilter && f.vehicle_no !== busFilter) return false;
    return true;
  });

  // Totals
  const totalLitres = filtered.reduce((sum, f) => sum + (f.litres ?? 0), 0);
  const totalCost = filtered.reduce((sum, f) => sum + (f.amount ?? 0), 0);
  const mileages = filtered.map((f) => f.mileage).filter((m): m is number => m !== null && m > 0);
  const avgMileage = mileages.length > 0 ? (mileages.reduce((a, b) => a + b, 0) / mileages.length).toFixed(1) : '0.0';
  const rates = filtered.map((f) => f.rate).filter((r): r is number => r !== null && r > 0);
  const avgRate = rates.length > 0 ? (rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(1) : '0.0';

  const periodTabs = [
    { key: 'all', label: 'All' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  /* ── Add fuel entry ── */
  function resetAddForm() {
    setFDate('');
    setFBus('');
    setFStation('');
    setFLitres('');
    setFRate('');
    setFOdo('');
    setFMileage('');
    setFRemarks('');
  }

  async function handleAddFuel() {
    if (!tenant?.id || !fLitres || !fRate || !fDate) return;
    setFSaving(true);

    const litres = parseFloat(fLitres);
    const rate = parseFloat(fRate);

    const payload = {
      tenant_id: tenant.id,
      date: fDate,
      bus_id: fBus || null,
      station: fStation || null,
      litres,
      rate,
      amount: Math.round(litres * rate * 100) / 100,
      odometer: fOdo ? parseInt(fOdo) : null,
      mileage: fMileage ? parseFloat(fMileage) : null,
      remarks: fRemarks || null,
    };

    try {
      const res = await fetch('/api/fuel-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setAddModalOpen(false);
        resetAddForm();
        fetchFuelLogs();
      } else {
        const err = await res.json();
        alert(err.error ?? 'Failed to save');
      }
    } catch {
      alert('Network error');
    } finally {
      setFSaving(false);
    }
  }

  /* ── Fetch buses for add form ── */
  const [busList, setBusList] = useState<{ id: string; vehicle_no: string }[]>([]);

  useEffect(() => {
    if (!tenant?.id) return;
    fetch(`/api/buses?tenant_id=${tenant.id}`)
      .then((r) => r.json())
      .then(setBusList)
      .catch(() => {});
  }, [tenant?.id]);

  if (loading) {
    return (
      <div className="card">
        <div className="card-body" style={{ textAlign: 'center', padding: 60, color: 'var(--bodytext)' }}>
          Loading fuel logs...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3>Fuel Log</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select
              className="form-select"
              style={{ width: 180, height: 38 }}
              value={busFilter}
              onChange={(e) => setBusFilter(e.target.value)}
            >
              <option value="">All Buses</option>
              {uniqueBuses.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
            <button className="btn btn-outline btn-sm" onClick={() => alert('Export coming soon')}>
              {'\uD83D\uDCE5'} Export
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setAddModalOpen(true)}>
              + Add Fuel Entry
            </button>
          </div>
        </div>
        <div className="card-body">
          {/* Tab Pill Filters */}
          <div className="tab-pills">
            {periodTabs.map((t) => (
              <button
                key={t.key}
                className={`tab-pill${periodFilter === t.key ? ' active' : ''}`}
                onClick={() => setPeriodFilter(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Summary Boxes */}
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
            <div className="stat-card bg-primary">
              <div className="stat-icon">{'\u26FD'}</div>
              <div className="stat-value">{totalLitres.toLocaleString('en-IN')} L</div>
              <div className="stat-label">Total Fuel</div>
            </div>
            <div className="stat-card bg-error">
              <div className="stat-icon">{'\u20B9'}</div>
              <div className="stat-value">{formatCurrency(totalCost)}</div>
              <div className="stat-label">Total Cost</div>
            </div>
            <div className="stat-card bg-success">
              <div className="stat-icon">{'\uD83D\uDE97'}</div>
              <div className="stat-value">{avgMileage} km/L</div>
              <div className="stat-label">Avg Mileage</div>
            </div>
            <div className="stat-card bg-accent">
              <div className="stat-icon">{'\uD83D\uDCC8'}</div>
              <div className="stat-value">{'\u20B9'}{avgRate}/L</div>
              <div className="stat-label">Avg Rate</div>
            </div>
          </div>

          {/* Fuel Table */}
          {fuelLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--bodytext)' }}>
              No fuel entries yet. Click &quot;+ Add Fuel Entry&quot; to get started.
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--bodytext)' }}>
              No fuel entries match the current filters.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Bus No</th>
                    <th>Fuel Station</th>
                    <th>Litres</th>
                    <th>Rate/L</th>
                    <th>Amount ({'\u20B9'})</th>
                    <th>Odo Reading</th>
                    <th>Mileage (km/L)</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f) => (
                    <tr key={f.id}>
                      <td>{formatDate(f.date)}</td>
                      <td>
                        <a className="clickable-link">{f.vehicle_no ?? '\u2014'}</a>
                      </td>
                      <td>{f.station ?? '\u2014'}</td>
                      <td>{f.litres}</td>
                      <td>{'\u20B9'}{f.rate}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(f.amount)}</td>
                      <td>{f.odometer ? `${f.odometer.toLocaleString('en-IN')} km` : '\u2014'}</td>
                      <td>
                        <span style={{ color: getMileageColor(f.mileage), fontWeight: 600 }}>
                          {f.mileage ? `${f.mileage} km/L` : '\u2014'}
                        </span>
                      </td>
                      <td>{f.remarks ?? '\u2014'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {filtered.length > 0 && (
            <div className="table-footer">
              Total: {totalLitres.toLocaleString('en-IN')} Litres &middot; {formatCurrency(totalCost)}
            </div>
          )}
        </div>
      </div>

      {/* Add Fuel Entry Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => { setAddModalOpen(false); resetAddForm(); }}
        title="Add Fuel Entry"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => { setAddModalOpen(false); resetAddForm(); }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddFuel} disabled={fSaving}>
              {fSaving ? 'Saving...' : 'Save Entry'}
            </button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              className="form-input"
              type="date"
              value={fDate}
              onChange={(e) => setFDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Bus</label>
            <select className="form-select" value={fBus} onChange={(e) => setFBus(e.target.value)}>
              <option value="">Select Bus</option>
              {busList.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.vehicle_no}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Fuel Station</label>
          <input
            className="form-input"
            placeholder="e.g. HP Isanpur, Ahmedabad"
            value={fStation}
            onChange={(e) => setFStation(e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Litres</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g. 65"
              value={fLitres}
              onChange={(e) => setFLitres(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Rate per Litre (&#8377;)</label>
            <input
              className="form-input"
              type="number"
              step="0.1"
              placeholder="e.g. 89.5"
              value={fRate}
              onChange={(e) => setFRate(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Odometer (km)</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g. 38520"
              value={fOdo}
              onChange={(e) => setFOdo(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mileage (km/L)</label>
            <input
              className="form-input"
              type="number"
              step="0.1"
              placeholder="e.g. 4.6"
              value={fMileage}
              onChange={(e) => setFMileage(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Remarks</label>
          <input
            className="form-input"
            placeholder="e.g. Full tank"
            value={fRemarks}
            onChange={(e) => setFRemarks(e.target.value)}
          />
        </div>
      </Modal>
    </>
  );
}
