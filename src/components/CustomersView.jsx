import React, { useState } from 'react';
import { Users, UserPlus, Phone, Search, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { deleteCustomer } from '../db/db';

export default function CustomersView({ 
  customers = [], 
  records = [], 
  currencySymbol = '₱', 
  onOpenAddCustomer,
  onRefreshData
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate customer balance metrics
  const customerListWithBalances = customers.map((c) => {
    const customerRecords = records.filter(
      (r) => r.customerId === c.id || r.customerName?.toLowerCase() === c.name.toLowerCase()
    );
    const totalPautang = customerRecords
      .filter((r) => r.type === 'pautang')
      .reduce((sum, r) => sum + r.remainingAmount, 0);
    const totalUtang = customerRecords
      .filter((r) => r.type === 'utang')
      .reduce((sum, r) => sum + r.remainingAmount, 0);
    const netBalance = totalPautang - totalUtang;

    return {
      ...c,
      totalPautang,
      totalUtang,
      netBalance,
      recordCount: customerRecords.length
    };
  });

  const filteredCustomers = customerListWithBalances.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  const handleDelete = async (customerId, customerName) => {
    if (window.confirm(`Are you sure you want to delete customer "${customerName}" and all their associated records?`)) {
      await deleteCustomer(customerId);
      if (onRefreshData) onRefreshData();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={22} color="var(--brand-primary)" /> Customers & Directory
        </h2>
        <button className="action-chip primary" style={{ padding: '8px 14px' }} onClick={onOpenAddCustomer}>
          <UserPlus size={16} /> Set New Customer
        </button>
      </div>

      {/* Search Input */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search customer by name or phone..."
            style={{ paddingLeft: '38px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Customer Cards List */}
      {filteredCustomers.length === 0 ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
          <Users size={40} style={{ opacity: 0.4, marginBottom: '12px' }} />
          <p>No customers found.</p>
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '16px', display: 'inline-flex', width: 'auto' }}
            onClick={onOpenAddCustomer}
          >
            <UserPlus size={16} /> Add Your First Customer
          </button>
        </div>
      ) : (
        filteredCustomers.map((c) => (
          <div key={c.id} className="glass-panel record-card">
            <div className="record-top">
              <div className="record-person">
                <div className="person-avatar">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="person-info">
                  <span className="person-name">{c.name}</span>
                  {c.phone && (
                    <span className="record-category" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} /> {c.phone}
                    </span>
                  )}
                  {c.notes && <span className="record-category">{c.notes}</span>}
                </div>
              </div>

              <button 
                className="icon-btn" 
                style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)' }}
                onClick={() => handleDelete(c.id, c.name)}
                title="Delete customer"
              >
                <Trash2 size={16} color="var(--utang-red)" />
              </button>
            </div>

            <div className="record-bottom" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>They Owe Me</span>
                  <span style={{ color: 'var(--pautang-green)', fontWeight: 700 }}>{currencySymbol}{c.totalPautang.toLocaleString()}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>I Owe Them</span>
                  <span style={{ color: 'var(--utang-red)', fontWeight: 700 }}>{currencySymbol}{c.totalUtang.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <span className="type-badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-bright)' }}>
                  {c.recordCount} {c.recordCount === 1 ? 'Record' : 'Records'}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
