import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "./BestSellers.css";

type Product = {
  productId: string;
  name: string;
  priceAmount: number;
  primaryImageUrl?: string;
};

export default function BestSellers(){
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Remove later, use client, add best sellers logic server side
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/v1/products");

        if (!res.ok) {
          throw new Error(`Failed to load products (${res.status})`);
        }
        const data = await res.json();
        setProducts(data.items ?? []);
      } catch (err) {
        setError((err as Error).message);
      }
    }
    loadProducts();
    }, []);

    if (error) {
      return <p>{error}</p>;
    }
    return (
      <div className="bs-container">
      <header className="bs-header">
        <h3>Best Sellers</h3>
      </header>
      <div className="bs-products-container">
          
            {products.slice(0, 4).map((p) => (
            <div
                key={p.productId}
                className="product-card"
                onClick={() => navigate(`/products/${p.productId}`)}
            >
                {p.primaryImageUrl && (
                <div className="image-wrapper">
                    <img
                    className="product-image"
                    src={p.primaryImageUrl}
                    alt={p.name}
                    />
                </div>
                )}
                <div className="banner">
                    <h3>{p.name}</h3>
                    <p>${p.priceAmount}</p>
                    <button className="add-to-cart-btn"><span>Add to cart</span></button>
                </div>
            </div>
            ))}
        </div>
        </div>
    );
}