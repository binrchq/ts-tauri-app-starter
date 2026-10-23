import React from 'react';
import ReactDOM from 'react-dom/client';
import '../src/input.css';
import './github.css';
import { GitHubDemo } from './GitHubDemo';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GitHubDemo />
  </React.StrictMode>,
);