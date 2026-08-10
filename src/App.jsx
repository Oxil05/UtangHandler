import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db/db';

import Header from './components/Header';
import BottomNav from './components/BottomNav';
import DashboardView from './components/DashboardView';
import RecordsView from './components/RecordsView';
import CustomersView from './components/CustomersView';
import CalculatorView from './components/CalculatorView';
import SettingsView from './components/SettingsView';

import AddRecordModal from './components/AddRecordModal';
import RecordDetailsModal from './components/RecordDetailsModal';
import CustomerModal from './components/CustomerModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('utang_theme') || 'dark');
  const [currencySymbol, setCurrencySymbol] = useState('₱');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [calcInitialAmount, setCalcInitialAmount] = useState('');

  // Real-time Dexie queries
  const records = useLiveQuery(() => db.records.toArray(), []) || [];
  const customers = useLiveQuery(() => db.customers.toArray(), []) || [];

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('utang_theme', theme);
  }, [theme]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleApplyCalculatorAmount = (amountVal) => {
    setCalcInitialAmount(amountVal);
    setIsAddModalOpen(true);
  };

  return (
    <div id="root">
      <Header 
        isOnline={isOnline} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />

      <main className="app-content">
        {activeTab === 'dashboard' && (
          <DashboardView
            records={records}
            currencySymbol={currencySymbol}
            onOpenAddModal={() => {
              setCalcInitialAmount('');
              setIsAddModalOpen(true);
            }}
            onOpenAddCustomer={() => setIsCustomerModalOpen(true)}
            onOpenCalculator={() => setActiveTab('calculator')}
            onSelectRecord={(rec) => setSelectedRecord(rec)}
          />
        )}

        {activeTab === 'records' && (
          <RecordsView
            records={records}
            currencySymbol={currencySymbol}
            onSelectRecord={(rec) => setSelectedRecord(rec)}
            onOpenAddModal={() => {
              setCalcInitialAmount('');
              setIsAddModalOpen(true);
            }}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersView
            customers={customers}
            records={records}
            currencySymbol={currencySymbol}
            onOpenAddCustomer={() => setIsCustomerModalOpen(true)}
          />
        )}

        {activeTab === 'calculator' && (
          <CalculatorView
            currencySymbol={currencySymbol}
            onApplyToUtang={handleApplyCalculatorAmount}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            currencySymbol={currencySymbol}
            setCurrencySymbol={setCurrencySymbol}
          />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setCalcInitialAmount('');
          setIsAddModalOpen(true);
        }}
      />

      {/* Add Record Modal */}
      <AddRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        customers={customers}
        currencySymbol={currencySymbol}
        initialAmount={calcInitialAmount}
      />

      {/* Record Details & Partial Payment Modal */}
      <RecordDetailsModal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        record={selectedRecord}
        currencySymbol={currencySymbol}
      />

      {/* Add Customer Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
      />
    </div>
  );
}
