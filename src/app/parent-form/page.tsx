'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ClassItem {
  id: string;
  name: string;
}

interface SectionItem {
  id: string;
  name: string;
}

interface AreaItem {
  id: string;
  name: string;
}

function ParentFormInner() {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get('t') || '';

  const [tenantName, setTenantName] = useState('');
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [areas, setAreas] = useState<AreaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    student_name: '',
    father_name: '',
    surname: '',
    gender: '',
    class_grade: '',
    section: '',
    dob: '',
    primary_mobile: '',
    secondary_mobile: '',
    address_line1: '',
    address_line2: '',
    area_id: '',
    city: '',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    // Fetch tenant name
    fetch(`/api/parent-link?tenant_id=${tenantId}`).then(r => r.json()).then(d => {
      if (d.tenant_name) setTenantName(d.tenant_name);
    }).catch(() => {});

    Promise.all([
      fetch(`/api/classes?tenant_id=${tenantId}`).then((r) => r.json()),
      fetch(`/api/sections?tenant_id=${tenantId}`).then((r) => r.json()),
      fetch(`/api/areas?tenant_id=${tenantId}`).then((r) => r.json()),
    ])
      .then(([cls, sec, ar]) => {
        setClasses(Array.isArray(cls) ? cls : []);
        setSections(Array.isArray(sec) ? sec : []);
        setAreas(Array.isArray(ar) ? ar : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tenantId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!form.student_name.trim()) { setErrorMsg('Student name is required.'); return; }
    if (!form.father_name.trim()) { setErrorMsg('Father name is required.'); return; }
    if (!form.primary_mobile.trim()) { setErrorMsg('Primary mobile is required.'); return; }

    setSubmitting(true);
    try {
      const selectedArea = areas.find((a) => a.id === form.area_id);
      const payload: any = {
        tenant_id: tenantId,
        student_name: form.student_name.trim(),
        father_name: form.father_name.trim(),
        surname: form.surname.trim() || null,
        gender: form.gender || null,
        class_grade: form.class_grade || null,
        section: form.section || null,
        dob: form.dob || null,
        primary_mobile: form.primary_mobile.trim(),
        secondary_mobile: form.secondary_mobile.trim() || null,
        address_line1: form.address_line1.trim() || null,
        address_line2: form.address_line2.trim() || null,
        area_id: form.area_id || null,
        area_name: selectedArea ? selectedArea.name : null,
        city: form.city.trim() || null,
      };

      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to submit. Please try again.');
        return;
      }

      const saved = await res.json();

      // Upload photo if selected
      if (photoFile) {
        const fd = new FormData();
        fd.append('file', photoFile);
        fd.append('owner_type', 'admission');
        fd.append('owner_id', saved.id);
        fd.append('doc_type', 'photo');
        fd.append('tenant_id', tenantId);

        const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
        if (upRes.ok) {
          const upData = await upRes.json();
          await fetch(`/api/admissions/${saved.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photo_url: upData.file_url }),
          });
        }
      }

      setSubmitted(true);
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!tenantId) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.headerBar}>
            <div style={styles.logo}>P</div>
            <div>
              <div style={styles.brandName}>{tenantName || 'PomPom Fleet'}</div>
              <div style={styles.brandSub}>Transport Admission</div>
            </div>
          </div>
          <div style={{ padding: 40, textAlign: 'center', color: '#98A4AE' }}>
            Invalid link. Please contact your transport team for the correct form URL.
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.headerBar}>
            <div style={styles.logo}>P</div>
            <div>
              <div style={styles.brandName}>{tenantName || 'PomPom Fleet'}</div>
              <div style={styles.brandSub}>Transport Admission</div>
            </div>
          </div>
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(46,169,92,.12)', color: '#2EA95C', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
              &#10003;
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1F2A3D', marginBottom: 8 }}>Admission Submitted</h2>
            <p style={{ fontSize: 14, color: '#98A4AE', maxWidth: 360, margin: '0 auto' }}>
              Thank you! The transport team will review your submission and assign a route and stop for your child.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.headerBar}>
          <div style={styles.logo}>P</div>
          <div>
            <div style={styles.brandName}>{tenantName || 'PomPom Fleet'}</div>
            <div style={styles.brandSub}>Student Transport Admission Form</div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#98A4AE' }}>Loading form...</div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: 24 }}>
            {errorMsg && (
              <div style={{ padding: '10px 14px', background: 'rgba(255,102,146,.12)', borderRadius: 6, marginBottom: 16, fontSize: 13, color: '#FF6692', fontWeight: 500 }}>
                {errorMsg}
              </div>
            )}

            {/* Names */}
            <div style={styles.fieldRow3}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Student Name *</label>
                <input
                  style={styles.input}
                  value={form.student_name}
                  onChange={(e) => setForm({ ...form, student_name: e.target.value })}
                  placeholder="First name"
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Father Name *</label>
                <input
                  style={styles.input}
                  value={form.father_name}
                  onChange={(e) => setForm({ ...form, father_name: e.target.value })}
                  placeholder="Father's name"
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Surname</label>
                <input
                  style={styles.input}
                  value={form.surname}
                  onChange={(e) => setForm({ ...form, surname: e.target.value })}
                  placeholder="Surname"
                />
              </div>
            </div>

            {/* Gender, Class, Section */}
            <div style={styles.fieldRow3}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Gender</label>
                <select
                  style={styles.select}
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Class</label>
                <select
                  style={styles.select}
                  value={form.class_grade}
                  onChange={(e) => setForm({ ...form, class_grade: e.target.value })}
                >
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Section</label>
                <select
                  style={styles.select}
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                >
                  <option value="">Select Section</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* DOB */}
            <div style={{ ...styles.fieldGroup, maxWidth: 260 }}>
              <label style={styles.label}>Date of Birth</label>
              <input
                type="date"
                style={styles.input}
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
              />
            </div>

            {/* Mobiles */}
            <div style={styles.fieldRow2}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Primary Mobile *</label>
                <input
                  style={styles.input}
                  value={form.primary_mobile}
                  onChange={(e) => setForm({ ...form, primary_mobile: e.target.value })}
                  placeholder="10-digit mobile"
                  type="tel"
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Secondary Mobile</label>
                <input
                  style={styles.input}
                  value={form.secondary_mobile}
                  onChange={(e) => setForm({ ...form, secondary_mobile: e.target.value })}
                  placeholder="Optional"
                  type="tel"
                />
              </div>
            </div>

            {/* Address */}
            <div style={styles.fieldRow2}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Address Line 1</label>
                <input
                  style={styles.input}
                  value={form.address_line1}
                  onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
                  placeholder="House/Flat, Street"
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Address Line 2</label>
                <input
                  style={styles.input}
                  value={form.address_line2}
                  onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
                  placeholder="Landmark, etc."
                />
              </div>
            </div>

            {/* Area, City */}
            <div style={styles.fieldRow2}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Area</label>
                <select
                  style={styles.select}
                  value={form.area_id}
                  onChange={(e) => setForm({ ...form, area_id: e.target.value })}
                >
                  <option value="">Select Area</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>City</label>
                <input
                  style={styles.input}
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="City"
                />
              </div>
            </div>

            {/* Photo */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Student Photo</label>
              <div
                style={styles.fileUpload}
                onClick={() => photoRef.current?.click()}
              >
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                />
                <div style={{ textAlign: 'center', color: '#98A4AE' }}>
                  {photoFile ? (
                    <span style={{ color: '#635BFF', fontWeight: 600 }}>{photoFile.name}</span>
                  ) : (
                    <span>Click to upload photo (max 5 MB)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  ...styles.submitBtn,
                  opacity: submitting ? 0.7 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Admission'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#98A4AE' }}>
        Powered by <a href="https://pompombus.com" target="_blank" rel="noopener noreferrer" style={{ color: '#F59E0B', fontWeight: 600, textDecoration: 'none' }}>POMPOMBUS.COM</a>
      </div>
    </div>
  );
}

export default function ParentFormPage() {
  return (
    <Suspense fallback={
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ padding: 40, textAlign: 'center', color: '#98A4AE' }}>Loading...</div>
        </div>
      </div>
    }>
      <ParentFormInner />
    </Suspense>
  );
}

/* ─── Inline styles (no auth/layout, standalone page) ─── */
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#F4F7FB',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '32px 16px',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  card: {
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0px 2px 4px -1px rgba(175,182,201,.2)',
    width: '100%',
    maxWidth: 680,
    overflow: 'hidden',
  },
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '18px 24px',
    borderBottom: '1px solid #e5e5e5',
    background: '#1A2537',
  },
  logo: {
    width: 40,
    height: 40,
    background: '#F59E0B',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 700,
    color: '#1F2A3D',
  },
  brandName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
  },
  brandSub: {
    color: '#98A4AE',
    fontSize: 12,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#2a3547',
    textTransform: 'uppercase' as const,
    letterSpacing: '.3px',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 42,
    padding: '10px 14px',
    border: '1.5px solid #e5e5e5',
    borderRadius: 10,
    fontSize: 14,
    fontFamily: 'inherit',
    background: '#fff',
    color: '#2a3547',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  select: {
    width: '100%',
    height: 42,
    padding: '10px 14px',
    border: '1.5px solid #e5e5e5',
    borderRadius: 10,
    fontSize: 14,
    fontFamily: 'inherit',
    background: '#fff',
    color: '#2a3547',
    outline: 'none',
    boxSizing: 'border-box' as const,
    appearance: 'auto' as const,
  },
  fieldRow2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  fieldRow3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 16,
  },
  fileUpload: {
    border: '2px dashed #e5e5e5',
    borderRadius: 10,
    padding: 24,
    textAlign: 'center' as const,
    cursor: 'pointer',
    fontSize: 13,
  },
  submitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 28px',
    fontSize: 14,
    fontWeight: 600,
    borderRadius: 10,
    border: 'none',
    background: '#F59E0B',
    color: '#1F2A3D',
    fontFamily: 'inherit',
    lineHeight: 1,
  },
};
