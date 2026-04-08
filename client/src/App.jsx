import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './views/auth/Signup';
export default function App() { return (<BrowserRouter><main className="app-content" id="main-content"><Routes><Route path="/signup" element={<Signup />} /><Route path="*" element={<p>Page not found</p>} /></Routes></main></BrowserRouter>); }
