import styles from "./ProductGallery.module.css";
export default function ProductGallery({ images }: { images: string[] }) {
  return (
    <div className={styles.gallery}>
      {images.map((imageUrl) => (
        <img key={imageUrl} src={imageUrl} />
      ))}
    </div>
  );
}
