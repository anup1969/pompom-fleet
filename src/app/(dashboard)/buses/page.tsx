'use client';

import { useState, useRef, useEffect } from 'react';

/* ──────────────── Types ──────────────── */
interface Bus {
  id: string;
  vehicleNo: string;
  make: string;
  model: string;
  year: number;
  seats: number;
  odometer: number;
  status: 'Active' | 'Maintenance';
  chassisNo: string;
  engineNo: string;
  fuelType: string;
}

/* ──────────────── Demo Data ──────────────── */
const DEMO_BUSES: Bus[] = [
  {
    id: '1',
    vehicleNo: 'GJ-01-AB-1234',
    make: 'Tata',
    model: 'Starbus',
    year: 2021,
    seats: 42,
    odometer: 87420,
    status: 'Active',
    chassisNo: 'MAT446187NKA00123',
    engineNo: 'SF4GCNG6034567',
    fuelType: 'Diesel',
  },
  {
    id: '2',
    vehicleNo: 'GJ-01-CD-5678',
    make: 'Ashok Leyland',
    model: 'Lynx',
    year: 2022,
    seats: 36,
    odometer: 54300,
    status: 'Active',
    chassisNo: 'MB1CNFF37MHJ40021',
    engineNo: 'H4CTIEA6100234',
    fuelType: 'Diesel',
  },
  {
    id: '3',
    vehicleNo: 'GJ-01-EF-9012',
    make: 'Force',
    model: 'Traveller 26',
    year: 2020,
    seats: 26,
    odometer: 112800,
    status: 'Maintenance',
    chassisNo: 'MBL5FKA3XLA00456',
    engineNo: 'FM2.6CR4A005678',
    fuelType: 'Diesel',
  },
  {
    id: '4',
    vehicleNo: 'GJ-01-GH-3456',
    make: 'Eicher',
    model: 'Skyline Pro',
    year: 2023,
    seats: 52,
    odometer: 23150,
    status: 'Active',
    chassisNo: 'VE10316RSNB01234',
    engineNo: 'E495TCI7A012345',
    fuelType: 'Diesel',
  },
  {
    id: '5',
    vehicleNo: 'GJ-01-IJ-7890',
    make: 'Tata',
    model: 'LP 712',
    year: 2019,
    seats: 40,
    odometer: 145600,
    status: 'Active',
    chassisNo: 'MAT449187NKB00789',
    engineNo: 'SF4GCNG5025678',
    fuelType: 'Diesel',
  },
  {
    id: '6',
    vehicleNo: 'GJ-01-KL-2345',
    make: 'BharatBenz',
    model: '914 R',
    year: 2022,
    seats: 34,
    odometer: 68900,
    status: 'Maintenance',
    chassisNo: 'WDB9061631N012456',
    engineNo: 'OM904LA6A078901',
    fuelType: 'Diesel',
  },
];

/* ──────────────── Helpers ──────────────── */
function formatOdometer(km: number): string {
  return km.toLocaleString('en-IN') + ' km';
}

