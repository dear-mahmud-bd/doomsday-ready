import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout.js';
import { MoviesPage } from './pages/MoviesPage.js';
import { RewatchPage } from './pages/RewatchPage.js';
import { BookingPage } from './pages/BookingPage.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/movies" replace />} />
          <Route path="movies" element={<MoviesPage />} />
          <Route path="rewatch" element={<RewatchPage />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="*" element={<Navigate to="/movies" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
