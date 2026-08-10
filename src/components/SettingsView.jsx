import React, { useRef } from 'react';
import { Settings, Download, Upload, Trash2, Globe, Database, ShieldCheck } from 'lucide-react';
import { exportDatabaseJSON, importDatabaseJSON, db } from '../db/db';

export default function SettingsView({ 
  currencySymbol, 
  setCurrencySymbol, 
  onRefreshData 
}) {
  const fileInputRef = useRef(null);

  const handleExportBackup = async () => {
    try {
      const jsonStr = await exportDatabaseJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `UtangHandler_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export backup: ' + err.message);
    }
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        await importDatabaseJSON(event.target.result);
        alert('Database restored successfully!');
        if (onRefreshData) onRefreshData();
      } catch (err) {
        alert('Failed to import backup: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleClearDatabase = async () => {
    if (window.confirm('WARNING: Are you sure you want to erase ALL customers, debts, and payment records? This action cannot be undone!')) {
      await db.customers.clear();
      await db.records.clear();
      await db.payments.clear();
      alert('Database cleared.');
      if (onRefreshData) onRefreshData();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Settings size={22} color="var(--brand-primary)" /> App Settings & Backup
      </h2>

      {/* Currency Preference */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={18} color="var(--brand-primary)" /> Currency Symbol
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {['₱', '$', '€', '¥', '£'].map((sym) => (
            <button
              key={sym}
              className={`calc-btn ${currencySymbol === sym ? 'equals' : ''}`}
              style={{ padding: '10px 0', fontSize: '1.1rem' }}
              onClick={() => setCurrencySymbol(sym)}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* Database Backup & Restore */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={18} color="var(--pautang-green)" /> Local Offline Database
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Your data is stored 100% locally inside your device browser's IndexedDB. You can export a JSON backup file anytime to sync or transfer to another phone.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button className="btn btn-primary" onClick={handleExportBackup}>
            <Download size={18} /> Export JSON Backup
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".json" 
            style={{ display: 'none' }} 
            onChange={handleImportBackup}
          />
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={18} /> Restore from JSON Backup
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', borderColor: 'var(--utang-border)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--utang-red)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trash2 size={18} color="var(--utang-red)" /> Clear Data
        </h3>
        <button className="btn btn-danger" onClick={handleClearDatabase}>
          Clear All App Data
        </button>
      </div>

      {/* App Info Footer */}
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '10px' }}>
        <ShieldCheck size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
        UtangHandler PWA v1.0 • Offline Ready
      </div>
    </div>
  );
}
