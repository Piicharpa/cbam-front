import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter} from 'react-router-dom';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <BrowserRouter basename='/cbam'>
  <BrowserRouter basename='/cbam' >
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </BrowserRouter> 
);
reportWebVitals();