/* ──────────────── Dropdown ──────────────── */
function ActionDropdown({
  busId,
  onAction,
}: {
  busId: string;
  onAction: (action: string, id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-lightgray transition-colors text-bodytext hover:text-dark"
        aria-label="Actions"
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-[10px] shadow-lg border border-border z-20 py-1">
          {['View', 'Edit', 'Delete'].map((action) => (
            <button
              key={action}
              onClick={() => {
                onAction(action, busId);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-lightgray transition-colors ${
                action === 'Delete' ? 'text-error hover:bg-red-50' : 'text-dark'
              }`}
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────── Bus Card ──────────────── */
function BusCard({
  bus,
  onAction,
  onSelect,
}: {
  bus: Bus;
  onAction: (action: string, id: string) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-primary/10 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="text-primary">
              <rect x="3" y="4" width="18" height="12" rx="2" />
              <path d="M3 12h18M7 20h10M9 16v4M15 16v4" />
            </svg>
          </div>
          <div>
            <button
              onClick={() => onSelect(bus.id)}
              className="text-[15px] font-semibold text-dark hover:text-primary transition-colors cursor-pointer"
            >
              {bus.vehicleNo}
            </button>
            <p className="text-xs text-bodytext mt-0.5">
              {bus.make} {bus.model} &middot; {bus.year}
            </p>
          </div>
        </div>
        <ActionDropdown busId={bus.id} onAction={onAction} />
      </div>

      {/* Divider */}
      <div className="border-t border-border mx-5" />

      {/* Body */}
      <div className="px-5 py-4 grid grid-cols-2 gap-y-3 gap-x-4">
        <div>
          <p className="text-[11px] text-bodytext uppercase tracking-wider font-medium">Seats</p>
          <p className="text-sm font-semibold text-dark mt-0.5">{bus.seats}</p>
        </div>
        <div>
          <p className="text-[11px] text-bodytext uppercase tracking-wider font-medium">Fuel</p>
          <p className="text-sm font-semibold text-dark mt-0.5">{bus.fuelType}</p>
        </div>
        <div>
          <p className="text-[11px] text-bodytext uppercase tracking-wider font-medium">Odometer</p>
          <p className="text-sm font-semibold text-dark mt-0.5">{formatOdometer(bus.odometer)}</p>
        </div>
        <div>
          <p className="text-[11px] text-bodytext uppercase tracking-wider font-medium">Status</p>
          <span
            className={`inline-flex items-center mt-0.5 px-2.5 py-0.5 rounded-md text-xs font-medium ${
              bus.status === 'Active'
                ? 'bg-success/10 text-success'
                : 'bg-warning/10 text-warning'
            }`}
          >
            {bus.status === 'Maintenance' && (
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
              </svg>
            )}
            {bus.status}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Selected Bus Profile Placeholder ──────────────── */
function BusProfile({ bus, onClose }: { bus: Bus; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-dark">Bus Profile</h2>
          <button onClick={onClose} className="text-bodytext hover:text-dark transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[10px] bg-primary/10 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="text-primary">
                <rect x="3" y="4" width="18" height="12" rx="2" />
                <path d="M3 12h18M7 20h10M9 16v4M15 16v4" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-dark">{bus.vehicleNo}</p>
              <p className="text-sm text-bodytext">{bus.make} {bus.model} &middot; {bus.year}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-lightgray rounded-[10px] p-4">
            {[
              ['Chassis No', bus.chassisNo],
              ['Engine No', bus.engineNo],
              ['Seats', bus.seats],
              ['Odometer', formatOdometer(bus.odometer)],
              ['Fuel Type', bus.fuelType],
              ['Status', bus.status],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <p className="text-[11px] text-bodytext uppercase tracking-wider font-medium">{String(label)}</p>
                <p className="text-sm font-semibold text-dark mt-0.5">{String(value)}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-bodytext text-center py-2 italic">
            Full profile with Documents tab, Expense history, and Fuel log coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Page ──────────────── */
export default function BusFleetPage() {
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);

  function handleAction(action: string, id: string) {
    if (action === 'View') setSelectedBusId(id);
    // Edit/Delete: future implementation
  }

  const selectedBus = DEMO_BUSES.find((b) => b.id === selectedBusId);
  const activeCount = DEMO_BUSES.filter((b) => b.status === 'Active').length;
  const maintenanceCount = DEMO_BUSES.filter((b) => b.status === 'Maintenance').length;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Bus Fleet</h1>
          <p className="text-sm text-bodytext mt-1">
            {DEMO_BUSES.length} vehicles &middot;{' '}
            <span className="text-success font-medium">{activeCount} Active</span> &middot;{' '}
            <span className="text-warning font-medium">{maintenanceCount} Maintenance</span>
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-[10px] hover:bg-primary/90 transition-colors shadow-sm">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Add Bus
        </button>
      </div>

      {/* Bus Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {DEMO_BUSES.map((bus) => (
          <BusCard
            key={bus.id}
            bus={bus}
            onAction={handleAction}
            onSelect={setSelectedBusId}
          />
        ))}
      </div>

      {/* Profile Modal */}
      {selectedBus && (
        <BusProfile bus={selectedBus} onClose={() => setSelectedBusId(null)} />
      )}
    </div>
  );
}
