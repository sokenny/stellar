import Pause from '../../icons/Pause';

import styles from './PauseButton.module.css';

const PauseButton = ({ onClick }) => {
  return (
    <div className={styles.PauseButton} onClick={onClick}>
      <Pause width={10} height={10} />
    </div>
  );
};

export default PauseButton;
