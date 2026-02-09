import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { getCategorySlugs } from "../../api/product/ProductsApiClient";
import styles from "./ProductMenu.module.css"

export default function ProductMenu() {
  const [categories, setCategories] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  function toggleSingle(key: string, value: string){
    const params = new URLSearchParams(location.search);
    const keys = [...params.keys()];
    const hasValue = keys.includes(key);

    params.delete(key);

    !hasValue 
      ? params.append(key, value)
      : params.set(key, value);

    navigate({
      pathname: "/products",
      search: params.toString()
    });
  } 

  function toggleMulti(key: string, value: string) {
    const params = new URLSearchParams(location.search);
    const values = params.getAll(key);
    const hasValue = values.includes(value);

    params.delete(key);

    (hasValue
      ? values.filter(v => v !== value)
      : [...values, value]
    ).forEach(v => params.append(key, v));

    navigate({
      pathname: "/products",
      search: params.toString()
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
        setError(true);
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
        {!error && "Categories"}
        <div className={styles.filterOptions}>
          {categories.map((c) => (
            <button key={c} className={`${isSelected("category", c) ? styles.selected : ""}`}
            onClick={() => toggleSingle("category", c)}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
