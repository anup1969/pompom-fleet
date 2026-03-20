'use client';

import { useState, useRef, useEffect } from 'react';

/* ─── Demo Data ─── */
const BUSES = [
  { id: 1, vehicleNo: 'GJ-01-TX-5501', make: 'Tata Starbus', chassis: 'MAT449001', engine: 'ENG880101', seats: 52, odometer: '38,200 km', passingDue: '11 Apr 2026', pucDue: '15 Jun 2026', serviceDue: '40,000 km', status: 'Active', statusBadge: 'badge-success' },
  { id: 2, vehicleNo: 'GJ-01-TX-5502', make: 'Ashok Leyland Lynx', chassis: 'MAT449002', engine: 'ENG880102', seats: 48, odometer: '42,100 km', passingDue: '23 May 2026', pucDue: 'Expired!', pucExpired: true, serviceDue: '44,000 km', status: 'PUC Due', statusBadge: 'badge-warning' },
  { id: 3, vehicleNo: 'GJ-01-TX-5503', make: 'Eicher Skyline', chassis: 'MAT449003', engine: 'ENG880103', seats: 40, odometer: '55,800 km', passingDue: '19 Jul 2026', pucDue: '20 Aug 2026', serviceDue: '58,000 km', status: 'Active', statusBadge: 'badge-success' },
  { id: 4, vehicleNo: 'GJ-01-TX-5504', make: 'Force Traveller', chassis: 'MAT449004', engine: 'ENG880104', seats: 26, odometer: '29,400 km', passingDue: '5 Sep 2026', pucDue: '12 Nov 2026', serviceDue: '32,000 km', status: 'Active', statusBadge: 'badge-success' },
  { id: 5, vehicleNo: 'GJ-01-TX-5505', make: 'Tata Starbus', chassis: 'MAT449005', engine: 'ENG880105', seats: 52, odometer: '61,200 km', passingDue: '30 Jun 2026', pucDue: '18 Sep 2026', serviceDue: '64,000 km', status: 'Active', statusBadge: 'badge-success' },
  { id: 6, vehicleNo: 'GJ-01-TX-5507', make: 'Ashok Leyland Lynx', chassis: 'MAT449007', engine: 'ENG880107', seats: 48, odometer: '44,200 km', passingDue: '14 Aug 2026', pucDue: '22 Oct 2026', serviceDue: '45,000 km', status: 'Service Soon', statusBadge: 'badge-warning' },
];

/* ─── Action Menu Component ─── */
function ActionMenu({ busVehicleNo, onView }: { busVehicleNo: string; onView: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="action-wrap" ref={ref}>
      <button className="btn-icon" onClick={() => setOpen(!open)}>&#8942;</button>
      <div className={`action-menu${open ? ' show' : ''}`}>
        <button onClick={() => { onView(busVehicleNo); setOpen(false); }}>&#128065; View</button>
        <button onClick={() => setOpen(false)}>&#9998; Edit</button>
        <button className="danger" onClick={() => setOpen(false)}>&#128465; Delete</button>
      </div>
    </div>
  );
}

export default function BusFleetPage() {
  function handleView(vehicleNo: string) {
    // In production, this would open a bus profile modal
    alert(`View bus profile: ${vehicleNo}`);
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Bus Fleet</h3>
        <button className="btn btn-primary btn-sm">+ Add Bus</button>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Vehicle No</th>
                <th>Make / Model</th>
                <th>Chassis No</th>
                <th>Engine No</th>
                <th>Seats</th>
                <th>Odometer</th>
                <th>Passing Due</th>
                <th>PUC Due</th>
                <th>Service Due</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {BUSES.map((bus) => (
                <tr key={bus.id}>
                  <td>{bus.id}</td>
                  <td>
                    <a className="clickable-link" onClick={() => handleView(bus.vehicleNo)}>
                      {bus.vehicleNo}
                    </a>
                  </td>
                  <td>{bus.make}</td>
                  <td>{bus.chassis}</td>
                  <td>{bus.engine}</td>
                  <td>{bus.seats}</td>
                  <td>{bus.odometer}</td>
                  <td>{bus.passingDue}</td>
                  <td>
                    {bus.pucExpired ? (
                      <span style={{ color: 'var(--error)', fontWeight: 600 }}>Expired!</span>
                    ) : (
                      bus.pucDue
                    )}
                  </td>
                  <td>{bus.serviceDue}</td>
                  <td>
                    <span className={`badge ${bus.statusBadge}`}>{bus.status}</span>
                  </td>
                  <td>
                    <ActionMenu busVehicleNo={bus.vehicleNo} onView={handleView} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
