'use client'

import { useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type VendorCategory = 'Fuel' | 'Tyres' | 'Insurance' | 'Repairs' | 'Other'
type CategoryFilter = 'All' | VendorCategory

interface Vendor {
  id: string
  name: string
  contactPerson: string
  phone: string
  category: VendorCategory
  gstNo: string
}

/* ------------------------------------------------------------------ */
/*  Demo data                                                          */
/* ------------------------------------------------------------------ */

const VENDORS: Vendor[] = [
  { id: '1', name: 'Gujarat Petroleum Corp', contactPerson: 'Vikram Mehta', phone: '+91 98765 43210', category: 'Fuel', gstNo: '24AABCG1234F1Z5' },
  { id: '2', name: 'Ashok Tyre House', contactPerson: 'Ramesh Patel', phone: '+91 98765 12340', category: 'Tyres', gstNo: '24AACTA5678G1Z3' },
  { id: '3', name: 'National Insurance Co.', contactPerson: 'Priya Sharma', phone: '+91 97654 32100', category: 'Insurance', gstNo: '24AAICN9012H1Z1' },
  { id: '4', name: 'AutoCare Service Centre', contactPerson: 'Suresh Joshi', phone: '+91 99887 76543', category: 'Repairs', gstNo: '24AABCA3456J1Z8' },
  { id: '5', name: 'SafeDrive Accessories', contactPerson: 'Neha Desai', phone: '+91 98123 45670', category: 'Other', gstNo: '24AACSD7890K1Z6' },
  { id: '6', name: 'MRF Tyre Dealers', contactPerson: 'Kamlesh Shah', phone: '+91 99001 23456', category: 'Tyres', gstNo: '24AABCM2345L1Z4' },
]

const CATEGORY_COLORS: Record<VendorCategory, { bg: string; text: string }> = {
  Fuel:      { bg: '#fef3c7', text: '#92400e' },
  Tyres:     { bg: '#e0e7ff', text: '#3730a3' },
  Insurance: { bg: '#dcfce7', text: '#166534' },
  Repairs:   { bg: '#fee2e2', text: '#991b1b' },
  Other:     { bg: '#f3f4f6', text: '#374151' },
}

const CATEGORIES: CategoryFilter[] = ['All', 'Fuel', 'Tyres', 'Insurance', 'Repairs', 'Other']

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function VendorsPage() {
  const [filter, setFilter] = useState<CategoryFilter>('All')

  const visible = filter === 'All' ? VENDORS : VENDORS.filter((v) => v.category === filter)

  const counts: Record<CategoryFilter, number> = {
    All: VENDORS.length,
    Fuel: VENDORS.filter((v) => v.category === 'Fuel').length,
    Tyres: VENDORS.filter((v) => v.category === 'Tyres').length,
    Insurance: VENDORS.filter((v) => v.category === 'Insurance').length,
    Repairs: VENDORS.filter((v) => v.category === 'Repairs').length,
    Other: VENDORS.filter((v) => v.category === 'Other').length,
  }

  return (
    <div className="min-h-screen" style={{ background: '#F4F7FB' }}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold" style={{ color: '#1F2A3D' }}>Vendor Directory</h1>
          <button
            className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: '#635BFF' }}
          >
            + Add Vendor
          </button>
        </div>

        {/* Category filter pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className="rounded-full px-4 py-1.5 text-sm font-medium transition-all"
              style={{
                background: filter === c ? '#635BFF' : '#fff',
                color: filter === c ? '#fff' : '#98A4AE',
                border: filter === c ? '1px solid #635BFF' : '1px solid #e5e5e5',
              }}
            >
              {c} ({counts[c]})
            </button>
          ))}
        </div>

        {/* Vendor cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((v) => {
            const catStyle = CATEGORY_COLORS[v.category]
            return (
              <div
                key={v.id}
                className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                style={{ border: '1px solid #e5e5e5' }}
              >
                {/* Top row: name + badge */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold leading-tight" style={{ color: '#1F2A3D' }}>
                    {v.name}
                  </h3>
                  <span
                    className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                    style={{ background: catStyle.bg, color: catStyle.text }}
                  >
                    {v.category}
                  </span>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 flex-shrink-0" style={{ color: '#98A4AE' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span style={{ color: '#1F2A3D' }}>{v.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 flex-shrink-0" style={{ color: '#98A4AE' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span style={{ color: '#635BFF' }} className="font-medium">{v.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 flex-shrink-0" style={{ color: '#98A4AE' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-mono text-xs" style={{ color: '#98A4AE' }}>{v.gstNo}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty state */}
        {visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-lg font-medium" style={{ color: '#98A4AE' }}>No vendors found in this category</p>
          </div>
        )}
      </div>
    </div>
  )
}
