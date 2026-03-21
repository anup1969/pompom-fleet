'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface BusProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  bus?: any;
  onEdit?: (bus: any) => void;
}

type TabKey = 'details' | 'documents' | 'expenses';

export default function BusProfileModal({ isOpen, onClose, bus, onEdit }: BusProfileModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('details');

  if (!bus) return null;

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'details', label: 'Details' },
    { key: 'documents', label: 'Documents' },
    { key: 'expenses', label: 'Expenses' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bus Profile \u2014 ${bus.vehicle_no || 'Unknown'}`}
      wide
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={() => onEdit?.(bus)}>Edit Bus</button>
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

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="two-col">
          <div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Vehicle Number</div>
              <div style={{ fontWeight: 600 }}>{bus.vehicle_no || '\u2014'}</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Make / Model</div>
              <div style={{ fontWeight: 600 }}>{bus.make_model || '\u2014'}</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Chassis No</div>
              <div>{bus.chassis_no || '\u2014'}</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Engine No</div>
              <div>{bus.engine_no || '\u2014'}</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Seats</div>
              <div>{bus.seats ?? '\u2014'}</div>
            </div>
          </div>
          <div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Odometer</div>
              <div style={{ fontWeight: 600 }}>{bus.odometer ? `${Number(bus.odometer).toLocaleString('en-IN')} km` : '\u2014'}</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Passing Due</div>
              <div>{bus.passing_due || '\u2014'}</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>PUC Due</div>
              <div>{bus.puc_due || '\u2014'}</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Next Service</div>
              <div>{bus.next_service_km ? `${Number(bus.next_service_km).toLocaleString('en-IN')} km` : '\u2014'}</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Status</div>
              <span className="badge badge-success">{bus.status || 'Active'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--bodytext)' }}>
          No documents uploaded yet.
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--bodytext)' }}>
          No expenses recorded for this bus yet.
        </div>
      )}
    </Modal>
  );
}
