import BackLink from './components/BackLink';
import React, { lazy, Suspense } from 'react';
import RouteBoundary from './components/RouteBoundary';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import ImageFilters from './components/ImageFilters';
import CommerceProvider from './state/CommerceProvider';
import PrivateRoute from './auth/PrivateRoute';

// Views
import Home from './views/Home';
const Signin = lazy(() => import('./views/auth/Signin'));
const Signup = lazy(() => import('./views/auth/Signup'));
const Profile = lazy(() => import('./views/user/Profile'));
const EditProfile = lazy(() => import('./views/user/EditProfile'));

// Shop Views
const Shops = lazy(() => import('./views/shop/Shops'));
const Shop = lazy(() => import('./views/shop/Shop'));
const MyShops = lazy(() => import('./views/shop/MyShops'));
const NewShop = lazy(() => import('./views/shop/NewShop'));
const EditShop = lazy(() => import('./views/shop/EditShop'));

// Product Views
const Product = lazy(() => import('./views/product/Product'));
const NewProduct = lazy(() => import('./views/product/NewProduct'));
const EditProduct = lazy(() => import('./views/product/EditProduct'));

// Cart & Order Views
const Cart = lazy(() => import('./cart/Cart'));
const OrderReceipt = lazy(() => import('./views/order/OrderReceipt'));
const ShopOrders = lazy(() => import('./views/shop/ShopOrders'));
const StripeConnect = lazy(() => import('./views/user/StripeConnect'));

// Auction Views
const OpenAuctions = lazy(() => import('./views/auction/OpenAuctions'));
const Auction = lazy(() => import('./views/auction/Auction'));
const MyAuctions = lazy(() => import('./views/auction/MyAuctions'));
const NewAuction = lazy(() => import('./views/auction/NewAuction'));
const EditAuction = lazy(() => import('./views/auction/EditAuction'));
const Saved = lazy(() => import('./views/Saved'));
const Guide = lazy(() => import('./views/Guide'));

function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <CommerceProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ImageFilters />
        <Navbar />
        <div className="app-content">
          <main id="main-content" className="route-content" tabIndex={-1}>
            <RouteBoundary>
              <Suspense
                fallback={
                  <div className="page-container" role="status" aria-busy="true">
                    Loading page
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/saved" element={<Saved />} />
                  <Route path="/guide" element={<Guide />} />
                  <Route path="/signin" element={<Signin />} />
                  <Route path="/signup" element={<Signup />} />

                  {/* User Profile */}
                  <Route
                    path="/user/:userId"
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/user/edit/:userId"
                    element={
                      <PrivateRoute>
                        <EditProfile />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/seller/stripe/connect"
                    element={
                      <PrivateRoute>
                        <StripeConnect />
                      </PrivateRoute>
                    }
                  />

                  {/* Public Shops & Products */}
                  <Route path="/shops/all" element={<Shops />} />
                  <Route path="/shops/:shopId" element={<Shop />} />
                  <Route path="/product/:productId" element={<Product />} />

                  {/* Auctions */}
                  <Route path="/auctions/all" element={<OpenAuctions />} />
                  <Route path="/auction/:auctionId" element={<Auction />} />

                  {/* Shopping Cart & Orders */}
                  <Route path="/cart" element={<Cart />} />
                  <Route
                    path="/order/:orderId"
                    element={
                      <PrivateRoute>
                        <OrderReceipt />
                      </PrivateRoute>
                    }
                  />

                  {/* Seller Protected Routes */}
                  <Route
                    path="/seller/shops"
                    element={
                      <PrivateRoute sellerOnly={true}>
                        <MyShops />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/seller/shop/new"
                    element={
                      <PrivateRoute sellerOnly={true}>
                        <NewShop />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/seller/shop/edit/:shopId"
                    element={
                      <PrivateRoute sellerOnly={true}>
                        <EditShop />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/seller/:shopId/products/new"
                    element={
                      <PrivateRoute sellerOnly={true}>
                        <NewProduct />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/seller/:shopId/:productId/edit"
                    element={
                      <PrivateRoute sellerOnly={true}>
                        <EditProduct />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/seller/orders/:shopId"
                    element={
                      <PrivateRoute sellerOnly={true}>
                        <ShopOrders />
                      </PrivateRoute>
                    }
                  />

                  {/* Seller Auction Protected Routes */}
                  <Route
                    path="/myauctions"
                    element={
                      <PrivateRoute sellerOnly={true}>
                        <MyAuctions />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/auction/new"
                    element={
                      <PrivateRoute sellerOnly={true}>
                        <NewAuction />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/auction/edit/:auctionId"
                    element={
                      <PrivateRoute sellerOnly={true}>
                        <EditAuction />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <div className="page-container">
                        <div className="empty-state">
                          <h1>That page wandered off.</h1>
                          <p>There are still plenty of good things to discover.</p>
                          <BackLink to="/">Back to Discover</BackLink>
                        </div>
                      </div>
                    }
                  />
                </Routes>
              </Suspense>
            </RouteBoundary>
          </main>
          <footer className="app-footer">
            <div>
              <Link to="/" className="footer-brand">
                vendora.
              </Link>
              <span>A world of good finds.</span>
            </div>
            <div>
              <Link to="/shops/all">Explore shops</Link>
              <Link to="/guide">Getting started</Link>
              <span>© {new Date().getFullYear()} Vendora</span>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </CommerceProvider>
  );
}
