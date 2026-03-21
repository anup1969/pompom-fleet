'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/lib/session-context';
import Modal from '@/components/Modal';

/* ──────────────── Types ──────────────── */
interface InsuranceEntry {
  id: string;
  bus_id: string | null;
  vehicle_no: string;
  vehicle_model: string;
  provider: string;
  policy_no: string;
  insurance_type: string;
  idv: number | null;
  premium: number | null;
  start_date: string | null;
  end_date: string | null;
  agent_name: string;
  agent_phone: string;
}

type StatusKey = 'expired' | 'active';

/* ──────────────── Helpers ──────────────── */
function computeStatus(endDate: string | null): { status: StatusKey; label: string; badge: string; rowBg: string; expiryDanger: boolean } {
  if (!endDate) {
    return { status: 'active', label: 'Active', badge: 'badge-success', rowBg: '', expiryDanger: false };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  if (end < today) {
    return { status: 'expired', label: 'Expired', badge: 'badge-error', rowBg: 'rgba(255,102,146,.06)', expiryDanger: true };
  }
  return { status: 'active', label: 'Active', badge: 'badge-success', rowBg: '', expiryDanger: false };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '\u2014';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(amount: number | null): string {
  if (amount == null) return '\u2014';
  return '\u20B9' + amount.toLocaleString('en-IN');
}

const INSURANCE_TYPES = ['Comprehensive', 'Third Party', 'Own Damage'];

/* ─── Action Menu Component ─── */
function ActionMenu({
  isExpired,
  onEdit,
  onDelete,
}: {
  isExpired: boolean;
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
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {isExpired && (
        <button className="btn btn-error btn-sm">&#128256; Renew</button>
      )}
      <button className="btn btn-outline btn-sm" onClick={() => setOpen(!open)} ref={ref as unknown as React.Ref<HTMLButtonElement>}>
        &#128065; View
      </button>
      <div className="action-wrap" ref={ref}>
        <button className="btn-icon" onClick={() => setOpen(!open)}>
          &#8942;
        </button>
        <div className={`action-menu${open ? ' show' : ''}`}>
          <button
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
          >
            &#9998; Edit
          </button>
          <button
            className="danger"
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
          >
            &#128465; Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Page ──────────────── */
export default function InsurancePage() {
  const { tenant } = useSession();
  const [insuranceList, setInsuranceList] = useState<InsuranceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIns, setEditingIns] = useState<InsuranceEntry | null>(null);
  const [saving, setSaving] = useState(false);

  /* Form fields */
  const [formVehicleNo, setFormVehicleNo] = useState('');
  const [formVehicleModel, setFormVehicleModel] = useState('');
  const [formProvider, setFormProvider] = useState('');
  const [formPolicyNo, setFormPolicyNo] = useState('');
  const [formType, setFormType] = useState('');
  const [formIdv, setFormIdv] = useState('');
  const [formPremium, setFormPremium] = useState('');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formAgent, setFormAgent] = useState('');
  const [formAgentPhone, setFormAgentPhone] = useState('');

  /* Fetch */
  async function fetchInsurance() {
    if (!tenant) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/insurance?tenant_id=${tenant.id}`);
      if (res.ok) {
        const data = await res.json();
        setInsuranceList(data);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInsurance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.id]);

  /* Computed statuses */
  const withStatus = insuranceList.map((ins) => ({
    ...ins,
    computed: computeStatus(ins.end_date),
  }));

  const expiredCount = withStatus.filter((i) => i.computed.status === 'expired').length;
  const activeCount = withStatus.filter((i) => i.computed.status === 'active').length;

  const STATUS_TABS = [
    { key: 'all', label: `All (${withStatus.length})`, style: {} },
    { key: 'expired', label: `Expired (${expiredCount})`, style: { borderColor: 'var(--error)', color: 'var(--error)' } },
    { key: 'active', label: `Active (${activeCount})`, style: { borderColor: 'var(--success)', color: 'var(--success)' } },
  ];

  const filtered = withStatus.filter(
    (ins) => statusFilter === 'all' || ins.computed.status === statusFilter
  );

  /* Reset form */
  function resetForm() {
    setFormVehicleNo('');
    setFormVehicleModel('');
    setFormProvider('');
    setFormPolicyNo('');
    setFormType('');
    setFormIdv('');
    setFormPremium('');
    setFormStart('');
    setFormEnd('');
    setFormAgent('');
    setFormAgentPhone('');
    setEditingIns(null);
  }

  function openAdd() {
    resetForm();
    setModalOpen(true);
  }

  function openEdit(ins: InsuranceEntry) {
    setEditingIns(ins);
    setFormVehicleNo(ins.vehicle_no || '');
    setFormVehicleModel(ins.vehicle_model || '');
    setFormProvider(ins.provider || '');
    setFormPolicyNo(ins.policy_no || '');
    setFormType(ins.insurance_type || '');
    setFormIdv(ins.idv != null ? String(ins.idv) : '');
    setFormPremium(ins.premium != null ? String(ins.premium) : '');
    setFormStart(ins.start_date ? ins.start_date.split('T')[0] : '');
    setFormEnd(ins.end_date ? ins.end_date.split('T')[0] : '');
    setFormAgent(ins.agent_name || '');
    setFormAgentPhone(ins.agent_phone || '');
    setModalOpen(true);
  }

  /* Save */
  async function handleSave() {
    if (!tenant || !formVehicleNo.trim()) return;
    setSaving(true);
    try {
      const payload = {
        tenant_id: tenant.id,
        vehicle_no: formVehicleNo.trim(),
        vehicle_model: formVehicleModel.trim(),
        provider: formProvider.trim(),
        policy_no: formPolicyNo.trim(),
        insurance_type: formType,
        idv: formIdv ? Number(formIdv) : null,
        premium: formPremium ? Number(formPremium) : null,
        start_date: formStart || null,
        end_date: formEnd || null,
        agent_name: formAgent.trim(),
        agent_phone: formAgentPhone.trim(),
      };

      if (editingIns) {
        await fetch(`/api/insurance/${editingIns.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/insurance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      setModalOpen(false);
      resetForm();
      fetchInsurance();
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  /* Delete */
  async function handleDelete(id: string) {
    if (!confirm('Delete this insurance record?')) return;
    await fetch(`/api/insurance/${id}`, { method: 'DELETE' });
    fetchInsurance();
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3>Insurance Register</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn btn-outline btn-sm">&#128229; Export</button>
            <button className="btn btn-primary btn-sm" onClick={openAdd}>
              + Add Insurance
            </button>
          </div>
        </div>
        <div className="card-body">
          {/* Tab Pill Filters */}
          <div className="tab-pills">
            {STATUS_TABS.map((t) => (
              <button
                key={t.key}
                className={`tab-pill${statusFilter === t.key ? ' active' : ''}`}
                style={statusFilter !== t.key ? t.style : undefined}
                onClick={() => setStatusFilter(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>
              Loading insurance records...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>
              {insuranceList.length === 0
                ? 'No insurance records yet. Click "+ Add Insurance" to create one.'
                : 'No records match the selected filter.'}
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Insurer</th>
                    <th>Policy No</th>
                    <th>Type</th>
                    <th>IDV ({'\u20B9'})</th>
                    <th>Premium ({'\u20B9'})</th>
                    <th>Start</th>
                    <th>Expiry</th>
                    <th>Status</th>
                    <th>Agent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ins) => (
                    <tr key={ins.id} style={ins.computed.rowBg ? { background: ins.computed.rowBg } : undefined}>
                      <td>
                        <a className="clickable-link">{ins.vehicle_no}</a>
                        {ins.vehicle_model && (
                          <div style={{ fontSize: 11, color: 'var(--bodytext)' }}>{ins.vehicle_model}</div>
                        )}
                      </td>
                      <td>{ins.provider || '\u2014'}</td>
                      <td>{ins.policy_no || '\u2014'}</td>
                      <td>{ins.insurance_type || '\u2014'}</td>
                      <td>{formatCurrency(ins.idv)}</td>
                      <td>{formatCurrency(ins.premium)}</td>
                      <td>{formatDate(ins.start_date)}</td>
                      <td style={ins.computed.expiryDanger ? { color: 'var(--error)', fontWeight: 600 } : undefined}>
                        {formatDate(ins.end_date)}
                      </td>
                      <td>
                        <span className={`badge ${ins.computed.badge}`}>{ins.computed.label}</span>
                      </td>
                      <td>
                        {ins.agent_name || '\u2014'}
                        {ins.agent_phone && (
                          <div style={{ fontSize: 11, color: 'var(--bodytext)' }}>{ins.agent_phone}</div>
                        )}
                      </td>
                      <td>
                        <ActionMenu
                          isExpired={ins.computed.status === 'expired'}
                          onEdit={() => openEdit(ins)}
                          onDelete={() => handleDelete(ins.id)}
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title={editingIns ? 'Edit Insurance' : 'Add New Insurance'}
        wide
        footer={
          <>
            <button
              className="btn btn-outline"
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingIns ? 'Update' : 'Save Insurance'}
            </button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Vehicle No *</label>
            <input
              className="form-input"
              placeholder="e.g. GJ-01-TX-5501"
              value={formVehicleNo}
              onChange={(e) => setFormVehicleNo(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Vehicle Model</label>
            <input
              className="form-input"
              placeholder="e.g. Tata Starbus"
              value={formVehicleModel}
              onChange={(e) => setFormVehicleModel(e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Insurance Provider</label>
            <input
              className="form-input"
              placeholder="e.g. New India Assurance"
              value={formProvider}
              onChange={(e) => setFormProvider(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Policy No</label>
            <input
              className="form-input"
              placeholder="e.g. NIA-2026-501"
              value={formPolicyNo}
              onChange={(e) => setFormPolicyNo(e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
            >
              <option value="">Select Type</option>
              {INSURANCE_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">IDV ({'\u20B9'})</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g. 850000"
              value={formIdv}
              onChange={(e) => setFormIdv(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Premium ({'\u20B9'})</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g. 18200"
              value={formPremium}
              onChange={(e) => setFormPremium(e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              className="form-input"
              type="date"
              value={formStart}
              onChange={(e) => setFormStart(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              className="form-input"
              type="date"
              value={formEnd}
              onChange={(e) => setFormEnd(e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Agent Name</label>
            <input
              className="form-input"
              placeholder="e.g. Hemant Joshi"
              value={formAgent}
              onChange={(e) => setFormAgent(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Agent Phone</label>
            <input
              className="form-input"
              placeholder="e.g. 98250 34504"
              value={formAgentPhone}
              onChange={(e) => setFormAgentPhone(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
