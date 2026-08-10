import React, { useState } from 'react';
import { Search, Filter, Plus, FileText, Clock, Calendar } from 'lucide-react';

export default function RecordsView({ 
  records = [], 
  currencySymbol = '₱', 
  onSelectRecord, 
  onOpenAddModal 
}) {
  const [filterType, setFilterType] = useState('all'); // 'all', 'pautang', 'utang', 'unpaid', 'paid'
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = records.filter((r) => {
    // Type/Status filter
    if (filterType === 'pautang' && r.type !== 'pautang') return false;
    if (filterType === 'utang' && r.type !== 'utang') return false;
    if (filterType === 'unpaid' && r.status === 'paid') return false;
    if (filterType === 'paid' && r.status !== 'paid') return false;

    // Search query filter
    const q = searchTerm.toLowerCase();
    return (
      r.customerName.toLowerCase().includes(q) ||
      (r.category && r.category.toLowerCase().includes(q)) ||
      (r.notes && r.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={22} color="var(--brand-primary)" /> All Records
        </h2>
        <button className="action-chip primary" style={{ padding: '8px 14px' }} onClick={onOpenAddModal}>
          <Plus size={16} /> New Record
        </button>
      </div>

      {/* Search Bar */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search records by customer or category..."
            style={{ paddingLeft: '38px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['all', 'pautang', 'utang', 'unpaid', 'paid'].map((t) => (
          <button
            key={t}
            className={`action-chip ${filterType === t ? 'primary' : ''}`}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              minWidth: 'auto',
              textTransform: 'capitalize',
              background: filterType === t ? undefined : 'var(--bg-secondary)'
            }}
            onClick={() => setFilterType(t)}
          >
            {t === 'pautang' ? 'Pautang (Singilin)' : t === 'utang' ? 'Utang (Bayaran)' : t}
          </button>
        ))}
      </div>

      {/* Record List */}
      {filteredRecords.length === 0 ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
          <FileText size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>No matching records found.</p>
        </div>
      ) : (
        filteredRecords.map((r) => {
          const isPautang = r.type === 'pautang';
          const progressPct = Math.round(((r.amount - r.remainingAmount) / r.amount) * 100);

          return (
            <div 
              key={r.id} 
              className="glass-panel record-card"
              onClick={() => onSelectRecord(r)}
            >
              <div className="record-top">
                <div className="record-person">
                  <div className="person-avatar">
                    {r.customerName ? r.customerName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="person-info">
                    <span className="person-name">{r.customerName}</span>
                    <span className="record-category">{r.category}</span>
                  </div>
                </div>

                <div className="record-amount-tag">
                  <div className={`amount-main ${r.type}`}>
                    {currencySymbol}{r.remainingAmount.toLocaleString()}
                  </div>
                  <span className={`type-badge ${r.type}`}>
                    {isPautang ? 'Pautang' : 'Utang'}
                  </span>
                </div>
              </div>

              {r.amount !== r.remainingAmount && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>Paid: {currencySymbol}{(r.amount - r.remainingAmount).toLocaleString()}</span>
                    <span>Total: {currencySymbol}{r.amount.toLocaleString()}</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${progressPct}%` }}></div>
                  </div>
                </div>
              )}

              <div className="record-bottom">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} /> {new Date(r.date).toLocaleDateString()}
                </span>

                <span className={`status-tag ${r.status}`}>
                  {r.status.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
