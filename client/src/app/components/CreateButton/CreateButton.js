import Plus from '../../icons/Plus';

import styles from './CreateButton.module.css';

const CreateButton = ({ onClick }) => {
  return <Plus className={styles.CreateButton} onClick={onClick} />;
};

export default CreateButton;
