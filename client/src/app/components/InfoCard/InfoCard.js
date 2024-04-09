import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import styles from './InfoCard.module.css';

const InfoCard = ({ className, children }) => {
  return (
    <Card className={`${styles.container} ${className ? className : ''}`}>
      <CardBody>{children}</CardBody>
    </Card>
  );
};

export default InfoCard;
