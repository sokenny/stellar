'use client';

import Close from '../../icons/Close';
import styles from './Modal.module.css';

const Modal = ({
  children,
  className,
  onClose,
  closeOnOverlayClick = true,
  showX = true,
}) => {
  return (
    <div
      className={`${styles.Modal} ${className ? className : ''}`}
      onClick={closeOnOverlayClick ? onClose : () => {}}
    >
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        {showX && (
          <div className={styles.x} onClick={onClose}>
            <Close />
          </div>
        )}
        {children}
      </div>
      {/* <div className={styles.overlay} onClick={onClose}></div> */}
    </div>
  );
};

export default Modal;
