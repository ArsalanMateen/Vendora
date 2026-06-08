import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import auth from '../../auth/auth-helper';
import { create } from '../../api/api-auction.js';
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

export default function NewAuction() {
  const navigate = useNavigate();

  const currentDate = new Date();
  const defaultStartTime = getDateString(currentDate);
  const defaultEndTime = getDateString(new Date(currentDate.getTime() + 60 * 60 * 1000));

  const [values, setValues] = useState({
    itemName: '',
    description: '',
    image: '',
    bidStart: defaultStartTime,
    bidEnd: defaultEndTime,
    startingBid: 0,
    error: '',
    loading: false,
  });

  const jwt = auth.isAuthenticated();

  const handleChange = name => event => {
    const value = name === 'image' ? event.target.files[0] : event.target.value;
    setValues({ ...values, [name]: value, error: '' });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (new Date(values.bidEnd) <= new Date(values.bidStart)) {
      setValues({ ...values, error: 'Auction end time must be after the start time' });
      return;
    }

    setValues({ ...values, loading: true });

    let auctionData = new FormData();
    values.itemName && auctionData.append('itemName', values.itemName);
    values.startingBid && auctionData.append('startingBid', values.startingBid);
    values.bidStart && auctionData.append('bidStart', values.bidStart);
    values.bidEnd && auctionData.append('bidEnd', values.bidEnd);

    const data = await create({ userId: jwt.user._id }, { t: jwt.token }, auctionData);

    if (data?.error) {
      setValues({ ...values, error: data.error, loading: false });
    } else {
      navigate('/myauctions');
    }
  };

  return (
    <div className={styles.formBox}>
      <h2 className={styles.formTitle}>Create New Auction</h2>
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
            placeholder="e.g. Vintage Leather Watch"
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
          {values.loading ? 'Creating Auction...' : 'Publish Auction'}
        </button>
      </form>
    </div>
  );
}
