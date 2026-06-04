import React from 'react';
import ReactDOM from 'react-dom/client';
import Homepage from './Homepage'; // This loads your responsive homepage layout first
import './index.css'; // Connects your global Tailwind background styling sheets

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Homepage />
  </React.StrictMode>
);
