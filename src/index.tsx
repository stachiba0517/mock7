import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import SubsidyApp from './SubsidyApp';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <SubsidyApp />
  </React.StrictMode>
);