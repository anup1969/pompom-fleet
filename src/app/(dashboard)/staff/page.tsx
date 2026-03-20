'use client';

import { useState, useRef, useEffect } from 'react';

/* ─── Types ─── */
type StaffRole = 'driver' | 'assistant' | 'lady-attendant';

interface StaffMember {
  id: number;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  name: string;
  fatherName: string;
  role: StaffRole;
  roleLabel: string;
  roleBadge: string;
  dob: string;
  aadhar: string;
  license: string;
  licenseExpiry: string;
  licenseExpired?: boolean;
  phone: string;
  salary: string;
  status: string;
  statusBadge: string;
}

/* ─── Demo Data ─── */
const STAFF: StaffMember[] = [
  {
    id: 1, initials: 'RS', avatarBg: 'var(--lightprimary)', avatarColor: 'var(--primary)',
    name: 'Ramesh Solanki', fatherName: 'Harish Solanki', role: 'driver', roleLabel: 'Driver', roleBadge: 'badge-primary',
    dob: '15 Jun 1985', aadhar: '8834-XXXX-5501', license: 'GJ01-2019-005501',
    licenseExpiry: '17 Mar 2026', licenseExpired: true,
    phone: '98250 12001', salary: '\u20B915,000', status: 'Active', statusBadge: 'badge-success',
  },
  {
    id: 2, initials: 'MK', avatarBg: 'var(--lightsuccess)', avatarColor: 'var(--success)',
    name: 'Mukesh Khatri', fatherName: 'Dinesh Khatri', role: 'driver', roleLabel: 'Driver', roleBadge: 'badge-primary',
    dob: '22 Jan 1982', aadhar: '7721-XXXX-5502', license: 'GJ01-2020-005502',
    licenseExpiry: '14 Nov 2026',
    phone: '98250 12002', salary: '\u20B914,500', status: 'Active', statusBadge: 'badge-success',
  },
  {
    id: 3, initials: 'JP', avatarBg: 'var(--lightwarning)', avatarColor: '#b45309',
    name: 'Jayesh Patel', fatherName: 'Kantilal Patel', role: 'driver', roleLabel: 'Driver', roleBadge: 'badge-primary',
    dob: '8 Mar 1990', aadhar: '6612-XXXX-5503', license: 'GJ01-2021-005503',
    licenseExpiry: '28 Feb 2027',
    phone: '98250 12003', salary: '\u20B914,000', status: 'Active', statusBadge: 'badge-success',
  },
  {
    id: 4, initials: 'AS', avatarBg: 'var(--lightsecondary)', avatarColor: '#0e7490',
    name: 'Arjun Sharma', fatherName: 'Bhavesh Sharma', role: 'assistant', roleLabel: 'Assistant', roleBadge: 'badge-info',
    dob: '11 Sep 1995', aadhar: '5509-XXXX-5504', license: '\u2014',
    licenseExpiry: '\u2014',
    phone: '98250 12004', salary: '\u20B910,000', status: 'Active', statusBadge: 'badge-success',
  },
  {
    id: 5, initials: 'VD', avatarBg: 'var(--lighterror)', avatarColor: 'var(--error)',
    name: 'Vijay Desai', fatherName: 'Prakash Desai', role: 'assistant', roleLabel: 'Assistant', roleBadge: 'badge-info',
    dob: '3 Jul 1992', aadhar: '4401-XXXX-5505', license: '\u2014',
    licenseExpiry: '\u2014',
    phone: '98250 12005', salary: '\u20B99,500', status: 'Active', statusBadge: 'badge-success',
  },
  {
    id: 6, initials: 'SM', avatarBg: 'var(--lightaccent)', avatarColor: '#92400e',
    name: 'Savita Mehta', fatherName: '\u2014', role: 'lady-attendant', roleLabel: 'Lady Attendant', roleBadge: 'badge-accent',
    dob: '18 Dec 1988', aadhar: '3398-XXXX-5506', license: '\u2014',
    licenseExpiry: '\u2014',
    phone: '98250 12006', salary: '\u20B98,500', status: 'Active', statusBadge: 'badge-success',
  },
  {
    id: 7, initials: 'KJ', avatarBg: 'var(--lightprimary)', avatarColor: 'var(--primary)',
    name: 'Kavita Joshi', fatherName: '\u2014', role: 'lady-attendant', roleLabel: 'Lady Attendant', roleBadge: 'badge-accent',
    dob: '25 Apr 1991', aadhar: '2287-XXXX-5507', license: '\u2014',
    licenseExpiry: '\u2014',
    phone: '98250 12007', salary: '\u20B98,500', status: 'Active', statusBadge: 'badge-success',
  },
];

