import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  UserPlus, 
  Calculator, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export default function DashboardView({ 
  records = [], 
  currencySymbol = '₱', 
  onOpenAddModal, 
  onOpenAddCustomer,
  onOpenCalculator,
  onSelectRecord 
}) {
  // Calculate Totals
  const activeRecords = records.filter(r => r.status !== 'paid');
  
  const totalPautang = activeRecords
    .filter(r => r.type === 'pautang')
    .reduce((sum, r) => sum + r.remainingAmount, 0);

  const totalUtang = activeRecords
    .filter(r => r.type === 'utang')
    .reduce((sum, r) => sum + r.remainingAmount, 0);

  const netBalance = totalPautang - totalUtang;

  // Overdue check
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueRecords = activeRecords.filter(r => r.dueDate && r.dueDate < todayStr);

  const recentRecords = [...records]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Overdue Warning Alert */}
      {overdueRecords.length > 0 && (
        <div className="offline-banner">
          <AlertTriangle size={18} color="#f59e0b" />
          <span>
            <strong>{overdueRecords.length} Overdue</strong> {overdueRecords.length === 1 ? 'record requires' : 'records require'} attention!
          </span>
        </div>
      )}

      {/* Net Balance Card */}
      <div className="net-balance-card">
        <div className="balance-header">Net Collectible Balance</div>
        <div className="balance-amount" style={{ color: netBalance >= 0 ? 'var(--pautang-green)' : 'var(--utang-red)' }}>
          {currencySymbol} {netBalance.toLocaleString()}
        </div>

        <div className="balance-row">
          <div className="balance-stat">
            <div className="stat-label">
              <ArrowUpRight size={14} color="var(--pautang-green)" /> Singilin (Pautang)
            </div>
            <div className="stat-val pautang">
              {currencySymbol}{totalPautang.toLocaleString()}
            </div>
          </div>

          <div className="balance-stat">
            <div className="stat-label">
              <ArrowDownLeft size={14} color="var(--utang-red)" /> Bayaran (Utang)
            </div>
            <div className="stat-val utang">
              {currencySymbol}{totalUtang.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="quick-actions-bar">
        <button className="action-chip primary" onClick={onOpenAddModal}>
          <Plus size={18} /> Add Entry
        </button>

        <button className="action-chip" onClick={onOpenAddCustomer}>
          <UserPlus size={18} color="var(--brand-primary)" /> Customer
        </button>

        <button className="action-chip" onClick={onOpenCalculator}>
          <Calculator size={18} color="#f59e0b" /> Calculator
        </button>
      </div>

      {/* Recent Activity Feed */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-bright)' }}>
          Recent Transactions
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{records.length} Total</span>
      </div>

      {recentRecords.length === 0 ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
          <TrendingUp size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>No records created yet.</p>
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '16px', display: 'inline-flex', width: 'auto' }}
            onClick={onOpenAddModal}
          >
            <Plus size={16} /> Record First Utang
          </button>
        </div>
      ) : (
        recentRecords.map((r) => {
          const isPautang = r.type === 'pautang';
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
