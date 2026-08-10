import React from 'react';
import { LayoutDashboard, FileText, Users, Calculator, PieChart, Settings, Plus } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, onOpenAddModal }) {
  return (
    <nav className="bottom-nav">
      <button 
        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
      >
        <LayoutDashboard size={20} />
        <span>Home</span>
      </button>

      <button 
        className={`nav-item ${activeTab === 'records' ? 'active' : ''}`}
        onClick={() => setActiveTab('records')}
      >
        <FileText size={20} />
        <span>Records</span>
      </button>

      <button 
        className="fab-btn" 
        onClick={onOpenAddModal}
        title="Add New Utang / Pautang"
      >
        <Plus size={28} />
      </button>

      <button 
        className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
        onClick={() => setActiveTab('customers')}
      >
        <Users size={20} />
        <span>Customers</span>
      </button>

      <button 
        className={`nav-item ${activeTab === 'calculator' ? 'active' : ''}`}
        onClick={() => setActiveTab('calculator')}
      >
        <Calculator size={20} />
        <span>Calc</span>
      </button>
    </nav>
  );
}
