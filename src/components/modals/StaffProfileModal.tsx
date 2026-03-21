'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface StaffProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff?: any;
  onEdit?: (staff: any) => void;
}

type TabKey = 'profile' | 'documents' | 'attendance';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function StaffProfileModal({ isOpen, onClose, staff, onEdit }: StaffProfileModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('profile');

  if (!staff) return null;

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'documents', label: 'Documents' },
    { key: 'attendance', label: 'Attendance' },
  ];

  const roleLabel = staff.role || '\u2014';

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
          <button className="btn btn-primary" onClick={() => onEdit?.(staff)}>Edit Staff</button>
        </>
      }
    >
      {/* Tabs */}
      <div className="modal-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`modal-tab${activeTab === t.key ? ' active' : ''}`}
            onClick={() => setActiveTab(t.key)}
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
              {getInitials(staff.name || 'NA')}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{staff.name}</div>
              <span className="badge badge-primary">{roleLabel}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 24px' }}>
            {([
              ['Father\'s Name', staff.father_name || '\u2014'],
              ['Date of Birth', staff.dob || '\u2014'],
              ['Phone', staff.phone || '\u2014'],
              ['Aadhar No', staff.aadhar || '\u2014'],
              ['License No', staff.license_no || '\u2014'],
              ['License Expiry', staff.license_expiry || '\u2014'],
              ['Salary', staff.salary ? `\u20B9${Number(staff.salary).toLocaleString('en-IN')}` : '\u2014'],
              ['Police Verification', staff.police_verification || '\u2014'],
              ['Assigned Bus', staff.assigned_bus || '\u2014'],
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
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--bodytext)' }}>
          No documents uploaded yet.
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--bodytext)' }}>
          Attendance records will appear here once attendance is marked.
        </div>
      )}
    </Modal>
  );
}
