import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductDetails } from "../api/product/ProductsApiClient.ts";
import styles from "./ProductDetailsPage.module.css";
import ProductPurchaseInfo from "../components/ProductDetails/ProductPurchaseInfo.tsx";
import ProductGallery from "../components/ProductDetails/ProductGallery.tsx";
import type { ProductDetails } from "../types/Product";
export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetails>({
    productId: "",
    name: "",
    price: 0,
    images: [],
    description: ""
  });

  useEffect(() => {
    if (!id) return;
    const productId = id
    async function loadProduct() {
      try {
        const product = await getProductDetails(productId);
        console.log(product);
        if (!product) throw new Error(`Failed (product not found)`);
        setProduct(product);
      } 
      catch (e) {} 
      finally {}
    }
    loadProduct();
  }, [id]);

  return (
    <div className={styles.container}>
      <div className={styles.galleryAndInfoContainer}>
        <ProductGallery images={product.images}/>
        <ProductPurchaseInfo product={product} />
      </div>
    </div>
  );
}