/* ─── Tab Counts ─── */
const allCount = STAFF.length;
const driverCount = STAFF.filter((s) => s.role === 'driver').length;
const assistantCount = STAFF.filter((s) => s.role === 'assistant').length;
const ladyAttendantCount = STAFF.filter((s) => s.role === 'lady-attendant').length;

/* ─── Action Menu Component ─── */
function ActionMenu({ staffName, onView }: { staffName: string; onView: (n: string) => void }) {
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
        <button onClick={() => { onView(staffName); setOpen(false); }}>&#128065; View</button>
        <button onClick={() => setOpen(false)}>&#9998; Edit</button>
        <button className="danger" onClick={() => setOpen(false)}>&#128465; Delete</button>
      </div>
    </div>
  );
}

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState<'all' | StaffRole>('all');

  const filtered = activeTab === 'all' ? STAFF : STAFF.filter((s) => s.role === activeTab);

  function handleView(name: string) {
    alert(`View staff profile: ${name}`);
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Transport Staff</h3>
        <button className="btn btn-primary btn-sm">+ Add Staff</button>
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
            className={`tab-pill${activeTab === 'driver' ? ' active' : ''}`}
            onClick={() => setActiveTab('driver')}
          >
            Drivers ({driverCount})
          </button>
          <button
            className={`tab-pill${activeTab === 'assistant' ? ' active' : ''}`}
            onClick={() => setActiveTab('assistant')}
          >
            Assistants ({assistantCount})
          </button>
          <button
            className={`tab-pill${activeTab === 'lady-attendant' ? ' active' : ''}`}
            onClick={() => setActiveTab('lady-attendant')}
          >
            Lady Attendants ({ladyAttendantCount})
          </button>
        </div>

        {/* Staff Table */}
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
              {filtered.map((staff, idx) => (
                <tr key={staff.id} data-role={staff.role}>
                  <td>{idx + 1}</td>
                  <td>
                    <div
                      className="avatar"
                      style={{ background: staff.avatarBg, color: staff.avatarColor }}
                    >
                      {staff.initials}
                    </div>
                  </td>
                  <td>
                    <a className="clickable-link" onClick={() => handleView(staff.name)}>
                      {staff.name}
                    </a>
                  </td>
                  <td>{staff.fatherName}</td>
                  <td>
                    <span className={`badge ${staff.roleBadge}`}>{staff.roleLabel}</span>
                  </td>
                  <td>{staff.dob}</td>
                  <td>
                    <a className="clickable-link">{staff.aadhar}</a>
                  </td>
                  <td>
                    {staff.license === '\u2014' ? (
                      '\u2014'
                    ) : (
                      <a className="clickable-link">{staff.license}</a>
                    )}
                  </td>
                  <td>
                    {staff.licenseExpired ? (
                      <span style={{ color: 'var(--error)', fontWeight: 600 }}>
                        {staff.licenseExpiry}
                      </span>
                    ) : (
                      staff.licenseExpiry
                    )}
                  </td>
                  <td>{staff.phone}</td>
                  <td>{staff.salary}</td>
                  <td>
                    <span className={`badge ${staff.statusBadge}`}>{staff.status}</span>
                  </td>
                  <td>
                    <ActionMenu staffName={staff.name} onView={handleView} />
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
