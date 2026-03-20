'use client';

import { useState } from 'react';

/* ──────────────── Demo Data ──────────────── */
interface Contact {
  id: number;
  name: string;
  phone: string;
  phoneRaw: string;
  category: string;
  catBadge: string;
  company: string;
  address: string;
  isStaff: boolean;
}

const DEMO_CONTACTS: Contact[] = [
  { id: 1, name: 'Ramesh Solanki', phone: '98250 12001', phoneRaw: '9825012001', category: 'Staff', catBadge: 'badge-primary', company: 'Driver \u2014 Bus #1', address: 'Isanpur, Ahmedabad', isStaff: true },
  { id: 2, name: 'Mukesh Khatri', phone: '98250 12002', phoneRaw: '9825012002', category: 'Staff', catBadge: 'badge-primary', company: 'Driver \u2014 Bus #2', address: 'Narol, Ahmedabad', isStaff: true },
  { id: 3, name: 'Jayesh Patel', phone: '98250 12003', phoneRaw: '9825012003', category: 'Staff', catBadge: 'badge-primary', company: 'Driver \u2014 Bus #3', address: 'Maninagar, Ahmedabad', isStaff: true },
  { id: 4, name: 'Arjun Sharma', phone: '98250 12004', phoneRaw: '9825012004', category: 'Staff', catBadge: 'badge-primary', company: 'Assistant \u2014 Bus #1', address: 'Vastral, Ahmedabad', isStaff: true },
  { id: 5, name: 'Vijay Desai', phone: '98250 12005', phoneRaw: '9825012005', category: 'Staff', catBadge: 'badge-primary', company: 'Assistant \u2014 Bus #3', address: 'Odhav, Ahmedabad', isStaff: true },
  { id: 6, name: 'Savita Mehta', phone: '98250 12006', phoneRaw: '9825012006', category: 'Staff', catBadge: 'badge-primary', company: 'Lady Attendant \u2014 Bus #1', address: 'Isanpur, Ahmedabad', isStaff: true },
  { id: 7, name: 'Kavita Joshi', phone: '98250 12007', phoneRaw: '9825012007', category: 'Staff', catBadge: 'badge-primary', company: 'Lady Attendant \u2014 Bus #2', address: 'Vastral, Ahmedabad', isStaff: true },
  { id: 8, name: 'Suresh Mehta', phone: '98250 34505', phoneRaw: '9825034505', category: 'RTO Agent', catBadge: 'badge-accent', company: 'Mehta Consultancy', address: 'Subhash Bridge, Ahmedabad', isStaff: false },
  { id: 9, name: 'Dinesh Vora', phone: '98250 34510', phoneRaw: '9825034510', category: 'RTO Agent', catBadge: 'badge-accent', company: 'Vora RTO Services', address: 'Ashram Road, Ahmedabad', isStaff: false },
  { id: 10, name: 'Hemant Joshi', phone: '98250 34504', phoneRaw: '9825034504', category: 'Insurance', catBadge: 'badge-success', company: 'New India Assurance Co.', address: 'Navrangpura, Ahmedabad', isStaff: false },
  { id: 11, name: 'Rajesh Sharma', phone: '98250 34501', phoneRaw: '9825034501', category: 'Mechanic', catBadge: 'badge-info', company: 'Sharma Auto Works', address: 'Nr. Isanpur Cross Rd, Ahmedabad', isStaff: false },
  { id: 12, name: 'Kamlesh Rathod', phone: '98250 34511', phoneRaw: '9825034511', category: 'Mechanic', catBadge: 'badge-info', company: 'Rathod Diesel Garage', address: 'Narol Industrial Area, Ahmedabad', isStaff: false },
  { id: 13, name: 'Bharat Gohil', phone: '98250 34506', phoneRaw: '9825034506', category: 'Towing', catBadge: 'badge-error', company: 'City Towing Pvt Ltd', address: 'Paldi, Ahmedabad', isStaff: false },
  { id: 14, name: 'Nilesh Patel', phone: '98250 34503', phoneRaw: '9825034503', category: 'Spare Parts', catBadge: 'badge-primary', company: 'Patel Tyre House', address: 'Narol Circle, Ahmedabad', isStaff: false },
  { id: 15, name: 'Vikas Trivedi', phone: '98250 34512', phoneRaw: '9825034512', category: 'Other', catBadge: 'badge-warning', company: 'Trivedi Electricals', address: 'Maninagar, Ahmedabad', isStaff: false },
];

const CATEGORY_TABS = [
  { key: 'all', label: 'All (15)' },
  { key: 'Staff', label: 'Staff (7)' },
  { key: 'RTO Agent', label: 'RTO Agent (2)' },
  { key: 'Insurance', label: 'Insurance (1)' },
  { key: 'Mechanic', label: 'Mechanic (2)' },
  { key: 'Towing', label: 'Towing (1)' },
  { key: 'Spare Parts', label: 'Spare Parts (1)' },
  { key: 'Other', label: 'Other (1)' },
];

export default function DirectoryPage() {
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const filtered = DEMO_CONTACTS.filter((c) => {
    if (catFilter !== 'all' && c.category !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
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
          <button className="btn btn-primary btn-sm">+ Add Contact</button>
        </div>
      </div>
      <div className="card-body">
        {/* Tab Pill Filters */}
        <div className="tab-pills">
          {CATEGORY_TABS.map((t) => (
            <button
              key={t.key}
              className={`tab-pill${catFilter === t.key ? ' active' : ''}`}
              onClick={() => setCatFilter(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
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
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>
                    {c.isStaff ? (
                      <a className="clickable-link">{c.name}</a>
                    ) : (
                      c.name
                    )}
                  </td>
                  <td>
                    <a href={`tel:+91${c.phoneRaw}`} style={{ color: 'var(--success)', fontWeight: 500 }}>
                      {c.phone}
                    </a>
                  </td>
                  <td>
                    <span className={`badge ${c.catBadge}`}>{c.category}</span>
                  </td>
                  <td>{c.company}</td>
                  <td>{c.address}</td>
                  <td>
                    <div className="action-wrap">
                      <button
                        className="btn-icon"
                        onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}
                      >
                        &#8942;
                      </button>
                      <div className={`action-menu${openMenu === c.id ? ' show' : ''}`}>
                        {c.isStaff && (
                          <button onClick={() => setOpenMenu(null)}>{'\uD83D\uDC41'} View</button>
                        )}
                        <button onClick={() => setOpenMenu(null)}>&#9998; Edit</button>
                        {!c.isStaff && (
                          <button className="danger" onClick={() => setOpenMenu(null)}>
                            {'\uD83D\uDDD1'} Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
