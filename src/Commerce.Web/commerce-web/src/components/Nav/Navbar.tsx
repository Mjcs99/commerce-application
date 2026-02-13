import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from "../../../public/UrbanthreadLogo.svg";
import brand from "../../../public/UrbanthreadBrand.svg"
import { useShoppingCart } from "../../context/ShoppingCartContext";
export function Navbar() {
  const [linksOpen, setLinksOpen] = useState(false);
  const [warning, setWarning] = useState(true);
  const { openCart, cartQuantity} = useShoppingCart();
  const quantity = cartQuantity ?? 0
  return (
    <header className="nav">
      {warning && (
        <div className="nav-top">
          <h5>
            Due to a temporary supply shortage, some orders may experience a
            slight processing delay. We appreciate your patience.
          </h5>

          <button
            className="dismissBtn"
            onClick={() => setWarning(false)}
          >
            <span>X</span>
          </button>
        </div>
      )}

      <div className="nav-middle">    
        <div className="nav-middle-dropdown">
            
            <button onClick={() => {setLinksOpen(!linksOpen)}} className="nav-middle-dropdown">
                <span className={`chev ${linksOpen ? "chevOpen" : ""}`}>
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true">
                        <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        />
                    </svg>
                </span>
            </button>
            {linksOpen && 
            (<div className="nav-middle-links-drop-down">
                <Link className="navLink-dropdown" to="/about">
                    About Us
                </Link>
                <Link className="navLink-dropdown" to="/account">
                    My account
                </Link>
                <Link className="navLink-dropdown" to="/wishlist">
                    Wishlist
                </Link>
                <Link className="navLink-dropdown" to="/tracking">
                    Order Tracking
                </Link>
            </div>
        )}
        </div>
        <Link to="/">
          <img className="nav-bottom-logo" src={brand} />  
        </Link>
        <nav className="middle-links">
          <Link className="navLink" to="/account">
            My Account
          </Link>
          <Link className="navLink" to="/orders">
            My Orders
          </Link>
          <Link className="navLink" to="/about">
            About Us
          </Link>
        </nav>

        <div className="nav-middle-info">
          <span>
            <strong>100%</strong>
            <span className="accent">Secure</span>
            <span>transactions with diverse payment options</span>
          </span>

          <span>
            <span>Need help?</span>
            <span className="muted">Call Us:</span>
            <span className="accent">+403 500-8888</span>
          </span>

        </div>
      </div>

      <div className="nav-bottom">
        <div className="logo-searchbar-container">
          <div className="logo-link-container">
            <img className="nav-bottom-logo" src={logo} />
            <Link to="/products" className="shop-products-link">Shop All Products</Link>
          </div>
          <div className="search-bar">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M21 21l-4.35-4.35m1.85-5.65a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <input
              type="search"
              placeholder="Search products..."
            />
          </div>
        </div>
        
        <button className="nav-bottom-cart-button" onClick={openCart}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13V19C7 19.5523 7.44772 20 8 20H16C16.5523 20 17 19.5523 17 19V13M9 9V8C9 6.89543 9.89543 6 11 6H13C14.1046 6 15 6.89543 15 8V9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {quantity > 0 && (
            <div className="cart-quantity-indicator">
              {quantity}
            </div>
          )}
        </button>
        
      </div>
    </header>
  );
}
