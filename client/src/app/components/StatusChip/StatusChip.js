import { Chip } from '@nextui-org/react';
import ExperimentStatusesEnum from '../../helpers/enums/ExperimentStatusesEnum';
import styles from './StatusChip.module.css';

const StatusChip = ({ status, size = 'sm' }) => {
  if (status === ExperimentStatusesEnum.RUNNING) {
    return (
      <Chip className={styles.container} color="success" size={size}>
        Running
      </Chip>
    );
  }
  if (status === ExperimentStatusesEnum.PAUSED) {
    return (
      <Chip className={styles.container} color="warning" size={size}>
        Paused
      </Chip>
    );
  }
  if (status === ExperimentStatusesEnum.PENDING) {
    return (
      <Chip className={styles.container} color="default" size={size}>
        Pending
      </Chip>
    );
  }

  if (status === ExperimentStatusesEnum.COMPLETED) {
    return (
      <Chip className={styles.container} color="secondary" size={size}>
        Completed
      </Chip>
    );
  }

  return <></>;
};

export default StatusChip;
