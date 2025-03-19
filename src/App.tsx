import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Edit from './pages/Edit';
import Delete from './pages/Delete';
import Redirect from './pages/Redirect';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/edit/:shortId" element={<Edit />} />
      <Route path="/delete/:shortId" element={<Delete />} />
      <Route path="/:shortId" element={<Redirect />} />
    </Routes>
  );
}

export default App;