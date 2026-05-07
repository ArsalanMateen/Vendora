import ProductCard from './ProductCard';
import cards from './ProductCard.module.css';

export default function Suggestions({ products, title = 'A few more good finds' }) {
  if (!products?.length) return null;

  return (
    <section style={{ marginTop: 38 }}>
      <h2 style={{ fontSize: 22, marginBottom: 7 }}>{title}</h2>
      <p className="page-description" style={{ marginBottom: 22 }}>
        Discover more from this corner of the collection.
      </p>
      <div className={cards.grid}>
        {products.map(product => (
          <ProductCard product={product} key={product._id} />
        ))}
      </div>
    </section>
  );
}
