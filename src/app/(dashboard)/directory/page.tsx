'use client';

import { useState } from 'react';

/* ──────────────── Types ──────────────── */
type Category = 'All' | 'Drivers' | 'Assistants' | 'Lady Attendants' | 'Emergency' | 'Vendors';

interface Contact {
  id: string;
  name: string;
  phone: string;
  category: Exclude<Category, 'All'>;
  designation: string;
  notes: string;
}

/* ──────────────── Demo Data ──────────────── */
const DEMO_CONTACTS: Contact[] = [
  // Staff — same 6 staff referenced across the app
  {
    id: '1',
    name: 'Ramesh Patel',
    phone: '+91 98765 43210',
    category: 'Drivers',
    designation: 'Senior Driver',
    notes: 'Bus GJ-01-AB-1234. 8+ years experience.',
  },
  {
    id: '2',
    name: 'Suresh Sharma',
    phone: '+91 98765 43211',
    category: 'Drivers',
    designation: 'Driver',
    notes: 'Bus GJ-01-CD-5678. Handles highway routes.',
  },
  {
    id: '3',
    name: 'Vikram Singh',
    phone: '+91 98765 43212',
    category: 'Drivers',
    designation: 'Driver',
    notes: 'Bus GJ-01-EF-9012. Available for extra trips.',
  },
  {
    id: '4',
    name: 'Manoj Joshi',
    phone: '+91 98765 43213',
    category: 'Assistants',
    designation: 'Bus Assistant',
    notes: 'Assigned to Bus GJ-01-GH-3456.',
  },
  {
    id: '5',
    name: 'Dinesh Kumar',
    phone: '+91 98765 43214',
    category: 'Assistants',
    designation: 'Bus Assistant',
    notes: 'Assigned to Bus GJ-01-IJ-7890.',
  },
  {
    id: '6',
    name: 'Sunita Devi',
    phone: '+91 98765 43215',
    category: 'Lady Attendants',
    designation: 'Lady Attendant',
    notes: 'Assigned to Bus GJ-01-KL-2345. Handles KG students.',
  },
  {
    id: '7',
    name: 'Kavita Rani',
    phone: '+91 98765 43216',
    category: 'Lady Attendants',
    designation: 'Lady Attendant',
    notes: 'Assigned to Bus GJ-01-AB-1234. Morning shift.',
  },
  // Emergency
  {
    id: '8',
    name: 'RTO Helpline',
    phone: '1800-233-0600',
    category: 'Emergency',
    designation: 'Government',
    notes: 'Regional Transport Office — toll free.',
  },
  {
    id: '9',
    name: 'Police Control Room',
    phone: '100',
    category: 'Emergency',
    designation: 'Government',
    notes: 'For accidents or law enforcement.',
  },
  {
    id: '10',
    name: 'Fire Brigade',
    phone: '101',
    category: 'Emergency',
    designation: 'Government',
    notes: 'Fire and rescue services.',
  },
  {
    id: '11',
    name: 'Ambulance',
    phone: '108',
    category: 'Emergency',
    designation: 'Medical',
    notes: 'GVK EMRI — emergency medical response.',
  },
  {
    id: '12',
    name: 'Insurance Helpline (ICICI)',
    phone: '1800-266-7780',
    category: 'Emergency',
    designation: 'Insurance',
    notes: 'ICICI Lombard 24x7 claims helpline.',
  },
  // Vendors
  {
    id: '13',
    name: 'AutoFix Garage',
    phone: '+91 79123 45678',
    category: 'Vendors',
    designation: 'Mechanic / Garage',
    notes: 'Primary service center. Tata & Ashok Leyland specialist.',
  },
  {
    id: '14',
    name: 'SpeedTyre Solutions',
    phone: '+91 79123 45679',
    category: 'Vendors',
    designation: 'Tyre Dealer',
    notes: 'Apollo & MRF tyres. Bulk discount available.',
  },
  {
    id: '15',
    name: 'GreenFuel Diesel Supply',
    phone: '+91 79123 45680',
    category: 'Vendors',
    designation: 'Fuel Supplier',
    notes: 'Bulk diesel delivery. Monthly billing.',
  },
  {
    id: '16',
    name: 'SafeDrive Insurance Broker',
    phone: '+91 79123 45681',
    category: 'Vendors',
    designation: 'Insurance Broker',
    notes: 'Handles all fleet insurance renewals.',
  },
];

const CATEGORIES: Category[] = ['All', 'Drivers', 'Assistants', 'Lady Attendants', 'Emergency', 'Vendors'];

/* ──────────────── Page ──────────────── */
export default function PhoneDirectoryPage() {
  const [activeTab, setActiveTab] = useState<Category>('All');
  const [search, setSearch] = useState('');

  const filtered = DEMO_CONTACTS.filter((c) => {
    const matchesTab = activeTab === 'All' || c.category === activeTab;
    const matchesSearch =
      search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.designation.toLowerCase().includes(search.toLowerCase()) ||
      c.notes.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Phone Directory</h1>
          <p className="text-sm text-bodytext mt-1">
            {DEMO_CONTACTS.length} contacts &middot; Quick-access directory for all transport-related numbers
          </p>
        </div>
      </div>

      {/* Card wrapper */}
      <div className="bg-white rounded-xl shadow-card border border-border">
        {/* Toolbar: Search + Tabs */}
        <div className="px-5 pt-5 pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full lg:w-80">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-bodytext"
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search name, phone, designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-[10px] bg-lightgray focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-dark placeholder:text-bodytext"
            />
          </div>

          {/* Pill Tabs */}
          <div className="pill-tabs flex-shrink-0 overflow-x-auto">
            {CATEGORIES.map((cat) => {
              const count =
                cat === 'All'
                  ? DEMO_CONTACTS.length
                  : DEMO_CONTACTS.filter((c) => c.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`pill-tab whitespace-nowrap ${activeTab === cat ? 'active' : ''}`}
                >
                  {cat}
                  <span className="ml-1.5 text-[11px] opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-t border-border bg-lightgray/60">
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-bodytext">Name</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-bodytext">Phone</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-bodytext">Category</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-bodytext">Designation</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-bodytext">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-bodytext text-sm">
                    No contacts found.
                  </td>
                </tr>
              ) : (
                filtered.map((contact) => (
                  <tr
                    key={contact.id}
                    className="border-t border-border hover:bg-lightgray/40 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold text-dark">{contact.name}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <a
                        href={`tel:${contact.phone.replace(/\s/g, '')}`}
                        className="text-sm text-primary font-medium hover:underline"
                      >
                        {contact.phone}
                      </a>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`badge ${
                          contact.category === 'Drivers'
                            ? 'badge-success'
                            : contact.category === 'Assistants'
                            ? 'bg-primary/10 text-primary'
                            : contact.category === 'Lady Attendants'
                            ? 'bg-secondary/10 text-secondary'
                            : contact.category === 'Emergency'
                            ? 'badge-error'
                            : 'badge-warning'
                        }`}
                      >
                        {contact.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-dark">{contact.designation}</td>
                    <td className="px-5 py-3.5 text-sm text-bodytext max-w-xs truncate">{contact.notes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          <p className="text-xs text-bodytext">
            Showing {filtered.length} of {DEMO_CONTACTS.length} contacts
          </p>
        </div>
      </div>
    </div>
  );
}
