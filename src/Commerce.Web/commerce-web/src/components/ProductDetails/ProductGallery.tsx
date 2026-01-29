export default function ProductGallery({ images }: { images: string[] }) {
  return (
    <>
      {images.map((imageUrl) => (
        <img key={imageUrl} src={imageUrl} />
      ))}
    </>
  );
}
