import React, { useState } from 'react';
import { X, UserPlus, Phone, FileText } from 'lucide-react';
import { addCustomer } from '../db/db';

export default function CustomerModal({ isOpen, onClose, onCustomerAdded }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter customer name');
      return;
    }

    try {
      setIsSubmitting(true);
      await addCustomer(name.trim(), phone.trim(), notes.trim());
      setName('');
      setPhone('');
      setNotes('');
      if (onCustomerAdded) onCustomerAdded();
      onClose();
    } catch (err) {
      alert('Failed to add customer: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={20} color="var(--brand-primary)" /> Set New Customer
          </h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Customer Name</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="e.g. Maria Santos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number (Optional)</label>
            <input 
              type="tel" 
              className="form-input"
              placeholder="0917XXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="e.g. Neighbor, Suki store owner"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving Customer...' : 'Save New Customer'}
          </button>
        </form>
      </div>
    </div>
  );
}
