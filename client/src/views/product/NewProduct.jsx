import { ProductImage } from '../../components/ProductCard';
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import auth from '../../auth/auth-helper';
import { create } from '../../api/api-product';
import styles from './Product.module.css';
import CategoryField from '../../components/CategoryField';

export default function NewProduct() {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const authData = auth.isAuthenticated();

  const [values, setValues] = useState({
    name: '',
    description: '',
    image: '',
    imagePreview: '',
    category: '',
    quantity: '',
    price: '',
    error: '',
    loading: false,
  });

  const handleChange = name => e => {
    const val = name === 'image' ? e.target.files[0] : e.target.value;
    if (name === 'image' && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = event => {
        setValues(prev => ({
          ...prev,
          image: val,
          imagePreview: event.target.result,
          error: '',
        }));
      };
      reader.readAsDataURL(e.target.files[0]);
    } else {
      setValues({ ...values, [name]: val, error: '' });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setValues({ ...values, loading: true });

    let productData = new FormData();
    values.name && productData.append('name', values.name);
    values.description && productData.append('description', values.description);
    values.image && productData.append('image', values.image);
    values.category && productData.append('category', values.category);
    values.quantity && productData.append('quantity', values.quantity);
    values.price && productData.append('price', values.price);

    const data = await create({ shopId }, { t: authData.token }, productData);
    if (!data || data.error) {
      setValues({
        ...values,
        error: data?.error || 'We couldn’t save this product. Please try again.',
        loading: false,
      });
    } else {
      navigate('/seller/shop/edit/' + shopId);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>New Product</h1>
        <p className={styles.subtitle}>Add a new item to your shop's inventory</p>

        {values.error && <div className={styles.errorAlert}>{values.error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleChange('image')}
              className={styles.fileInput}
            />
            {values.imagePreview && (
              <ProductImage
                product={{
                  _id: 'new-product-preview',
                  name: values.name,
                  image: values.imagePreview,
                }}
                className={styles.previewImg}
              />
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Product Name</label>
            <input
              type="text"
              value={values.name}
              onChange={handleChange('name')}
              required
              className={styles.input}
              placeholder="e.g. Minimalist Ceramic Mug"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="product-category" className={styles.label}>
              Category
            </label>
            <CategoryField
              value={values.category}
              onChange={handleChange('category')}
              className={styles.input}
            />
          </div>

          <div className={styles.rowTwo}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={values.price}
                onChange={handleChange('price')}
                required
                className={styles.input}
                placeholder="24.99"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Quantity (Stock)</label>
              <input
                type="number"
                min="0"
                value={values.quantity}
                onChange={handleChange('quantity')}
                required
                className={styles.input}
                placeholder="10"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              value={values.description}
              onChange={handleChange('description')}
              rows="4"
              className={styles.textarea}
              placeholder="Provide key details, specifications, and dimensions..."
            />
          </div>

          <div className={styles.formActions}>
            <button type="submit" disabled={values.loading} className={styles.btnSubmit}>
              {values.loading ? 'Adding...' : 'Add to Inventory'}
            </button>
            <Link to={'/seller/shop/edit/' + shopId} className={styles.btnCancel}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
