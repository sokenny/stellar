import Plus from '../../icons/Plus';

import styles from './CreateButton.module.css';

const CreateButton = ({ onClick, className, isDisabled, height = 30 }) => {
  return (
    <Plus
      className={`${styles.CreateButton} ${className}
      ${isDisabled ? styles.disabled : ''}
      `}
      onClick={onClick}
      height={height}
    />
  );
};

export default CreateButton;
