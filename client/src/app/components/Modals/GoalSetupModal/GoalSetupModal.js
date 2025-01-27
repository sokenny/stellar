'use client';

import GoalsForm from '../../GoalsForm/GoalsForm';
import Modal from '../Modal/Modal';
import styles from './GoalSetupModal.module.css';

const GoalSetupModal = ({ experiment, goal, onClose }) => {
  return (
    <Modal
      onClose={onClose}
      closeOnOverlayClick={false}
      className={styles.modal}
    >
      <div>
        <div className={styles.header}>
          <h3 className={styles.title}>{goal ? 'Edit' : 'Create New'} Goal</h3>
        </div>
        <GoalsForm experiment={experiment} goal={goal} onClose={onClose} />
      </div>
    </Modal>
  );
};

export default GoalSetupModal;
