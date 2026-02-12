import { Routes, Route } from "react-router-dom";
import "./App.css";
import Homepage from "./pages/Homepage.tsx";
import About from "./pages/About.tsx";
import ProductsPage from "./pages/ProductsPage.tsx";
import ProductDetailsPage from "./pages/ProductDetailsPage.tsx";
import CheckoutPage from "./pages/CheckoutPage";
import AccountPage from "./pages/AccountPage";
import OrdersPage from "./pages/OrdersPage.tsx";
import Profile from "./pages/Profile.tsx";
import OrderDetailsPage from "./pages/OrderDetailsPage.tsx";
import { Navbar } from "./components/Nav/Navbar.tsx";
import { ShoppingCartProvider } from "./context/ShoppingCartContext.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import { msalInstance } from "./auth/msalConfig.ts";
import { RequireAuth } from "./auth/RequireAuth.tsx";
import { MsalProvider } from "@azure/msal-react";
import OrderConfirmationPage from "./pages/OrderConfirmationPage.tsx";
import AuthBootstrap from "./auth/Authbootstrap.ts";

export default function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthBootstrap/>
      <ShoppingCartProvider>
        <Navbar />

        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/about" element={<About />} />

          <Route path="/products">
            <Route index element={<ProductsPage />} />
            <Route path=":id" element={<ProductDetailsPage />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route path="/account">
              <Route index element={<AccountPage />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="/orders">
              <Route index element={<OrdersPage />} />
              <Route path=":orderId/confirmation" element={<OrderConfirmationPage />} />
              <Route path=":orderId" element={<OrderDetailsPage />} />
            </Route>

            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>

        </Routes>
      </ShoppingCartProvider>
    </MsalProvider>
  );
}
