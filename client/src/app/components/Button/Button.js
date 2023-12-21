import styles from './Button.module.css';

const Button = ({ children, className, onClick, disabled, loading }) => {
  function handleClick() {
    if (disabled) {
      return;
    }
    onClick && onClick();
  }
  return (
    <button
      className={`${styles.Button} ${className}
    ${disabled ? styles.disabled : ''}
    ${loading ? styles.loading : ''}
    `}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export default Button;
