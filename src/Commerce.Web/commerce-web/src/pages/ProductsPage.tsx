import ProductGrid from "../features/ProductsPage/ProductGrid.tsx";
import ProductMenu from "../features/ProductsPage/ProductMenu.tsx";
import "./ProductsPage.css"
export default function ProductsPage(){
    return (
    <div className="products-page-container">
        <div className="menu-grid-container">
            <ProductMenu />
            <ProductGrid />
        </div>
    </div>);
}