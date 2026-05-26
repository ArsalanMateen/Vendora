import IconAction from './IconAction';
import { useState } from 'react';
import auth from '../auth/auth-helper';
import { remove } from '../api/api-shop';

export default function DeleteShop({ shop, onDeleted }) {
  const [open, setOpen] = useState(false);

  const authData = auth.isAuthenticated();

  const handleDelete = async () => {
    const data = await remove({ shopId: shop._id }, { t: authData.token });
    if (data && !data.error) {
      setOpen(false);
      if (onDeleted) onDeleted(shop._id);
    }
  };

  return (
    <>
      <IconAction icon="trash" label={'Delete ' + shop.name} danger onClick={() => setOpen(true)} />

      {open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              padding: '1.75rem',
              borderRadius: '10px',
              maxWidth: '400px',
              width: '90%',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#0f172a' }}>
              Delete Shop
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Are you sure you want to delete <strong>{shop.name}</strong>? All associated products
              will also be deleted.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  background: 'white',
                  border: '1px solid var(--border)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                }}
              >
                Cancel
              </button>
              <IconAction
                icon="trash"
                label={'Confirm delete ' + shop.name}
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
