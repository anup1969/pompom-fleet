'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';

interface StaffProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ─── Demo Data ─── */
const STAFF = {
  name: 'Ramesh Solanki',
  initials: 'RS',
  role: 'Driver',
  fatherName: 'Harish Solanki',
  dob: '15 Jun 1985',
  phone: '98250 12001',
  aadhar: '8834-XXXX-5501',
  license: 'GJ01-2019-005501',
  licenseExpiry: '17 Mar 2026',
  salary: '\u20B915,000',
  policeVerification: 'Verified',
  joined: '1 Apr 2021',
  assignedBus: 'GJ-01-TX-5501',
};

const DOCUMENTS = [
  { name: 'Aadhar Card', type: 'PDF', uploaded: '1 Apr 2021', size: '540 KB' },
  { name: 'Driving License', type: 'PDF', uploaded: '1 Apr 2021', size: '720 KB' },
];

interface MonthSummary {
  month: string;
  year: number;
  present: number;
  hd: number;
  leave: number;
  cl: number;
  absent: number;
  wo: number;
  total: number;
  isCurrent?: boolean;
}

const MONTH_DATA: MonthSummary[] = [
  { month: 'March', year: 2026, present: 18, hd: 1, leave: 0, cl: 1, absent: 0, wo: 4, total: 24, isCurrent: true },
  { month: 'February', year: 2026, present: 22, hd: 0, leave: 1, cl: 1, absent: 0, wo: 4, total: 28 },
  { month: 'January', year: 2026, present: 24, hd: 1, leave: 0, cl: 2, absent: 1, wo: 4, total: 31 },
  { month: 'December', year: 2025, present: 23, hd: 0, leave: 1, cl: 1, absent: 0, wo: 5, total: 31 },
];

interface DayRecord {
  day: number;
  status: string;
  inTime: string;
  outTime: string;
}

const DEMO_DAYS: DayRecord[] = Array.from({ length: 24 }, (_, i) => {
  const day = i + 1;
  const weekday = new Date(2026, 2, day).getDay();
  if (weekday === 0) return { day, status: 'WO', inTime: '\u2014', outTime: '\u2014' };
  if (day === 8) return { day, status: 'CL', inTime: '\u2014', outTime: '\u2014' };
  if (day === 15) return { day, status: 'HD', inTime: '08:00 AM', outTime: '01:00 PM' };
  return { day, status: 'P', inTime: '07:30 AM', outTime: '06:00 PM' };
});

type TabKey = 'profile' | 'documents' | 'attendance';

function statusBadgeClass(status: string) {
  switch (status) {
    case 'P': return 'badge-success';
    case 'HD': return 'badge-warning';
    case 'L': return 'badge-error';
    case 'CL': return 'badge-primary';
    case 'A': return 'badge-error';
    case 'WO': return 'badge-info';
    default: return '';
  }
}

export default function StaffProfileModal({ isOpen, onClose }: StaffProfileModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [drillMonth, setDrillMonth] = useState<MonthSummary | null>(null);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'documents', label: 'Documents' },
    { key: 'attendance', label: 'Attendance' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Staff Profile"
      wide
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary">Edit Staff</button>
        </>
      }
    >
      {/* Tabs */}
      <div className="modal-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`modal-tab${activeTab === t.key ? ' active' : ''}`}
            onClick={() => { setActiveTab(t.key); setDrillMonth(null); }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div
              className="avatar"
              style={{ width: 56, height: 56, fontSize: 20, background: 'var(--lightprimary)', color: 'var(--primary)' }}
            >
              {STAFF.initials}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{STAFF.name}</div>
              <span className="badge badge-primary">{STAFF.role}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 24px' }}>
            {([
              ['Father\'s Name', STAFF.fatherName],
              ['Date of Birth', STAFF.dob],
              ['Phone', STAFF.phone],
              ['Aadhar No', STAFF.aadhar],
              ['License No', STAFF.license],
              ['License Expiry', STAFF.licenseExpiry],
              ['Salary', STAFF.salary],
              ['Police Verification', STAFF.policeVerification],
              ['Joined', STAFF.joined],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>
                  {label}
                </div>
                <div style={{ fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {DOCUMENTS.map((doc) => (
            <div
              key={doc.name}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: 16,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>&#128196;</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{doc.name}</div>
              <div style={{ fontSize: 11, color: 'var(--bodytext)' }}>
                {doc.type} &middot; {doc.size}
              </div>
              <div style={{ fontSize: 11, color: 'var(--bodytext)', marginTop: 2 }}>
                Uploaded {doc.uploaded}
              </div>
              <button className="btn btn-outline btn-sm" style={{ marginTop: 10 }}>
                View
              </button>
            </div>
          ))}
          <div
            className="file-upload"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 140,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>+</div>
            <div>Upload Document</div>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <>
          {drillMonth ? (
            <>
              {/* Day-wise drill-down */}
              <button
                className="btn btn-outline btn-sm"
                style={{ marginBottom: 16 }}
                onClick={() => setDrillMonth(null)}
              >
                &larr; Back to Months
              </button>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
                {drillMonth.month} {drillMonth.year} &mdash; Day-wise
              </h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Status</th>
                      <th>In Time</th>
                      <th>Out Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_DAYS.map((d) => (
                      <tr key={d.day}>
                        <td>{d.day}</td>
                        <td>
                          <span className={`badge ${statusBadgeClass(d.status)}`}>{d.status}</span>
                        </td>
                        <td>{d.inTime}</td>
                        <td>{d.outTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              {/* Current month highlight */}
              {MONTH_DATA.filter((m) => m.isCurrent).map((m) => (
                <div
                  key={m.month}
                  style={{
                    background: 'var(--lightprimary)',
                    borderRadius: 'var(--radius)',
                    padding: 20,
                    marginBottom: 20,
                    cursor: 'pointer',
                  }}
                  onClick={() => setDrillMonth(m)}
                >
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: 'var(--primary)' }}>
                    {m.month} {m.year} (Current)
                  </div>
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    {([
                      ['Present', m.present, 'var(--success)'],
                      ['HD', m.hd, '#b45309'],
                      ['Leave', m.leave, 'var(--error)'],
                      ['CL', m.cl, 'var(--primary)'],
                      ['Absent', m.absent, 'var(--error)'],
                      ['Week Off', m.wo, 'var(--bodytext)'],
                    ] as [string, number, string][]).map(([label, val, color]) => (
                      <div key={label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color }}>{val}</div>
                        <div style={{ fontSize: 11, color: 'var(--bodytext)' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Past months table */}
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Present</th>
                      <th>HD</th>
                      <th>Leave</th>
                      <th>CL</th>
                      <th>Absent</th>
                      <th>Week Off</th>
                      <th>Total Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MONTH_DATA.filter((m) => !m.isCurrent).map((m) => (
                      <tr
                        key={m.month + m.year}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setDrillMonth(m)}
                      >
                        <td>
                          <a className="clickable-link">
                            {m.month} {m.year}
                          </a>
                        </td>
                        <td>{m.present}</td>
                        <td>{m.hd}</td>
                        <td>{m.leave}</td>
                        <td>{m.cl}</td>
                        <td>{m.absent}</td>
                        <td>{m.wo}</td>
                        <td>{m.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </Modal>
  );
}
