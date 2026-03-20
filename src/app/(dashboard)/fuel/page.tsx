'use client'

import { useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type PeriodFilter = 'Today' | 'This Week' | 'This Month' | 'All'

interface FuelEntry {
  id: string
  date: string
  bus: string
  litres: number
  rate: number
  amount: number
  odometer: number
  station: string
}

/* ------------------------------------------------------------------ */
/*  Demo data                                                          */
/* ------------------------------------------------------------------ */

const FUEL_LOG: FuelEntry[] = [
  { id: '1', date: '2026-03-20', bus: 'GJ-05-AB-1234', litres: 65, rate: 96.5, amount: 6272.5, odometer: 142350, station: 'HP Petrol Pump, Ring Road' },
  { id: '2', date: '2026-03-19', bus: 'GJ-05-CD-5678', litres: 52, rate: 96.5, amount: 5018.0, odometer: 98720, station: 'Indian Oil, MG Road' },
  { id: '3', date: '2026-03-18', bus: 'GJ-05-EF-9012', litres: 70, rate: 96.8, amount: 6776.0, odometer: 113480, station: 'Bharat Petroleum, SG Highway' },
  { id: '4', date: '2026-03-17', bus: 'GJ-05-AB-1234', litres: 60, rate: 96.5, amount: 5790.0, odometer: 141800, station: 'HP Petrol Pump, Ring Road' },
  { id: '5', date: '2026-03-15', bus: 'GJ-05-GH-3456', litres: 55, rate: 96.8, amount: 5324.0, odometer: 87650, station: 'Indian Oil, Satellite' },
  { id: '6', date: '2026-03-14', bus: 'GJ-05-CD-5678', litres: 48, rate: 96.5, amount: 4632.0, odometer: 98200, station: 'HP Petrol Pump, Navrangpura' },
  { id: '7', date: '2026-03-12', bus: 'GJ-05-EF-9012', litres: 68, rate: 96.5, amount: 6562.0, odometer: 112900, station: 'Bharat Petroleum, SG Highway' },
  { id: '8', date: '2026-03-10', bus: 'GJ-05-AB-1234', litres: 62, rate: 96.2, amount: 5964.4, odometer: 141250, station: 'Indian Oil, MG Road' },
]

const TOTAL_LITRES = FUEL_LOG.reduce((s, e) => s + e.litres, 0)
const TOTAL_COST = FUEL_LOG.reduce((s, e) => s + e.amount, 0)
const AVG_MILEAGE = 4.2 // km/l — static demo value

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function FuelPage() {
  const [period, setPeriod] = useState<PeriodFilter>('This Month')

  return (
    <div className="min-h-screen" style={{ background: '#F4F7FB' }}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold" style={{ color: '#1F2A3D' }}>Fuel Log</h1>
          <button
            className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: '#635BFF' }}
          >
            + Add Fuel Entry
          </button>
        </div>

        {/* Period filter */}
        <div className="mb-6 flex gap-1 self-start rounded-lg p-1" style={{ background: '#e5e5e5' }}>
          {(['Today', 'This Week', 'This Month', 'All'] as PeriodFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="rounded-md px-4 py-2 text-sm font-medium transition-all"
              style={{
                background: period === p ? '#fff' : 'transparent',
                color: period === p ? '#635BFF' : '#98A4AE',
                boxShadow: period === p ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {/* Total Litres */}
          <div className="rounded-xl bg-white p-5 shadow-sm" style={{ border: '1px solid #e5e5e5' }}>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#98A4AE' }}>Total Litres</p>
            <p className="mt-2 text-3xl font-bold" style={{ color: '#635BFF' }}>
              {TOTAL_LITRES.toLocaleString('en-IN')}
              <span className="ml-1 text-sm font-normal" style={{ color: '#98A4AE' }}>L</span>
            </p>
          </div>

          {/* Total Cost */}
          <div className="rounded-xl bg-white p-5 shadow-sm" style={{ border: '1px solid #e5e5e5' }}>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#98A4AE' }}>Total Cost</p>
            <p className="mt-2 text-3xl font-bold" style={{ color: '#2EA95C' }}>
              {formatCurrency(TOTAL_COST)}
            </p>
          </div>

          {/* Avg Mileage */}
          <div className="rounded-xl bg-white p-5 shadow-sm" style={{ border: '1px solid #e5e5e5' }}>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#98A4AE' }}>Avg Mileage</p>
            <p className="mt-2 text-3xl font-bold" style={{ color: '#F59E0B' }}>
              {AVG_MILEAGE}
              <span className="ml-1 text-sm font-normal" style={{ color: '#98A4AE' }}>km/l</span>
            </p>
          </div>
        </div>

        {/* Fuel log table */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm" style={{ border: '1px solid #e5e5e5' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#F4F7FB' }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#98A4AE' }}>Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#98A4AE' }}>Bus</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: '#98A4AE' }}>Litres</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: '#98A4AE' }}>Rate/L</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: '#98A4AE' }}>Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: '#98A4AE' }}>Odometer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#98A4AE' }}>Station</th>
                </tr>
              </thead>
              <tbody>
                {FUEL_LOG.map((entry) => (
                  <tr key={entry.id} className="border-t transition-colors hover:bg-gray-50/60" style={{ borderColor: '#f0f0f0' }}>
                    <td className="whitespace-nowrap px-4 py-3 font-medium" style={{ color: '#1F2A3D' }}>
                      {formatDate(entry.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block rounded-md px-2 py-0.5 text-xs font-semibold"
                        style={{ background: '#f0f0ff', color: '#635BFF' }}
                      >
                        {entry.bus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium" style={{ color: '#1F2A3D' }}>{entry.litres}</td>
                    <td className="px-4 py-3 text-right" style={{ color: '#98A4AE' }}>{entry.rate.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-medium" style={{ color: '#2EA95C' }}>
                      {formatCurrency(entry.amount)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums" style={{ color: '#1F2A3D' }}>
                      {entry.odometer.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3" style={{ color: '#98A4AE' }}>{entry.station}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
