import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { getCategorySlugs } from "../../api/product/ProductsApiClient";
import styles from "./ProductMenu.module.css"

export default function ProductMenu() {
  const [categories, setCategories] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  function toggleMulti(key: string, value: string) {
    const next = new URLSearchParams(location.search);
    const values = next.getAll(key);
    const hasValue = values.includes(value);

    next.delete(key);

    (hasValue
      ? values.filter(v => v !== value)
      : [...values, value]
    ).forEach(v => next.append(key, v));

    navigate({
      pathname: "/products",
      search: next.toString()
    });
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getCategorySlugs(); 
        console.log(res.categorySlugs);
        
        if (!cancelled) {
          setCategories(res.categorySlugs); 
        }
      } catch (e) {
        console.error("Failed to load categories", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  
  function isSelected(key: string, value: string) {
    return searchParams.getAll(key).includes(value);
  }

  return (
    <div className={styles.filtersContainer}>
      <div
        className={styles.filter}>
        Categories
        <div className={styles.filterOptions}>
          {categories.map((c) => (
            <button key={c} className={`${isSelected("category", c) ? styles.selected : ""}`}
            onClick={() => toggleMulti("category", c)}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
