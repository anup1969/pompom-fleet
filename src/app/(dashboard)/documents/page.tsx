'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/session-context';

/* ──────────────── Types ──────────────── */
interface DocEntry {
  id: string;
  doc_type: string;
  owner_name: string;
  owner_type: string;
  reference_no: string;
  expiry_date: string | null;
  file_url: string | null;
}

type StatusKey = 'expired' | 'due-soon' | 'valid';

/* ──────────────── Helpers ──────────────── */
function computeStatus(expiryDate: string | null): { status: StatusKey; label: string; badge: string; days: number; daysLabel: string; daysColor: string; rowBg: string } {
  if (!expiryDate) {
    return { status: 'valid', label: 'Valid', badge: 'badge-success', days: 999, daysLabel: '\u2014', daysColor: 'var(--bodytext)', rowBg: '' };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffMs = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'expired',
      label: 'Expired',
      badge: 'badge-error',
      days: diffDays,
      daysLabel: `${diffDays} days`,
      daysColor: 'var(--error)',
      rowBg: 'rgba(255,102,146,.06)',
    };
  }
  if (diffDays <= 30) {
    return {
      status: 'due-soon',
      label: 'Due Soon',
      badge: 'badge-warning',
      days: diffDays,
      daysLabel: `${diffDays} days`,
      daysColor: '#b45309',
      rowBg: 'rgba(248,194,10,.06)',
    };
  }
  return {
    status: 'valid',
    label: 'Valid',
    badge: 'badge-success',
    days: diffDays,
    daysLabel: `${diffDays} days`,
    daysColor: 'var(--success)',
    rowBg: '',
  };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '\u2014';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ──────────────── Page ──────────────── */
export default function DocumentsPage() {
  const { tenant } = useSession();
  const [docs, setDocs] = useState<DocEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  /* Fetch */
  async function fetchDocs() {
    if (!tenant) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/documents?tenant_id=${tenant.id}`);
      if (res.ok) {
        const data = await res.json();
        setDocs(data);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.id]);

  /* Compute statuses */
  const docsWithStatus = docs.map((d) => ({
    ...d,
    computed: computeStatus(d.expiry_date),
  }));

  /* Counts */
  const expiredCount = docsWithStatus.filter((d) => d.computed.status === 'expired').length;
  const dueSoonCount = docsWithStatus.filter((d) => d.computed.status === 'due-soon').length;
  const validCount = docsWithStatus.filter((d) => d.computed.status === 'valid').length;

  const STATUS_TABS = [
    { key: 'all', label: `All (${docsWithStatus.length})`, style: {} },
    { key: 'expired', label: `Expired (${expiredCount})`, style: { borderColor: 'var(--error)', color: 'var(--error)' } },
    { key: 'due-soon', label: `Due Soon (${dueSoonCount})`, style: { borderColor: 'var(--warning)', color: '#b45309' } },
    { key: 'valid', label: `Valid (${validCount})`, style: { borderColor: 'var(--success)', color: 'var(--success)' } },
  ];

  /* Filter */
  const filtered = docsWithStatus.filter(
    (d) => statusFilter === 'all' || d.computed.status === statusFilter
  );

  return (
    <div className="card">
      <div className="card-header">
        <h3>Document Expiry Tracker</h3>
        <button className="btn btn-outline btn-sm">&#128229; Export</button>
      </div>
      <div className="card-body">
        {/* Tab Pill Filters */}
        <div className="tab-pills">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              className={`tab-pill${statusFilter === t.key ? ' active' : ''}`}
              style={statusFilter !== t.key ? t.style : undefined}
              onClick={() => setStatusFilter(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>
            Loading documents...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--bodytext)' }}>
            {docs.length === 0
              ? 'No documents tracked yet.'
              : 'No documents match the selected filter.'}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Document Type</th>
                  <th>Vehicle / Person</th>
                  <th>Reference No</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Days</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, idx) => (
                  <tr key={d.id} style={d.computed.rowBg ? { background: d.computed.rowBg } : undefined}>
                    <td>{idx + 1}</td>
                    <td>{d.doc_type}</td>
                    <td>
                      <a className="clickable-link">{d.owner_name}</a>
                    </td>
                    <td>{d.reference_no || '\u2014'}</td>
                    <td>{formatDate(d.expiry_date)}</td>
                    <td>
                      <span className={`badge ${d.computed.badge}`}>{d.computed.label}</span>
                    </td>
                    <td style={{ color: d.computed.daysColor, fontWeight: 600 }}>
                      {d.computed.daysLabel}
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm">&#128065; View</button>{' '}
                      {d.computed.status === 'expired' ? (
                        <button className="btn btn-outline btn-sm">&#128228; Upload</button>
                      ) : (
                        <button className="btn btn-outline btn-sm">&#128229; Download</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
