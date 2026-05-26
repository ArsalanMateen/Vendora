import { ProductImage } from '../../components/ProductCard';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import auth from '../../auth/auth-helper';
import { read, update } from '../../api/api-product';
import styles from './Product.module.css';
import CategoryField from '../../components/CategoryField';

export default function EditProduct() {
  const { shopId, productId } = useParams();
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
    loading: true,
  });

  useEffect(() => {
    const abortController = new AbortController();
    read({ productId }, abortController.signal).then(data => {
      if (data && !data.error) {
        setValues(prev => ({
          ...prev,
          name: data.name,
          description: data.description || '',
          category: data.category || '',
          quantity: data.quantity,
          price: data.price,
          imageUrl: data.image || '',
          loading: false,
        }));
      } else if (data && data.error) {
        navigate('/seller/shop/edit/' + shopId);
      }
    });

    return () => abortController.abort();
  }, [productId]);

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
    let productData = new FormData();
    values.name && productData.append('name', values.name);
    values.description && productData.append('description', values.description);
    values.image && productData.append('image', values.image);
    values.category && productData.append('category', values.category);
    productData.append('quantity', values.quantity);
    productData.append('price', values.price);

    const data = await update({ shopId, productId }, { t: authData.token }, productData);
    if (!data || data.error) {
      setValues({
        ...values,
        error: data?.error || 'We couldn’t save this product. Please try again.',
      });
    } else {
      navigate('/seller/shop/edit/' + shopId);
    }
  };

  if (values.loading) return <div className={styles.loading}>Loading product...</div>;

  return (
    <div className={styles.formContainer}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>Edit Product</h1>
        <p className={styles.subtitle}>Update product info, pricing, and stock levels</p>

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
            <div className={styles.previewWrap}>
              <ProductImage
                product={{
                  _id: productId,
                  name: values.name,
                  image: values.imagePreview || values.imageUrl,
                }}
                className={styles.previewImg}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Product Name</label>
            <input
              type="text"
              value={values.name}
              onChange={handleChange('name')}
              required
              className={styles.input}
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
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Quantity</label>
              <input
                type="number"
                min="0"
                value={values.quantity}
                onChange={handleChange('quantity')}
                required
                className={styles.input}
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
            />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.btnSubmit}>
              Update Product
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
