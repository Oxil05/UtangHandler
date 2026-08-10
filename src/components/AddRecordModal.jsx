import React, { useState, useEffect } from 'react';
import { X, Calendar, User, DollarSign, Tag, Clock, PlusCircle } from 'lucide-react';
import { addRecord } from '../db/db';

export default function AddRecordModal({ 
  isOpen, 
  onClose, 
  customers = [], 
  currencySymbol = '₱', 
  initialAmount = '', 
  onRecordAdded 
}) {
  const [customerName, setCustomerName] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [type, setType] = useState('pautang'); // 'pautang' (receivable) or 'utang' (payable)
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Cash Loan');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // Auto-captured date timestamp
  const [autoCapturedDate, setAutoCapturedDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialAmount) {
        setAmount(initialAmount.toString());
      } else {
        setAmount('');
      }
      // Capture current date and time automatically on open
      const now = new Date();
      setAutoCapturedDate(now.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }));
      setCustomerName('');
      setSelectedCustomerId('');
      setNotes('');
      setDueDate('');
    }
  }, [isOpen, initialAmount]);

  // When customer dropdown selection changes
  const handleSelectCustomer = (e) => {
    const val = e.target.value;
    setSelectedCustomerId(val);
    if (val) {
      const found = customers.find(c => c.id.toString() === val);
      if (found) setCustomerName(found.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please select or enter customer name');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setIsSubmitting(true);
      await addRecord({
        customerId: selectedCustomerId ? parseInt(selectedCustomerId, 10) : null,
        customerName: customerName.trim(),
        type,
        amount: parseFloat(amount),
        category,
        dueDate: dueDate || null,
        notes,
        customDate: new Date().toISOString() // Automatic timestamp saved
      });

      if (onRecordAdded) onRecordAdded();
      onClose();
    } catch (err) {
      alert('Failed to save record: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Record New Debt / Loan</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type Toggle */}
          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                className={`action-chip ${type === 'pautang' ? 'primary' : ''}`}
                style={{
                  background: type === 'pautang' ? 'var(--pautang-bg)' : 'var(--bg-primary)',
                  color: type === 'pautang' ? 'var(--pautang-green)' : 'var(--text-muted)',
                  border: type === 'pautang' ? '1px solid var(--pautang-border)' : '1px solid var(--border-color)',
                }}
                onClick={() => setType('pautang')}
              >
                Pautang (They Owe Me)
              </button>
              <button
                type="button"
                className={`action-chip ${type === 'utang' ? 'primary' : ''}`}
                style={{
                  background: type === 'utang' ? 'var(--utang-bg)' : 'var(--bg-primary)',
                  color: type === 'utang' ? 'var(--utang-red)' : 'var(--text-muted)',
                  border: type === 'utang' ? '1px solid var(--utang-border)' : '1px solid var(--border-color)',
                }}
                onClick={() => setType('utang')}
              >
                Utang (I Owe Them)
              </button>
            </div>
          </div>

          {/* Customer Selection or New Input */}
          <div className="form-group">
            <label className="form-label">Customer / Person Name</label>
            {customers.length > 0 && (
              <select 
                className="form-select" 
                value={selectedCustomerId} 
                onChange={handleSelectCustomer}
                style={{ marginBottom: '8px' }}
              >
                <option value="">-- Choose Existing Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                ))}
              </select>
            )}
            <input 
              type="text" 
              className="form-input"
              placeholder="Enter customer name..."
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setSelectedCustomerId('');
              }}
              required
            />
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label">Amount ({currencySymbol})</label>
            <input 
              type="number" 
              step="any"
              className="form-input"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Auto Captured Date Banner */}
          <div className="form-group" style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-accent)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <Clock size={16} color="var(--brand-primary)" />
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Date Auto-Recorded</span>
              <strong style={{ color: 'var(--text-bright)' }}>{autoCapturedDate}</strong>
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <select 
              className="form-select" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Cash Loan">Cash Loan</option>
              <option value="Groceries">Groceries</option>
              <option value="Food & Dining">Food & Dining</option>
              <option value="Bills & Utilities">Bills & Utilities</option>
              <option value="Emergency">Emergency</option>
              <option value="Business">Business</option>
              <option value="Personal">Personal</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Optional Due Date */}
          <div className="form-group">
            <label className="form-label">Target Due Date (Optional)</label>
            <input 
              type="date" 
              className="form-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes / Purpose (Optional)</label>
            <input 
              type="text"
              className="form-input"
              placeholder="e.g. For extra inventory stock"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            <PlusCircle size={18} />
            {isSubmitting ? 'Saving...' : `Save ${type === 'pautang' ? 'Pautang' : 'Utang'}`}
          </button>
        </form>
      </div>
    </div>
  );
}
