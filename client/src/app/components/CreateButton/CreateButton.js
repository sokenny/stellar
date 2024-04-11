import Plus from '../../icons/Plus';

import styles from './CreateButton.module.css';

const CreateButton = ({ onClick, className, height = 30 }) => {
  return (
    <Plus
      className={`${styles.CreateButton} ${className}`}
      onClick={onClick}
      height={height}
    />
  );
};

export default CreateButton;
