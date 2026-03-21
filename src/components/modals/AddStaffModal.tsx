'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  tenantId?: string;
  editData?: any;
}

export default function AddStaffModal({ isOpen, onClose, onSaved, tenantId, editData }: AddStaffModalProps) {
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [role, setRole] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [salary, setSalary] = useState('');
  const [policeVerification, setPoliceVerification] = useState('');
  const [assignedBus, setAssignedBus] = useState('');
  const [saving, setSaving] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editData) {
      setName(editData.name || '');
      setFatherName(editData.father_name || '');
      setRole(editData.role || '');
      setDob(editData.dob || '');
      setPhone(editData.phone || '');
      setAadhar(editData.aadhar || '');
      setLicenseNo(editData.license_no || '');
      setLicenseExpiry(editData.license_expiry || '');
      setSalary(editData.salary?.toString() || '');
      setPoliceVerification(editData.police_verification || '');
      setAssignedBus(editData.assigned_bus || '');
    } else {
      setName('');
      setFatherName('');
      setRole('');
      setDob('');
      setPhone('');
      setAadhar('');
      setLicenseNo('');
      setLicenseExpiry('');
      setSalary('');
      setPoliceVerification('');
      setAssignedBus('');
    }
  }, [editData, isOpen]);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const payload: any = {
        name: name.trim(),
        father_name: fatherName || null,
        role: role || null,
        dob: dob || null,
        phone: phone || null,
        aadhar: aadhar || null,
        license_no: licenseNo || null,
        license_expiry: licenseExpiry || null,
        salary: salary ? Number(salary) : null,
        police_verification: policeVerification || null,
        assigned_bus: assignedBus || null,
      };

      if (editData?.id) {
        await fetch(`/api/staff/${editData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        payload.tenant_id = tenantId;
        await fetch('/api/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      onSaved?.();
      onClose();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? 'Edit Staff' : 'Add New Staff'}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editData ? 'Update Staff' : 'Save Staff'}
          </button>
        </>
      }
    >
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            className="form-input"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Father&apos;s Name</label>
          <input
            className="form-input"
            placeholder="Father's name"
            value={fatherName}
            onChange={(e) => setFatherName(e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Role</label>
          <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Select Role</option>
            <option value="Driver">Driver</option>
            <option value="Assistant">Assistant</option>
            <option value="Lady Attendant">Lady Attendant</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date of Birth</label>
          <input
            className="form-input"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input
            className="form-input"
            placeholder="e.g. 98250 12001"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Aadhar No</label>
          <input
            className="form-input"
            placeholder="e.g. 8834-XXXX-5501"
            value={aadhar}
            onChange={(e) => setAadhar(e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">License No</label>
          <input
            className="form-input"
            placeholder="e.g. GJ01-2019-005501"
            value={licenseNo}
            onChange={(e) => setLicenseNo(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">License Expiry</label>
          <input
            className="form-input"
            type="date"
            value={licenseExpiry}
            onChange={(e) => setLicenseExpiry(e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Salary (&#8377;)</label>
          <input
            className="form-input"
            type="number"
            placeholder="e.g. 15000"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Police Verification</label>
          <select
            className="form-select"
            value={policeVerification}
            onChange={(e) => setPoliceVerification(e.target.value)}
          >
            <option value="">Select Status</option>
            <option>Pending</option>
            <option>Verified</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Assigned Bus</label>
        <input
          className="form-input"
          placeholder="e.g. GJ-01-TX-5501"
          value={assignedBus}
          onChange={(e) => setAssignedBus(e.target.value)}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Aadhar Upload</label>
          <div className="file-upload">
            <div style={{ fontSize: 24, marginBottom: 4 }}>&#128196;</div>
            <div>Click to upload Aadhar</div>
            <div style={{ fontSize: 11, color: 'var(--bodytext)', marginTop: 4 }}>
              PDF, JPG, PNG (max 5MB)
            </div>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">License Upload</label>
          <div className="file-upload">
            <div style={{ fontSize: 24, marginBottom: 4 }}>&#128196;</div>
            <div>Click to upload License</div>
            <div style={{ fontSize: 11, color: 'var(--bodytext)', marginTop: 4 }}>
              PDF, JPG, PNG (max 5MB)
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
