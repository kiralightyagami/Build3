import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { Home } from './pages/Home';
import { Builder } from './pages/Builder';
import { AppProvider } from './context/AppContext';
import './index.css';

function App() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return (
    <AppProvider>
      <BrowserRouter>
        {isProduction && <Analytics />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/builder" element={<Builder />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
