import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CommerceProvider from './state/CommerceProvider';
import Signup from './views/auth/Signup';
import Signin from './views/auth/Signin';
export default function App() { return (<CommerceProvider><BrowserRouter><main className="app-content" id="main-content"><Routes><Route path="/signup" element={<Signup />} />
<Route path="/signin" element={<Signin />} /><Route path="*" element={<p>Page not found</p>} /></Routes></main></BrowserRouter></CommerceProvider>); }
