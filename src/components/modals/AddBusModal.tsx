'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface AddBusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  tenantId?: string;
  editData?: any;
}

interface CustomField {
  id: number;
  label: string;
  value: string;
}

export default function AddBusModal({ isOpen, onClose, onSaved, tenantId, editData }: AddBusModalProps) {
  const [vehicleNo, setVehicleNo] = useState('');
  const [makeModel, setMakeModel] = useState('');
  const [chassisNo, setChassisNo] = useState('');
  const [engineNo, setEngineNo] = useState('');
  const [seats, setSeats] = useState('');
  const [odometer, setOdometer] = useState('');
  const [passingDue, setPassingDue] = useState('');
  const [pucDue, setPucDue] = useState('');
  const [nextServiceKm, setNextServiceKm] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [saving, setSaving] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editData) {
      setVehicleNo(editData.vehicle_no || '');
      setMakeModel(editData.make_model || '');
      setChassisNo(editData.chassis_no || '');
      setEngineNo(editData.engine_no || '');
      setSeats(editData.seats?.toString() || '');
      setOdometer(editData.odometer?.toString() || '');
      setPassingDue(editData.passing_due || '');
      setPucDue(editData.puc_due || '');
      setNextServiceKm(editData.next_service_km?.toString() || '');
      setCustomFields([]);
    } else {
      setVehicleNo('');
      setMakeModel('');
      setChassisNo('');
      setEngineNo('');
      setSeats('');
      setOdometer('');
      setPassingDue('');
      setPucDue('');
      setNextServiceKm('');
      setCustomFields([]);
    }
  }, [editData, isOpen]);

  function addCustomField() {
    setCustomFields([...customFields, { id: Date.now(), label: '', value: '' }]);
  }

  function removeCustomField(id: number) {
    setCustomFields(customFields.filter((f) => f.id !== id));
  }

  function updateCustomField(id: number, key: 'label' | 'value', val: string) {
    setCustomFields(customFields.map((f) => (f.id === id ? { ...f, [key]: val } : f)));
  }

  async function handleSave() {
    if (!vehicleNo.trim()) return;
    setSaving(true);
    try {
      const payload: any = {
        vehicle_no: vehicleNo.trim(),
        make_model: makeModel || null,
        chassis_no: chassisNo || null,
        engine_no: engineNo || null,
        seats: seats ? Number(seats) : null,
        odometer: odometer ? Number(odometer) : null,
        passing_due: passingDue || null,
        puc_due: pucDue || null,
        next_service_km: nextServiceKm ? Number(nextServiceKm) : null,
      };

      if (editData?.id) {
        // Update existing
        await fetch(`/api/buses/${editData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new
        payload.tenant_id = tenantId;
        await fetch('/api/buses', {
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
      title={editData ? 'Edit Bus' : 'Add New Bus'}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editData ? 'Update Bus' : 'Save Bus'}
          </button>
        </>
      }
    >
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Vehicle Number</label>
          <input
            className="form-input"
            placeholder="e.g. GJ-01-TX-5501"
            value={vehicleNo}
            onChange={(e) => setVehicleNo(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Make / Model</label>
          <select className="form-select" value={makeModel} onChange={(e) => setMakeModel(e.target.value)}>
            <option value="">Select Make</option>
            <option>Tata Starbus</option>
            <option>Ashok Leyland Lynx</option>
            <option>Eicher Skyline</option>
            <option>Force Traveller</option>
            <option>BharatBenz</option>
            <option>Mahindra</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Chassis No</label>
          <input
            className="form-input"
            placeholder="e.g. MAT449001"
            value={chassisNo}
            onChange={(e) => setChassisNo(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Engine No</label>
          <input
            className="form-input"
            placeholder="e.g. ENG880101"
            value={engineNo}
            onChange={(e) => setEngineNo(e.target.value)}
          />
        </div>
      </div>

      <div className="form-row-3">
        <div className="form-group">
          <label className="form-label">Seats</label>
          <input
            className="form-input"
            type="number"
            placeholder="e.g. 52"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Odometer (km)</label>
          <input
            className="form-input"
            type="number"
            placeholder="e.g. 38200"
            value={odometer}
            onChange={(e) => setOdometer(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Passing Due Date</label>
          <input
            className="form-input"
            type="date"
            value={passingDue}
            onChange={(e) => setPassingDue(e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">PUC Due</label>
          <input
            className="form-input"
            type="date"
            value={pucDue}
            onChange={(e) => setPucDue(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Next Service KM</label>
          <input
            className="form-input"
            type="number"
            placeholder="e.g. 40000"
            value={nextServiceKm}
            onChange={(e) => setNextServiceKm(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">RC Book Upload</label>
        <div className="file-upload">
          <div style={{ fontSize: 24, marginBottom: 4 }}>&#128196;</div>
          <div>Click to upload RC Book</div>
          <div style={{ fontSize: 11, color: 'var(--bodytext)', marginTop: 4 }}>
            PDF, JPG, PNG (max 5MB)
          </div>
        </div>
      </div>

      {/* Custom Fields */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <label className="form-label" style={{ marginBottom: 0 }}>
            Custom Fields
          </label>
          <button className="btn btn-outline btn-sm" onClick={addCustomField}>
            + Add Custom Field
          </button>
        </div>
        {customFields.map((field) => (
          <div className="form-row" key={field.id} style={{ marginBottom: 8 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <input
                className="form-input"
                placeholder="Field Name"
                value={field.label}
                onChange={(e) => updateCustomField(field.id, 'label', e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="form-input"
                placeholder="Value"
                value={field.value}
                onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
              />
              <button
                className="btn-icon"
                style={{ flexShrink: 0 }}
                onClick={() => removeCustomField(field.id)}
                title="Remove"
              >
                &times;
              </button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
