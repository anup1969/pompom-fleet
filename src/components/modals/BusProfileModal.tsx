'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [documents, setDocuments] = useState<any[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    if (!bus?.id || !bus?.tenant_id) return;
    setDocsLoading(true);
    try {
      const res = await fetch(`/api/documents?tenant_id=${bus.tenant_id}&owner_type=bus&owner_id=${bus.id}`);
      if (res.ok) {
        setDocuments(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setDocsLoading(false);
    }
  }, [bus?.id, bus?.tenant_id]);

  useEffect(() => {
    if (isOpen && activeTab === 'documents') {
      fetchDocuments();
    }
  }, [isOpen, activeTab, fetchDocuments]);

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('details');
      setDocuments([]);
    }
  }, [isOpen]);

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
        <div>
          {docsLoading ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--bodytext)' }}>
              Loading documents...
            </div>
          ) : documents.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--bodytext)' }}>
              No documents uploaded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, textTransform: 'capitalize' }}>
                      {(doc.doc_type || 'document').replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--bodytext)', marginTop: 2 }}>
                      Uploaded {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-IN') : '\u2014'}
                    </div>
                  </div>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          )}
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
