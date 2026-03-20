'use client';

import { useState } from 'react';

/* ──────────────── Demo Data ──────────────── */
interface Vendor {
  id: number;
  name: string;
  contact: string;
  phone: string;
  type: string;
  typeBadge: string;
  company: string;
  gst: string;
  address: string;
}

const DEMO_VENDORS: Vendor[] = [
  { id: 1, name: 'Sharma Auto Works', contact: 'Rajesh Sharma', phone: '98250 34501', type: 'Mechanic', typeBadge: 'badge-info', company: 'Sharma Auto Works', gst: '24AABCS1234F1Z5', address: 'Nr. Isanpur Cross Rd, Ahmedabad' },
  { id: 2, name: 'HP Isanpur Fuel Point', contact: 'Kirit Patel', phone: '98250 34502', type: 'Fuel Station', typeBadge: 'badge-warning', company: 'HP Petroleum', gst: '24AABHP5678G1Z8', address: 'Isanpur Highway, Ahmedabad' },
  { id: 3, name: 'Patel Tyre House', contact: 'Nilesh Patel', phone: '98250 34503', type: 'Parts Dealer', typeBadge: 'badge-primary', company: 'Patel Tyre House', gst: '24AABPT9012H1Z3', address: 'Narol Circle, Ahmedabad' },
  { id: 4, name: 'New India Assurance \u2014 Navrangpura', contact: 'Hemant Joshi', phone: '98250 34504', type: 'Insurance Agent', typeBadge: 'badge-success', company: 'New India Assurance Co.', gst: '24AABNI3456J1Z1', address: 'Navrangpura, Ahmedabad' },
  { id: 5, name: 'Mehta RTO Consultancy', contact: 'Suresh Mehta', phone: '98250 34505', type: 'RTO Agent', typeBadge: 'badge-accent', company: 'Mehta Consultancy', gst: '24AABMC7890K1Z6', address: 'Subhash Bridge, Ahmedabad' },
  { id: 6, name: 'City Towing Services', contact: 'Bharat Gohil', phone: '98250 34506', type: 'Towing', typeBadge: 'badge-error', company: 'City Towing Pvt Ltd', gst: '24AABCT2345L1Z9', address: 'Paldi, Ahmedabad' },
];

export default function VendorsPage() {
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  return (
    <div className="card">
      <div className="card-header">
        <h3>Vendor Directory</h3>
        <button className="btn btn-primary btn-sm">+ Add Vendor</button>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Vendor Name</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Company</th>
                <th>GST No</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_VENDORS.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td style={{ fontWeight: 600 }}>{v.name}</td>
                  <td>{v.contact}</td>
                  <td>
                    <a href={`tel:+91${v.phone.replace(/\s/g, '')}`} style={{ color: 'var(--success)', fontWeight: 500 }}>
                      {v.phone}
                    </a>
                  </td>
                  <td>
                    <span className={`badge ${v.typeBadge}`}>{v.type}</span>
                  </td>
                  <td>{v.company}</td>
                  <td>{v.gst}</td>
                  <td>{v.address}</td>
                  <td>
                    <div className="action-wrap">
                      <button
                        className="btn-icon"
                        onClick={() => setOpenMenu(openMenu === v.id ? null : v.id)}
                      >
                        &#8942;
                      </button>
                      <div className={`action-menu${openMenu === v.id ? ' show' : ''}`}>
                        <button onClick={() => setOpenMenu(null)}>&#9998; Edit</button>
                        <button className="danger" onClick={() => setOpenMenu(null)}>
                          {'\uD83D\uDDD1'} Delete
                        </button>
                      </div>
                    </div>
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
