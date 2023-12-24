import styles from './Input.module.css';

const Input = ({ type, onChange, value, disabled = false }) => {
  return (
    <input
      className={styles.Input}
      type={type}
      onChange={onChange}
      value={value}
      disabled={disabled}
    />
  );
};

export default Input;
