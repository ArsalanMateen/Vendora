import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import auth from '../../auth/auth-helper';
import { read, update } from '../../api/api-auction.js';
import styles from './Auction.module.css';

const getDateString = date => {
  let year = date.getFullYear();
  let day = date.getDate().toString().length === 1 ? '0' + date.getDate() : date.getDate();
  let month =
    (date.getMonth() + 1).toString().length === 1
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1;
  let hours = date.getHours().toString().length === 1 ? '0' + date.getHours() : date.getHours();
  let minutes =
    date.getMinutes().toString().length === 1 ? '0' + date.getMinutes() : date.getMinutes();

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function EditAuction() {
  const { auctionId } = useParams();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    itemName: '',
    description: '',
    image: '',
    bidStart: '',
    bidEnd: '',
    startingBid: 0,
    error: '',
    loading: false,
  });

  const jwt = auth.isAuthenticated();

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    read({ auctionId }, signal).then(data => {
      if (data?.error) {
        setValues(v => ({ ...v, error: data.error }));
      } else {
        setValues(v => ({
          ...v,
          itemName: data.itemName || '',
          description: data.description || '',
          startingBid: data.startingBid || 0,
          bidStart: data.bidStart ? getDateString(new Date(data.bidStart)) : '',
          bidEnd: data.bidEnd ? getDateString(new Date(data.bidEnd)) : '',
        }));
      }
    });

    return () => {
      abortController.abort();
    };
  }, [auctionId]);

  const handleChange = name => event => {
    const value = name === 'image' ? event.target.files[0] : event.target.value;
    setValues({ ...values, [name]: value, error: '' });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    setValues({ ...values, loading: true });

    let auctionData = new FormData();
    values.itemName && auctionData.append('itemName', values.itemName);
    values.startingBid && auctionData.append('startingBid', values.startingBid);
    values.bidStart && auctionData.append('bidStart', values.bidStart);
    values.bidEnd && auctionData.append('bidEnd', values.bidEnd);

    const data = await update({ auctionId }, { t: jwt.token }, auctionData);

    if (data?.error) {
      setValues({ ...values, error: data.error, loading: false });
    } else {
      navigate('/myauctions');
    }
  };

  return (
    <div className={styles.formBox}>
      <h2 className={styles.formTitle}>Edit Auction</h2>
      {values.error && <div className={styles.errorAlert}>{values.error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Item Name</label>
          <input
            type="text"
            value={values.itemName}
            onChange={handleChange('itemName')}
            required
            className={styles.input}
          />
        </div>

        

        

        <div className={styles.formGroup}>
          <label className={styles.label}>Starting Bid ($)</label>
          <input
            type="number"
            value={values.startingBid}
            onChange={handleChange('startingBid')}
            required
            min="0"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Auction Start Time</label>
          <input
            type="datetime-local"
            value={values.bidStart}
            onChange={handleChange('bidStart')}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Auction End Time</label>
          <input
            type="datetime-local"
            value={values.bidEnd}
            onChange={handleChange('bidEnd')}
            required
            className={styles.input}
          />
        </div>

        <button type="submit" disabled={values.loading} className={styles.btnSubmit}>
          {values.loading ? 'Updating Auction...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
