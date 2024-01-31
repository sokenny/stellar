import Plus from '../../icons/Plus';

import styles from './CreateButton.module.css';

const CreateButton = ({ onClick, height = 30 }) => {
  return (
    <Plus className={styles.CreateButton} onClick={onClick} height={height} />
  );
};

export default CreateButton;
