import React, { useState, useEffect } from 'react';
import { X, CheckCircle, DollarSign, Clock, Calendar, Trash2, ShieldCheck, History } from 'lucide-react';
import confetti from 'canvas-confetti';
import { db, addPayment, deleteRecord } from '../db/db';

export default function RecordDetailsModal({ 
  isOpen, 
  onClose, 
  record, 
  currencySymbol = '₱', 
  onRecordUpdated 
}) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && record) {
      setPaymentAmount('');
      setPaymentNote('');
      // Load payment logs for this record
      db.payments
        .where('recordId')
        .equals(record.id)
        .reverse()
        .toArray()
        .then(setPaymentHistory)
        .catch(console.error);
    }
  }, [isOpen, record]);

  if (!isOpen || !record) return null;

  const isPautang = record.type === 'pautang';
  const progressPct = Math.round(((record.amount - record.remainingAmount) / record.amount) * 100);

  const handleMakePayment = async (e) => {
    e.preventDefault();
    const pAmt = parseFloat(paymentAmount);
    if (isNaN(pAmt) || pAmt <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }
    if (pAmt > record.remainingAmount) {
      alert(`Payment cannot exceed remaining balance of ${currencySymbol}${record.remainingAmount}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const { isFullyPaid } = await addPayment(record.id, pAmt, paymentNote);
      
      if (isFullyPaid) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      setPaymentAmount('');
      setPaymentNote('');
      if (onRecordUpdated) onRecordUpdated();
      onClose();
    } catch (err) {
      alert('Failed to record payment: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this utang record?')) {
      await deleteRecord(record.id);
      if (onRecordUpdated) onRecordUpdated();
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`type-badge ${record.type}`}>
              {isPautang ? 'Pautang (Singilin)' : 'Utang (Bayaran)'}
            </span>
            <span className={`status-tag ${record.status}`}>
              {record.status.toUpperCase()}
            </span>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Customer Header */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)' }}>
            {record.customerName}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{record.category}</p>
        </div>

        {/* Amount Summary Box */}
        <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Remaining Balance</span>
            <span style={{ fontWeight: 800, fontSize: '1.4rem', color: isPautang ? 'var(--pautang-green)' : 'var(--utang-red)' }}>
              {currencySymbol}{record.remainingAmount.toLocaleString()}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Original Total: {currencySymbol}{record.amount.toLocaleString()}</span>
            <span>{progressPct}% Paid</span>
          </div>

          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }}></div>
          </div>
        </div>

        {/* Auto Captured Date & Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', fontSize: '0.82rem' }}>
          <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} /> Created Date
            </span>
            <strong style={{ color: 'var(--text-bright)', display: 'block', marginTop: '2px' }}>
              {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </strong>
          </div>

          {record.dueDate && (
            <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> Target Due
              </span>
              <strong style={{ color: 'var(--text-bright)', display: 'block', marginTop: '2px' }}>
                {record.dueDate}
              </strong>
            </div>
          )}
        </div>

        {record.notes && (
          <div style={{ marginBottom: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <strong>Notes:</strong> {record.notes}
          </div>
        )}

        {/* Record Partial Payment Form */}
        {record.remainingAmount > 0 && (
          <form onSubmit={handleMakePayment} style={{ marginBottom: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DollarSign size={16} color="var(--pautang-green)" /> Record Payment Received / Made
            </h4>

            <div className="form-group">
              <input 
                type="number" 
                step="any"
                className="form-input"
                placeholder={`Payment Amount (${currencySymbol})`}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <input 
                type="text" 
                className="form-input"
                placeholder="Payment note (optional e.g. GCash transfer)"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <CheckCircle size={18} />
              {isSubmitting ? 'Processing Payment...' : 'Record Payment'}
            </button>
          </form>
        )}

        {/* Payment History Log */}
        {paymentHistory.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <History size={14} /> Payment History
            </h4>
            {paymentHistory.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: '6px', marginBottom: '6px', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--pautang-green)' }}>+{currencySymbol}{p.amount.toLocaleString()}</span>
                  {p.note && <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>({p.note})</span>}
                </div>
                <span style={{ color: 'var(--text-muted)' }}>{new Date(p.paymentDate).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}

        {/* Delete Record */}
        <button className="btn btn-danger" onClick={handleDelete} style={{ marginTop: '10px' }}>
          <Trash2 size={16} /> Delete Record
        </button>
      </div>
    </div>
  );
}
