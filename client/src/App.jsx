import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CommerceProvider from './state/CommerceProvider';
import Signup from './views/auth/Signup';
import Signin from './views/auth/Signin';
import Home from './views/Home';
import Product from './views/product/Product';
import Saved from './views/Saved';
import Shops from './views/shop/Shops';
import Shop from './views/shop/Shop';
export default function App() { return (<CommerceProvider><BrowserRouter><main className="app-content" id="main-content"><Routes><Route path="/signup" element={<Signup />} />
<Route path="/signin" element={<Signin />} />
<Route path="/" element={<Home />} />
<Route path="/product/:productId" element={<Product />} />
<Route path="/saved" element={<Saved />} />
<Route path="/shops/all" element={<Shops />} />
<Route path="/shops/:shopId" element={<Shop />} /><Route path="*" element={<p>Page not found</p>} /></Routes></main></BrowserRouter></CommerceProvider>); }
