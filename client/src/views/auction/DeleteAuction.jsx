import IconAction from '../../components/IconAction';
import { useState } from 'react';
import auth from '../../auth/auth-helper';
import { remove } from '../../api/api-auction.js';
import styles from './Auction.module.css';

export default function DeleteAuction({ auction, onRemove }) {
  const [open, setOpen] = useState(false);

  const jwt = auth.isAuthenticated();

  const handleDelete = async () => {
    const data = await remove({ auctionId: auction._id }, { t: jwt.token });
    if (data?.error) {
      console.error(data.error);
    } else {
      setOpen(false);
      onRemove(auction);
    }
  };

  return (
    <>
      <IconAction
        icon="trash"
        label={'Delete ' + auction.itemName}
        danger
        onClick={() => setOpen(true)}
      />

      {open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Delete Auction?</h3>
            <p className={styles.modalBody}>
              Are you sure you want to delete <strong>{auction.itemName}</strong>? This action
              cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={styles.btnModalCancel}
              >
                Cancel
              </button>
              <IconAction
                icon="trash"
                label={'Confirm delete ' + auction.itemName}
                danger
                onClick={handleDelete}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
