'use client';

import React, { useEffect, useRef } from 'react';
import { VisuallyHidden, useSwitch } from '@nextui-org/react';
import { MoonIcon } from './MoonIcon';
import { SunIcon } from './SunIcon';
import styles from './StatsSwitch.module.css';

const StatsSwitch = ({ onSwitch, ...props }) => {
  const inputRef = useRef(null);
  const {
    Component,
    slots,
    isSelected,
    getBaseProps,
    getInputProps,
    getWrapperProps,
  } = useSwitch(props);

  useEffect(() => {
    onSwitch(isSelected ? 'unique-visitors' : 'total-sessions');
  }, [isSelected]);

  return (
    <div
      className={`${styles.StatsSwitch}`}
      onClick={() => inputRef.current.click()}
    >
      <p className={styles.text}>
        Showing stats based on{' '}
        <span>{isSelected ? 'unique visitors' : 'total sessions'}</span>
      </p>
      <Component {...getBaseProps()} onValueChange={onSwitch}>
        <VisuallyHidden>
          <input {...getInputProps()} ref={inputRef} />
        </VisuallyHidden>

        <div
          {...getWrapperProps()}
          className={`${slots.wrapper({
            class: [
              'w-8 h-8',
              'flex items-center justify-center',
              'rounded-lg bg-default-100 hover:bg-default-200',
            ],
          })} ${styles.switcher}`}
        >
          {isSelected ? <SunIcon /> : <MoonIcon />}
        </div>
      </Component>
    </div>
  );
};

export default StatsSwitch;
