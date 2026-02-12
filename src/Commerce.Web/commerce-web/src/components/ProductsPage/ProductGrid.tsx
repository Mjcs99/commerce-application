import styles from "./ProductGrid.module.css";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getProducts } from "../../api/product/ProductsApiClient.ts";
import type { ProductSummary } from "../../types/Product";

export default function ProductGrid(){
    const location = useLocation();
    const navigate = useNavigate();
    const [products, setProducts] = useState<ProductSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
  let cancelled = false;

  (async () => {
    const params = new URLSearchParams(location.search);
    try {
      setLoading(true);

      const items = (await getProducts(params.toString() ? params : undefined)).items;

      if (!cancelled) setProducts(items);
    } catch (e) {
      console.error("Failed to load products", e);
      if (!cancelled) setError("Our services are unavailible at at the moment. Please try again later.");
    } finally {
      if (!cancelled) setLoading(false);
    }
  })();

  return () => {
    cancelled = true;
  };
}, [location.search]);

    return (
    <div className={styles.container}>
    <div
  className={[
    styles.gridContainer,
    loading ? styles.loading : "",
    error ? styles.hide : "",
  ].filter(Boolean).join(" ")}
>
        {products.map(p => 
            <div className={styles.productCard} onClick={() => navigate("/products/" + p.productId)} key={p.productId}>
                <img src={p.primaryImageUrl} />
                <p>{p.name}</p>
                <p>{p.priceAmount}</p>
            </div>
        )}
    </div>
    {/* Fix loading state later */}
    {loading && (
  <div className={styles.loadingOverlay} aria-live="polite">
    <div className={styles.spinner} />
  </div>
)}
      {error && <div className="errorBanner">{error}</div>}
      </div>
    )
}