
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Quotes from './pages/Quotes';
import Invoices from './pages/Invoices';
import Products from './pages/Products';
import Settings from './pages/Settings';
import { DataProvider } from './context/DataContext';

function App() {
  return (
    <DataProvider>
      <Router>
        <div className="flex h-screen bg-slate-100">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/quotes" element={<Quotes />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/products" element={<Products />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </DataProvider>
  );
}

export default App;
