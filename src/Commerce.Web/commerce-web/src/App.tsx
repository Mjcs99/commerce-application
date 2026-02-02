import { Routes, Route } from "react-router-dom";
import "./App.css";
import  Homepage from "./pages/Homepage.tsx";
import ProductsPage from "./pages/ProductsPage.tsx";
import ProductDetailsPage from "./pages/ProductDetailsPage.tsx";
import CheckoutPage from "./pages/CheckoutPage";
import { Navbar } from "./components/Nav/Navbar.tsx";
import { ShoppingCartProvider } from "./context/ShoppingCartContext.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import { msalInstance } from "./auth/msalConfig.ts";
import { RequireAuth } from "./auth/RequireAuth.tsx";
import { AuthBootstrap } from "./auth/Authbootstrap.ts";
import { MsalProvider } from "@azure/msal-react";
import OrderConfirmationPage from "./pages/OrderConfirmationPage.tsx";
export default function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <ShoppingCartProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/products">
            <Route index element={<ProductsPage />} />
            <Route path=":id" element={<ProductDetailsPage />} />
          </Route>
          <Route path="/checkout" element={
            <RequireAuth>
              <AuthBootstrap />
              <CheckoutPage />
            </RequireAuth>
          } />
          <Route path="/confirmation/:orderId" element={<OrderConfirmationPage />}/>
        </Routes>
      </ShoppingCartProvider>
    </MsalProvider>
  );
}