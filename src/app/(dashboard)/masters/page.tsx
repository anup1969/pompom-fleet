'use client';

import { useState, useCallback } from 'react';

/* ═══════════════════════════════════════════════════
   Tab definitions & demo data
   ═══════════════════════════════════════════════════ */

type TabKey = 'expense-heads' | 'vehicle-makes' | 'staff-roles' | 'vendor-categories' | 'attendance-rules';

interface NameItem {
  id: number;
  name: string;
}

interface RuleItem {
  id: number;
  key: string;
  value: string;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'expense-heads', label: 'Expense Heads' },
  { key: 'vehicle-makes', label: 'Vehicle Makes' },
  { key: 'staff-roles', label: 'Staff Roles' },
  { key: 'vendor-categories', label: 'Vendor Categories' },
  { key: 'attendance-rules', label: 'Attendance Rules' },
];

const INITIAL_EXPENSE_HEADS: NameItem[] = [
  { id: 1, name: 'Diesel' },
  { id: 2, name: 'Repairs' },
  { id: 3, name: 'Tyres' },
  { id: 4, name: 'Insurance' },
  { id: 5, name: 'Salary' },
  { id: 6, name: 'Washing' },
  { id: 7, name: 'Misc' },
];

const INITIAL_VEHICLE_MAKES: NameItem[] = [
  { id: 1, name: 'Tata' },
  { id: 2, name: 'Force' },
  { id: 3, name: 'Eicher' },
  { id: 4, name: 'Ashok Leyland' },
  { id: 5, name: 'BharatBenz' },
  { id: 6, name: 'Mahindra' },
];

const INITIAL_STAFF_ROLES: NameItem[] = [
  { id: 1, name: 'Driver' },
  { id: 2, name: 'Assistant' },
  { id: 3, name: 'Lady Attendant' },
  { id: 4, name: 'Supervisor' },
];

const INITIAL_VENDOR_CATEGORIES: NameItem[] = [
  { id: 1, name: 'Fuel Station' },
  { id: 2, name: 'Mechanic' },
  { id: 3, name: 'Towing' },
  { id: 4, name: 'Spare Parts' },
  { id: 5, name: 'Body Work' },
  { id: 6, name: 'Electrical' },
  { id: 7, name: 'Insurance Agent' },
];

const INITIAL_ATTENDANCE_RULES: RuleItem[] = [
  { id: 1, key: 'Max CL per month', value: '2' },
  { id: 2, key: 'HD counts as', value: '0.5' },
  { id: 3, key: 'Week off day', value: 'Sunday' },
  { id: 4, key: 'Late mark threshold', value: '15 min' },
];

/* ═══════════════════════════════════════════════════
   Inline-editable Name table
   ═══════════════════════════════════════════════════ */

function NameTable({
  items,
  onUpdate,
  onDelete,
  onAdd,
}: {
  items: NameItem[];
  onUpdate: (id: number, name: string) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
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
                        <button className="btn btn-outline btn-sm" style={{ color: 'var(--error)', borderColor: 'var(--error)' }} onClick={() => onDelete(item.id)}>
                          &#128465; Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', color: 'var(--bodytext)', padding: 24 }}>
                    No items yet. Click &quot;+ Add&quot; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   Inline-editable Rule (Key-Value) table
   ═══════════════════════════════════════════════════ */

function RuleTable({
  items,
  onUpdate,
  onDelete,
  onAdd,
}: {
  items: RuleItem[];
  onUpdate: (id: number, key: string, value: string) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editKey, setEditKey] = useState('');
  const [editValue, setEditValue] = useState('');

  function startEdit(item: RuleItem) {
    setEditingId(item.id);
    setEditKey(item.key);
    setEditValue(item.value);
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
                      item.key
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
                      <span style={{ fontWeight: 600 }}>{item.value}</span>
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
                        <button className="btn btn-outline btn-sm" style={{ color: 'var(--error)', borderColor: 'var(--error)' }} onClick={() => onDelete(item.id)}>
                          &#128465; Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--bodytext)', padding: 24 }}>
                    No rules yet. Click &quot;+ Add Rule&quot; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   Masters Page
   ═══════════════════════════════════════════════════ */

export default function MastersPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('expense-heads');

  /* ── State for each tab ── */
  const [expenseHeads, setExpenseHeads] = useState<NameItem[]>(INITIAL_EXPENSE_HEADS);
  const [vehicleMakes, setVehicleMakes] = useState<NameItem[]>(INITIAL_VEHICLE_MAKES);
  const [staffRoles, setStaffRoles] = useState<NameItem[]>(INITIAL_STAFF_ROLES);
  const [vendorCategories, setVendorCategories] = useState<NameItem[]>(INITIAL_VENDOR_CATEGORIES);
  const [attendanceRules, setAttendanceRules] = useState<RuleItem[]>(INITIAL_ATTENDANCE_RULES);

  /* ── Generic helpers for NameItem lists ── */
  const makeNameHandlers = useCallback(
    (items: NameItem[], setItems: React.Dispatch<React.SetStateAction<NameItem[]>>) => ({
      onUpdate: (id: number, name: string) =>
        setItems(items.map((i) => (i.id === id ? { ...i, name } : i))),
      onDelete: (id: number) => setItems(items.filter((i) => i.id !== id)),
      onAdd: () =>
        setItems([...items, { id: Date.now(), name: 'New Item' }]),
    }),
    [],
  );

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
              {...makeNameHandlers(expenseHeads, setExpenseHeads)}
            />
          )}

          {activeTab === 'vehicle-makes' && (
            <NameTable
              items={vehicleMakes}
              {...makeNameHandlers(vehicleMakes, setVehicleMakes)}
            />
          )}

          {activeTab === 'staff-roles' && (
            <NameTable
              items={staffRoles}
              {...makeNameHandlers(staffRoles, setStaffRoles)}
            />
          )}

          {activeTab === 'vendor-categories' && (
            <NameTable
              items={vendorCategories}
              {...makeNameHandlers(vendorCategories, setVendorCategories)}
            />
          )}

          {activeTab === 'attendance-rules' && (
            <RuleTable
              items={attendanceRules}
              onUpdate={(id, key, value) =>
                setAttendanceRules(attendanceRules.map((r) => (r.id === id ? { ...r, key, value } : r)))
              }
              onDelete={(id) => setAttendanceRules(attendanceRules.filter((r) => r.id !== id))}
              onAdd={() =>
                setAttendanceRules([...attendanceRules, { id: Date.now(), key: 'New Rule', value: '' }])
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
