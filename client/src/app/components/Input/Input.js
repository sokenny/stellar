import styles from './Input.module.css';

const Input = ({
  type,
  placeholder,
  className,
  onChange,
  value,
  name,
  disabled = false,
}) => {
  return (
    <input
      className={`${styles.Input} ${className ? className : ''}`}
      type={type}
      name={name}
      onChange={onChange}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
    />
  );
};

export default Input;
