'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/session-context';

/* ═══════════════════════════════════════════════════
   Tab definitions & types
   ═══════════════════════════════════════════════════ */

type TabKey = 'expense-heads' | 'vehicle-makes' | 'staff-roles' | 'vendor-categories' | 'attendance-rules';

interface NameItem {
  id: string;
  name: string;
}

interface RuleItem {
  id: string;
  rule_key: string;
  rule_value: string;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'expense-heads', label: 'Expense Heads' },
  { key: 'vehicle-makes', label: 'Vehicle Makes' },
  { key: 'staff-roles', label: 'Staff Roles' },
  { key: 'vendor-categories', label: 'Vendor Categories' },
  { key: 'attendance-rules', label: 'Attendance Rules' },
];

const TAB_ENDPOINTS: Record<TabKey, string> = {
  'expense-heads': '/api/expense-heads',
  'vehicle-makes': '/api/masters/vehicle-makes',
  'staff-roles': '/api/masters/staff-roles',
  'vendor-categories': '/api/masters/vendor-categories',
  'attendance-rules': '/api/masters/attendance-rules',
};

/* ═══════════════════════════════════════════════════
   Inline-editable Name table
   ═══════════════════════════════════════════════════ */

function NameTable({
  items,
  loading,
  onUpdate,
  onDelete,
  onAdd,
}: {
  items: NameItem[];
  loading: boolean;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  function startEdit(item: NameItem) {
    setEditingId(item.id);
    setEditValue(item.name);
  }

  function saveEdit() {
    if (editingId !== null && editValue.trim()) {
      onUpdate(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue('');
  }

  return (
    <>
      <div className="card-header">
        <h3>Items</h3>
        <button className="btn btn-primary btn-sm" onClick={onAdd}>
          + Add
        </button>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--bodytext)' }}>
            Loading...
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>Name</th>
                  <th style={{ width: 160 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          className="form-input"
                          style={{ height: 34, fontSize: 13 }}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          autoFocus
                        />
                      ) : (
                        item.name
                      )}
                    </td>
                    <td>
                      {editingId === item.id ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-success btn-sm" onClick={saveEdit}>
                            Save
                          </button>
                          <button className="btn btn-outline btn-sm" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => startEdit(item)}>
                            &#9998; Edit
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                            onClick={() => onDelete(item.id)}
                          >
                            &#128465; Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--bodytext)', padding: 24 }}>
                      No items yet. Click &quot;+ Add&quot; to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   Inline-editable Rule (Key-Value) table
   ═══════════════════════════════════════════════════ */

function RuleTable({
  items,
  loading,
  onUpdate,
  onDelete,
  onAdd,
}: {
  items: RuleItem[];
  loading: boolean;
  onUpdate: (id: string, key: string, value: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKey, setEditKey] = useState('');
  const [editValue, setEditValue] = useState('');

  function startEdit(item: RuleItem) {
    setEditingId(item.id);
    setEditKey(item.rule_key);
    setEditValue(item.rule_value);
  }

  function saveEdit() {
    if (editingId !== null && editKey.trim() && editValue.trim()) {
      onUpdate(editingId, editKey.trim(), editValue.trim());
    }
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  return (
    <>
      <div className="card-header">
        <h3>Rules</h3>
        <button className="btn btn-primary btn-sm" onClick={onAdd}>
          + Add Rule
        </button>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--bodytext)' }}>
            Loading...
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>Key</th>
                  <th>Value</th>
                  <th style={{ width: 160 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          className="form-input"
                          style={{ height: 34, fontSize: 13 }}
                          value={editKey}
                          onChange={(e) => setEditKey(e.target.value)}
                          autoFocus
                        />
                      ) : (
                        item.rule_key
                      )}
                    </td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          className="form-input"
                          style={{ height: 34, fontSize: 13 }}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                      ) : (
                        <span style={{ fontWeight: 600 }}>{item.rule_value}</span>
                      )}
                    </td>
                    <td>
                      {editingId === item.id ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-success btn-sm" onClick={saveEdit}>
                            Save
                          </button>
                          <button className="btn btn-outline btn-sm" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => startEdit(item)}>
                            &#9998; Edit
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                            onClick={() => onDelete(item.id)}
                          >
                            &#128465; Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--bodytext)', padding: 24 }}>
                      No rules yet. Click &quot;+ Add Rule&quot; to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   Masters Page
   ═══════════════════════════════════════════════════ */

export default function MastersPage() {
  const { tenant } = useSession();
  const [activeTab, setActiveTab] = useState<TabKey>('expense-heads');

  /* ── State for each tab ── */
  const [expenseHeads, setExpenseHeads] = useState<NameItem[]>([]);
  const [vehicleMakes, setVehicleMakes] = useState<NameItem[]>([]);
  const [staffRoles, setStaffRoles] = useState<NameItem[]>([]);
  const [vendorCategories, setVendorCategories] = useState<NameItem[]>([]);
  const [attendanceRules, setAttendanceRules] = useState<RuleItem[]>([]);

  /* ── Loading per tab ── */
  const [loadingMap, setLoadingMap] = useState<Record<TabKey, boolean>>({
    'expense-heads': true,
    'vehicle-makes': true,
    'staff-roles': true,
    'vendor-categories': true,
    'attendance-rules': true,
  });

  /* ── Generic fetch for name-based masters ── */
  const fetchNameList = useCallback(
    async (tabKey: TabKey, setter: React.Dispatch<React.SetStateAction<NameItem[]>>) => {
      if (!tenant) return;
      setLoadingMap((prev) => ({ ...prev, [tabKey]: true }));
      try {
        const res = await fetch(`${TAB_ENDPOINTS[tabKey]}?tenant_id=${tenant.id}`);
        if (res.ok) {
          const data = await res.json();
          setter(data);
        }
      } catch {
        /* ignore */
      } finally {
        setLoadingMap((prev) => ({ ...prev, [tabKey]: false }));
      }
    },
    [tenant],
  );

  /* ── Fetch attendance rules ── */
  const fetchRules = useCallback(async () => {
    if (!tenant) return;
    setLoadingMap((prev) => ({ ...prev, 'attendance-rules': true }));
    try {
      const res = await fetch(`${TAB_ENDPOINTS['attendance-rules']}?tenant_id=${tenant.id}`);
      if (res.ok) {
        const data = await res.json();
        setAttendanceRules(data);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingMap((prev) => ({ ...prev, 'attendance-rules': false }));
    }
  }, [tenant]);

  /* Initial fetch for all tabs */
  useEffect(() => {
    if (!tenant) return;
    fetchNameList('expense-heads', setExpenseHeads);
    fetchNameList('vehicle-makes', setVehicleMakes);
    fetchNameList('staff-roles', setStaffRoles);
    fetchNameList('vendor-categories', setVendorCategories);
    fetchRules();
  }, [tenant, fetchNameList, fetchRules]);

  /* ── CRUD helpers for name items ── */
  function makeNameHandlers(
    tabKey: TabKey,
    setter: React.Dispatch<React.SetStateAction<NameItem[]>>,
  ) {
    const endpoint = TAB_ENDPOINTS[tabKey];

    return {
      onUpdate: async (id: string, name: string) => {
        // For expense-heads, use [id] route; for masters/*, use DELETE+POST pattern or PUT
        // The expense-heads has a [id]/route.ts with PUT. Masters use the collection route.
        // Let's check: expense-heads has [id]/route.ts, the masters routes have DELETE on collection.
        // For expense-heads: PUT /api/expense-heads/[id]
        // For masters/*: no [id] route, so we do delete + re-create.
        if (tabKey === 'expense-heads') {
          await fetch(`${endpoint}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
          });
        } else {
          // Delete old, create new
          await fetch(`${endpoint}?id=${id}`, { method: 'DELETE' });
          await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenant_id: tenant!.id, name }),
          });
        }
        fetchNameList(tabKey, setter);
      },
      onDelete: async (id: string) => {
        if (!confirm('Delete this item?')) return;
        if (tabKey === 'expense-heads') {
          await fetch(`${endpoint}/${id}`, { method: 'DELETE' });
        } else {
          await fetch(`${endpoint}?id=${id}`, { method: 'DELETE' });
        }
        fetchNameList(tabKey, setter);
      },
      onAdd: async () => {
        const name = prompt('Enter name:');
        if (!name || !name.trim() || !tenant) return;
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenant_id: tenant.id, name: name.trim() }),
        });
        fetchNameList(tabKey, setter);
      },
    };
  }

  /* ── CRUD helpers for attendance rules ── */
  const ruleHandlers = {
    onUpdate: async (id: string, key: string, value: string) => {
      if (!tenant) return;
      const endpoint = TAB_ENDPOINTS['attendance-rules'];
      // Delete old, upsert new
      await fetch(`${endpoint}?id=${id}`, { method: 'DELETE' });
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenant.id, rule_key: key, rule_value: value }),
      });
      fetchRules();
    },
    onDelete: async (id: string) => {
      if (!confirm('Delete this rule?')) return;
      const endpoint = TAB_ENDPOINTS['attendance-rules'];
      await fetch(`${endpoint}?id=${id}`, { method: 'DELETE' });
      fetchRules();
    },
    onAdd: async () => {
      if (!tenant) return;
      const key = prompt('Rule key:');
      if (!key || !key.trim()) return;
      const value = prompt('Rule value:');
      if (!value || !value.trim()) return;
      const endpoint = TAB_ENDPOINTS['attendance-rules'];
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenant.id, rule_key: key.trim(), rule_value: value.trim() }),
      });
      fetchRules();
    },
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Masters &mdash; Reference Data</h3>
      </div>
      <div className="card-body">
        {/* Sub-tabs */}
        <div className="tab-pills">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`tab-pill${activeTab === t.key ? ' active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--border)' }}>
          {activeTab === 'expense-heads' && (
            <NameTable
              items={expenseHeads}
              loading={loadingMap['expense-heads']}
              {...makeNameHandlers('expense-heads', setExpenseHeads)}
            />
          )}

          {activeTab === 'vehicle-makes' && (
            <NameTable
              items={vehicleMakes}
              loading={loadingMap['vehicle-makes']}
              {...makeNameHandlers('vehicle-makes', setVehicleMakes)}
            />
          )}

          {activeTab === 'staff-roles' && (
            <NameTable
              items={staffRoles}
              loading={loadingMap['staff-roles']}
              {...makeNameHandlers('staff-roles', setStaffRoles)}
            />
          )}

          {activeTab === 'vendor-categories' && (
            <NameTable
              items={vendorCategories}
              loading={loadingMap['vendor-categories']}
              {...makeNameHandlers('vendor-categories', setVendorCategories)}
            />
          )}

          {activeTab === 'attendance-rules' && (
            <RuleTable
              items={attendanceRules}
              loading={loadingMap['attendance-rules']}
              {...ruleHandlers}
            />
          )}
        </div>
      </div>
    </div>
  );
}
