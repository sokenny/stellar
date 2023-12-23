'use client';

import styles from './Modal.module.css';

const Modal = ({ children, onClose, closeOnOverlayClick = true }) => {
  return (
    <div
      className={styles.Modal}
      onClick={closeOnOverlayClick ? onClose : () => {}}
    >
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.x} onClick={onClose}>
          close
        </div>
        {children}
      </div>
      {/* <div className={styles.overlay} onClick={onClose}></div> */}
    </div>
  );
};

export default Modal;
