import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { StockProvider } from './context/StockContext';

ReactDOM.render(
  <Router>
    <StockProvider>
      <App />
    </StockProvider>
  </Router>,
  document.getElementById('root')
);
