import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import OrderList from './pages/OrderList';
import OrderDetail from './pages/OrderDetail';
import OrderImport from './pages/OrderImport';
import AdvancedOrderImport from './pages/AdvancedOrderImport';
import ImportLogs from './pages/ImportLogs';
import FieldMappingTemplates from './pages/FieldMappingTemplates';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="container">
            <h1>訂單管理系統</h1>
            <nav>
              <NavLink to="/" end>首頁</NavLink>
              <NavLink to="/orders">訂單列表</NavLink>
              <NavLink to="/import">快速匯入</NavLink>
              <NavLink to="/advanced-import">進階匯入</NavLink>
              <NavLink to="/field-mapping">欄位映射</NavLink>
              <NavLink to="/import-logs">匯入記錄</NavLink>
            </nav>
          </div>
        </header>

        <main className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/import" element={<OrderImport />} />
            <Route path="/advanced-import" element={<AdvancedOrderImport />} />
            <Route path="/field-mapping" element={<FieldMappingTemplates />} />
            <Route path="/import-logs" element={<ImportLogs />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
