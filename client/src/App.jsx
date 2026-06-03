import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CommerceProvider from './state/CommerceProvider';
import PrivateRoute from './auth/PrivateRoute';
import Signup from './views/auth/Signup';
import Signin from './views/auth/Signin';
import Home from './views/Home';
import Product from './views/product/Product';
import Saved from './views/Saved';
import Shops from './views/shop/Shops';
import Shop from './views/shop/Shop';
import NewShop from './views/shop/NewShop';
import MyShops from './views/shop/MyShops';
import EditShop from './views/shop/EditShop';
import NewProduct from './views/product/NewProduct';
import EditProduct from './views/product/EditProduct';
import Cart from './cart/Cart';
import OrderReceipt from './views/order/OrderReceipt';
import ShopOrders from './views/shop/ShopOrders';
export default function App() { return (<CommerceProvider><BrowserRouter><main className="app-content" id="main-content"><Routes><Route path="/signup" element={<Signup />} />
<Route path="/signin" element={<Signin />} />
<Route path="/" element={<Home />} />
<Route path="/product/:productId" element={<Product />} />
<Route path="/saved" element={<Saved />} />
<Route path="/shops/all" element={<Shops />} />
<Route path="/shops/:shopId" element={<Shop />} />
<Route path="/seller/shop/new" element={<PrivateRoute sellerOnly={true}><NewShop /></PrivateRoute>} />
<Route path="/seller/shops" element={<PrivateRoute sellerOnly={true}><MyShops /></PrivateRoute>} />
<Route path="/seller/shop/edit/:shopId" element={<PrivateRoute sellerOnly={true}><EditShop /></PrivateRoute>} />
<Route path="/seller/:shopId/products/new" element={<PrivateRoute sellerOnly={true}><NewProduct /></PrivateRoute>} />
<Route path="/seller/:shopId/:productId/edit" element={<PrivateRoute sellerOnly={true}><EditProduct /></PrivateRoute>} />
<Route path="/cart" element={<Cart />} />
<Route path="/order/:orderId" element={<PrivateRoute><OrderReceipt /></PrivateRoute>} />
<Route path="/seller/orders/:shopId" element={<PrivateRoute sellerOnly={true}><ShopOrders /></PrivateRoute>} /><Route path="*" element={<p>Page not found</p>} /></Routes></main></BrowserRouter></CommerceProvider>); }
