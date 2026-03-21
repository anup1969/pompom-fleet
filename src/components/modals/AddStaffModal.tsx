'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BUSES = [
  'GJ-01-TX-5501',
  'GJ-01-TX-5502',
  'GJ-01-TX-5503',
  'GJ-01-TX-5504',
  'GJ-01-TX-5505',
  'GJ-01-TX-5507',
];

export default function AddStaffModal({ isOpen, onClose }: AddStaffModalProps) {
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

  function handleSave() {
    // Will wire to API later
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Staff"
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Staff
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
            <option>Driver</option>
            <option>Assistant</option>
            <option>Lady Attendant</option>
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
        <select className="form-select" value={assignedBus} onChange={(e) => setAssignedBus(e.target.value)}>
          <option value="">Select Bus</option>
          {BUSES.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
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
