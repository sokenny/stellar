'use client';

import React, { useEffect, useState } from 'react';
import Users from '../../icons/Users';
import FingerPrint from '../../icons/FingerPrint';
import styles from './StatsSwitch.module.css';

const StatsSwitch = ({ onSwitch }) => {
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    onSwitch(isSelected ? 'unique-visitors' : 'total-sessions');
  }, [isSelected]);

  return (
    <div
      className={`${styles.StatsSwitch}`}
      onClick={() => setIsSelected(!isSelected)}
    >
      <p className={styles.text}>
        Showing stats based on{' '}
        <span>{isSelected ? 'unique visitors' : 'total sessions'}</span>
      </p>

      <div className={styles.switcher}>
        {isSelected ? (
          <FingerPrint width={14} height={14} />
        ) : (
          <Users width={14} height={14} />
        )}
      </div>
    </div>
  );
};

export default StatsSwitch;
