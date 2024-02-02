import { Button as NextUIButton } from '@nextui-org/react';
import styles from './Button.module.css';

const Button = ({ children, className, onClick, disabled, loading, type }) => {
  return (
    <NextUIButton
      className={`${styles.Button} ${className}`}
      onClick={onClick}
      isDisabled={disabled}
      isLoading={loading}
      color="primary"
      type={type}
    >
      {children}
    </NextUIButton>
  );
};

export default Button;
