'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/lib/session-context';
import Modal from '@/components/Modal';

/* ──────────────── Types ──────────────── */
interface Contact {
  id: string;
  name: string;
  phone: string;
  category: string;
  company: string;
  address: string;
  is_staff: boolean;
}

const CAT_BADGE: Record<string, string> = {
  Staff: 'badge-primary',
  'RTO Agent': 'badge-accent',
  Insurance: 'badge-success',
  Mechanic: 'badge-info',
  Towing: 'badge-error',
  'Spare Parts': 'badge-primary',
  Other: 'badge-warning',
};

const CONTACT_CATEGORIES = ['Staff', 'RTO Agent', 'Insurance', 'Mechanic', 'Towing', 'Spare Parts', 'Other'];

/* ─── Action Menu Component ─── */
function ActionMenu({
  isStaff,
  onEdit,
  onDelete,
}: {
  isStaff: boolean;
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
        {isStaff && (
          <button onClick={() => setOpen(false)}>&#128065; View</button>
        )}
        <button
          onClick={() => {
            onEdit();
            setOpen(false);
          }}
        >
          &#9998; Edit
        </button>
        {!isStaff && (
          <button
            className="danger"
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
          >
            &#128465; Delete
          </button>
        )}
      </div>
    </div>
  );
}

/* ──────────────── Page ──────────────── */
export default function DirectoryPage() {
  const { tenant } = useSession();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [saving, setSaving] = useState(false);

  /* Form fields */
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formAddress, setFormAddress] = useState('');

  /* Fetch */
  async function fetchContacts() {
    if (!tenant) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/directory?tenant_id=${tenant.id}`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.id]);

  /* Category counts */
  function categoryCount(cat: string) {
    if (cat === 'all') return contacts.length;
    return contacts.filter((c) => c.category === cat).length;
  }

  const categories = ['all', ...Array.from(new Set(contacts.map((c) => c.category).filter(Boolean)))];

  /* Filtered list */
  const filtered = contacts.filter((c) => {
    if (catFilter !== 'all' && c.category !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.category || '').toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  /* Reset form */
  function resetForm() {
    setFormName('');
    setFormPhone('');
    setFormCategory('');
    setFormCompany('');
    setFormAddress('');
    setEditingContact(null);
  }

  /* Open for Add */
  function openAdd() {
    resetForm();
    setModalOpen(true);
  }

  /* Open for Edit */
  function openEdit(c: Contact) {
    setEditingContact(c);
    setFormName(c.name || '');
    setFormPhone(c.phone || '');
    setFormCategory(c.category || '');
    setFormCompany(c.company || '');
    setFormAddress(c.address || '');
    setModalOpen(true);
  }

  /* Save */
  async function handleSave() {
    if (!tenant || !formName.trim()) return;
    setSaving(true);
    try {
      const payload = {
        tenant_id: tenant.id,
        name: formName.trim(),
        phone: formPhone.trim(),
        category: formCategory,
        company: formCompany.trim(),
        address: formAddress.trim(),
        is_staff: false,
      };

      if (editingContact) {
        await fetch(`/api/directory/${editingContact.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/directory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      setModalOpen(false);
      resetForm();
      fetchContacts();
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  /* Delete */
  async function handleDelete(id: string) {
    if (!confirm('Delete this contact?')) return;
    await fetch(`/api/directory/${id}`, { method: 'DELETE' });
    fetchContacts();
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3>Phone Directory</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              className="form-input"
              type="text"
              placeholder="Search contacts..."
              style={{ width: 220, height: 38 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" onClick={openAdd}>
              + Add Contact
            </button>
          </div>
        </div>
        <div className="card-body">
          {/* Tab Pill Filters */}
          <div className="tab-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`tab-pill${catFilter === cat ? ' active' : ''}`}
                onClick={() => setCatFilter(cat)}
              >
                {cat === 'all' ? 'All' : cat} ({categoryCount(cat)})
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>
              Loading contacts...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>
              {contacts.length === 0
                ? 'No contacts yet. Click "+ Add Contact" to create one.'
                : 'No contacts match your search.'}
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Category</th>
                    <th>Company / Bus</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, idx) => (
                    <tr key={c.id}>
                      <td>{idx + 1}</td>
                      <td>
                        {c.is_staff ? (
                          <a className="clickable-link">{c.name}</a>
                        ) : (
                          c.name
                        )}
                      </td>
                      <td>
                        {c.phone ? (
                          <a
                            href={`tel:+91${c.phone.replace(/\s/g, '')}`}
                            style={{ color: 'var(--success)', fontWeight: 500 }}
                          >
                            {c.phone}
                          </a>
                        ) : (
                          '\u2014'
                        )}
                      </td>
                      <td>
                        <span className={`badge ${CAT_BADGE[c.category] || 'badge-info'}`}>
                          {c.category || '\u2014'}
                        </span>
                      </td>
                      <td>{c.company || '\u2014'}</td>
                      <td>{c.address || '\u2014'}</td>
                      <td>
                        <ActionMenu
                          isStaff={c.is_staff}
                          onEdit={() => openEdit(c)}
                          onDelete={() => handleDelete(c.id)}
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
        title={editingContact ? 'Edit Contact' : 'Add New Contact'}
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
              {saving ? 'Saving...' : editingContact ? 'Update Contact' : 'Save Contact'}
            </button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              className="form-input"
              placeholder="e.g. Rajesh Sharma"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              className="form-input"
              placeholder="e.g. 98250 34501"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {CONTACT_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Company / Bus</label>
            <input
              className="form-input"
              placeholder="e.g. Sharma Auto Works"
              value={formCompany}
              onChange={(e) => setFormCompany(e.target.value)}
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
