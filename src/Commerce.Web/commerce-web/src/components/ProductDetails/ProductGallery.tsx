import { useState } from "react";
import styles from "./ProductGallery.module.css";

export default function ProductGallery({ images }: { images: string[] }) {
  const safeImages = images?.length ? images : [];
  const [active, setActive] = useState(0);

  if (!safeImages.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyBox} />
        <p>No images available</p>
      </div>
    );
  }

  const activeUrl = safeImages[Math.min(active, safeImages.length - 1)];

  return (
    <div className={styles.gallery}>
      <div className={styles.hero}>
        <img src={activeUrl} alt="" />
      </div>

      {safeImages.length > 1 && (
        <div className={styles.thumbRow}>
          {safeImages.map((url, idx) => (
            <button
              key={url}
              type="button"
              className={`${styles.thumb} ${idx === active ? styles.thumbActive : ""}`}
              onClick={() => setActive(idx)}
              aria-label={`View image ${idx + 1}`}
            >
              <img src={url} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
