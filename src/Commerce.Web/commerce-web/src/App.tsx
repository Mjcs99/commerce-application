import { Routes, Route } from "react-router-dom";
import "./App.css";
import ProductDetailsPage from "./pages/ProductDetailsPage.tsx";
import  Homepage from "./pages/Homepage.tsx";
import { Navbar } from "./components/Nav/Navbar.tsx";
import ProductsPage from "./pages/ProductsPage.tsx"
import { ShoppingCartProvider } from "./context/ShoppingCartContext.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
export default function App() {
  return (
    <ShoppingCartProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/products">
          <Route index element={<ProductsPage />} />
          <Route path=":id" element={<ProductDetailsPage />} />
        </Route>
      </Routes>
    </ShoppingCartProvider>
  );
}