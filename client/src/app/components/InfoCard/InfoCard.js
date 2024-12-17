import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import styles from './InfoCard.module.css';

const InfoCard = ({ className, children, theme }) => {
  return (
    <Card
      className={`${styles.container} ${className ? className : ''} ${
        theme ? styles[theme] : ''
      }`}
    >
      <CardBody>{children}</CardBody>
    </Card>
  );
};

export default InfoCard;
