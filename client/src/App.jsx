import BackLink from "./components/BackLink";
import React from "react";
import RouteBoundary from "./components/RouteBoundary";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ImageFilters from "./components/ImageFilters";
import CommerceProvider from "./state/CommerceProvider";
import PrivateRoute from "./auth/PrivateRoute";
import Profile from "./views/user/Profile";
import EditProfile from "./views/user/EditProfile";
import Shops from "./views/shop/Shops";
import Shop from "./views/shop/Shop";
import MyShops from "./views/shop/MyShops";
import EditShop from "./views/shop/EditShop";
import Product from "./views/product/Product";
import EditProduct from "./views/product/EditProduct";
import Cart from "./cart/Cart";
import OrderReceipt from "./views/order/OrderReceipt";
import ShopOrders from "./views/shop/ShopOrders";
import StripeConnect from "./views/user/StripeConnect";
import OpenAuctions from "./views/auction/OpenAuctions";
import Auction from "./views/auction/Auction";
import MyAuctions from "./views/auction/MyAuctions";
import Signin from "./views/auth/Signin";
import Signup from "./views/auth/Signup";
import NewShop from "./views/shop/NewShop";
import NewProduct from "./views/product/NewProduct";
import NewAuction from "./views/auction/NewAuction";
import EditAuction from "./views/auction/EditAuction";
import Saved from "./views/Saved";
import Guide from "./views/Guide";

// Views
import Home from "./views/Home";

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
                          <p>
                            There are still plenty of good things to discover.
                          </p>
                          <BackLink to="/">Back to Discover</BackLink>
                        </div>
                      </div>
                    }
                  />
              </Routes>
            </RouteBoundary>
          </main>
        </div>
      </BrowserRouter>
    </CommerceProvider>
  );
}
