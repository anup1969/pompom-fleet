'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Modal from '@/components/Modal';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  tenantId?: string;
  editData?: any;
}

interface BusOption {
  id: string;
  vehicle_no: string;
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
  const [assignedBusId, setAssignedBusId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Bus options for dropdown
  const [buses, setBuses] = useState<BusOption[]>([]);

  // File upload state
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const aadharInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  // Fetch buses for dropdown
  const fetchBuses = useCallback(async () => {
    if (!tenantId) return;
    try {
      const res = await fetch(`/api/buses?tenant_id=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setBuses(data.map((b: any) => ({ id: b.id, vehicle_no: b.vehicle_no })));
      }
    } catch {
      // ignore
    }
  }, [tenantId]);

  useEffect(() => {
    if (isOpen) fetchBuses();
  }, [isOpen, fetchBuses]);

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
      setAssignedBusId(editData.assigned_bus_id || '');
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
      setAssignedBusId('');
    }
    setAadharFile(null);
    setLicenseFile(null);
    setError('');
  }, [editData, isOpen]);

  async function uploadDocument(file: File, staffId: string, docType: string) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('owner_type', 'staff');
    fd.append('owner_id', staffId);
    fd.append('doc_type', docType);
    fd.append('tenant_id', tenantId || '');

    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Upload failed');
    }
    return res.json();
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError('');
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
        assigned_bus_id: assignedBusId || null,
      };

      let staffId = editData?.id;

      if (editData?.id) {
        const res = await fetch(`/api/staff/${editData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Failed to update staff' }));
          throw new Error(err.error || 'Failed to update staff');
        }
      } else {
        payload.tenant_id = tenantId;
        const res = await fetch('/api/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Failed to save staff' }));
          throw new Error(err.error || 'Failed to save staff');
        }
        const created = await res.json();
        staffId = created.id;
      }

      // Upload documents if selected
      if (staffId) {
        if (aadharFile) {
          await uploadDocument(aadharFile, staffId, 'aadhar');
        }
        if (licenseFile) {
          await uploadDocument(licenseFile, staffId, 'license');
        }
      }

      onSaved?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  function handleFileSelect(type: 'aadhar' | 'license', file: File | undefined) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('File exceeds 5 MB limit');
      return;
    }
    if (type === 'aadhar') setAadharFile(file);
    else setLicenseFile(file);
    setError('');
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
      {error && (
        <div style={{ background: 'var(--lighterror)', color: 'var(--error)', padding: '10px 14px', borderRadius: 'var(--radius)', marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

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
        <select
          className="form-select"
          value={assignedBusId}
          onChange={(e) => setAssignedBusId(e.target.value)}
        >
          <option value="">None</option>
          {buses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.vehicle_no}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Aadhar Upload</label>
          <input
            ref={aadharInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect('aadhar', e.target.files?.[0])}
          />
          <div
            className="file-upload"
            onClick={() => aadharInputRef.current?.click()}
          >
            {aadharFile ? (
              <>
                <div style={{ fontSize: 24, marginBottom: 4 }}>&#9989;</div>
                <div style={{ fontWeight: 500 }}>{aadharFile.name}</div>
                <div style={{ fontSize: 11, color: 'var(--bodytext)', marginTop: 4 }}>
                  {(aadharFile.size / 1024).toFixed(0)} KB — click to change
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 24, marginBottom: 4 }}>&#128196;</div>
                <div>Click to upload Aadhar</div>
                <div style={{ fontSize: 11, color: 'var(--bodytext)', marginTop: 4 }}>
                  PDF, JPG, PNG (max 5MB)
                </div>
              </>
            )}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">License Upload</label>
          <input
            ref={licenseInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect('license', e.target.files?.[0])}
          />
          <div
            className="file-upload"
            onClick={() => licenseInputRef.current?.click()}
          >
            {licenseFile ? (
              <>
                <div style={{ fontSize: 24, marginBottom: 4 }}>&#9989;</div>
                <div style={{ fontWeight: 500 }}>{licenseFile.name}</div>
                <div style={{ fontSize: 11, color: 'var(--bodytext)', marginTop: 4 }}>
                  {(licenseFile.size / 1024).toFixed(0)} KB — click to change
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 24, marginBottom: 4 }}>&#128196;</div>
                <div>Click to upload License</div>
                <div style={{ fontSize: 11, color: 'var(--bodytext)', marginTop: 4 }}>
                  PDF, JPG, PNG (max 5MB)
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
