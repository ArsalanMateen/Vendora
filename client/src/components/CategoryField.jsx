import { listCategories } from '../api/api-product';
import useRemoteList from './useRemoteList';

export default function CategoryField({ value, onChange, className }) {
  const { data: categories } = useRemoteList(listCategories);

  return (
    <>
      <input
        id="product-category"
        aria-label="Product category"
        list="product-categories"
        value={value}
        onChange={onChange}
        required
        className={className}
        placeholder="Choose or add a category"
      />
      <datalist id="product-categories">
        {categories.filter(Boolean).map(category => (
          <option key={category} value={category} />
        ))}
      </datalist>
    </>
  );
}
