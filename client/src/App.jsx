import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
export default function App() { return (<BrowserRouter><main className="app-content" id="main-content"><Routes><Route path="*" element={<p>Page not found</p>} /></Routes></main></BrowserRouter>); }
