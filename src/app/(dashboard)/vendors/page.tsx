'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/lib/session-context';
import Modal from '@/components/Modal';

/* ──────────────── Types ──────────────── */
interface Vendor {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  type: string;
  company: string;
  gst_no: string;
  address: string;
}

const TYPE_BADGE: Record<string, string> = {
  Mechanic: 'badge-info',
  'Fuel Station': 'badge-warning',
  'Parts Dealer': 'badge-primary',
  'Insurance Agent': 'badge-success',
  'RTO Agent': 'badge-accent',
  Towing: 'badge-error',
  'Body Work': 'badge-primary',
  Electrical: 'badge-warning',
  Other: 'badge-info',
};

const VENDOR_TYPES = [
  'Mechanic',
  'Fuel Station',
  'Parts Dealer',
  'Insurance Agent',
  'RTO Agent',
  'Towing',
  'Body Work',
  'Electrical',
  'Other',
];

/* ─── Action Menu Component ─── */
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
  );
}

/* ──────────────── Page ──────────────── */
export default function VendorsPage() {
  const { tenant } = useSession();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [saving, setSaving] = useState(false);

  /* Form fields */
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formType, setFormType] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formGst, setFormGst] = useState('');
  const [formAddress, setFormAddress] = useState('');

  /* Fetch */
  async function fetchVendors() {
    if (!tenant) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/vendors?tenant_id=${tenant.id}`);
      if (res.ok) {
        const data = await res.json();
        setVendors(data);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.id]);

  /* Reset form */
  function resetForm() {
    setFormName('');
    setFormContact('');
    setFormPhone('');
    setFormType('');
    setFormCompany('');
    setFormGst('');
    setFormAddress('');
    setEditingVendor(null);
  }

  /* Open for Add */
  function openAdd() {
    resetForm();
    setModalOpen(true);
  }

  /* Open for Edit */
  function openEdit(v: Vendor) {
    setEditingVendor(v);
    setFormName(v.name || '');
    setFormContact(v.contact_person || '');
    setFormPhone(v.phone || '');
    setFormType(v.type || '');
    setFormCompany(v.company || '');
    setFormGst(v.gst_no || '');
    setFormAddress(v.address || '');
    setModalOpen(true);
  }

  /* Save (Add or Edit) */
  async function handleSave() {
    if (!tenant || !formName.trim()) return;
    setSaving(true);
    try {
      const payload = {
        tenant_id: tenant.id,
        name: formName.trim(),
        contact_person: formContact.trim(),
        phone: formPhone.trim(),
        type: formType,
        company: formCompany.trim(),
        gst_no: formGst.trim(),
        address: formAddress.trim(),
      };

      if (editingVendor) {
        await fetch(`/api/vendors/${editingVendor.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/vendors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      setModalOpen(false);
      resetForm();
      fetchVendors();
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  /* Delete (soft) */
  async function handleDelete(id: string) {
    if (!confirm('Delete this vendor?')) return;
    await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
    fetchVendors();
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3>Vendor Directory</h3>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            + Add Vendor
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>
              Loading vendors...
            </div>
          ) : vendors.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>
              No vendors yet. Click &quot;+ Add Vendor&quot; to create one.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Vendor Name</th>
                    <th>Contact Person</th>
                    <th>Phone</th>
                    <th>Type</th>
                    <th>Company</th>
                    <th>GST No</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v, idx) => (
                    <tr key={v.id}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{v.name}</td>
                      <td>{v.contact_person}</td>
                      <td>
                        {v.phone ? (
                          <a
                            href={`tel:+91${v.phone.replace(/\s/g, '')}`}
                            style={{ color: 'var(--success)', fontWeight: 500 }}
                          >
                            {v.phone}
                          </a>
                        ) : (
                          '\u2014'
                        )}
                      </td>
                      <td>
                        <span className={`badge ${TYPE_BADGE[v.type] || 'badge-info'}`}>
                          {v.type || '\u2014'}
                        </span>
                      </td>
                      <td>{v.company || '\u2014'}</td>
                      <td>{v.gst_no || '\u2014'}</td>
                      <td>{v.address || '\u2014'}</td>
                      <td>
                        <ActionMenu
                          onEdit={() => openEdit(v)}
                          onDelete={() => handleDelete(v.id)}
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
        title={editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
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
              {saving ? 'Saving...' : editingVendor ? 'Update Vendor' : 'Save Vendor'}
            </button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Vendor Name *</label>
            <input
              className="form-input"
              placeholder="e.g. Sharma Auto Works"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Person</label>
            <input
              className="form-input"
              placeholder="e.g. Rajesh Sharma"
              value={formContact}
              onChange={(e) => setFormContact(e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              className="form-input"
              placeholder="e.g. 98250 34501"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
            >
              <option value="">Select Type</option>
              {VENDOR_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Company</label>
            <input
              className="form-input"
              placeholder="e.g. Sharma Auto Works Pvt Ltd"
              value={formCompany}
              onChange={(e) => setFormCompany(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">GST No</label>
            <input
              className="form-input"
              placeholder="e.g. 24AABCS1234F1Z5"
              value={formGst}
              onChange={(e) => setFormGst(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <textarea
            className="form-input"
            placeholder="Full address..."
            value={formAddress}
            onChange={(e) => setFormAddress(e.target.value)}
            rows={2}
          />
        </div>
      </Modal>
    </>
  );
}
