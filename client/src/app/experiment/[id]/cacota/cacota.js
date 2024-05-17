import React from 'react';
import Link from 'next/navigation';
import { Breadcrumbs, BreadcrumbItem } from '@nextui-org/react';

const cacota = () => {
  return (
    <Breadcrumbs>
      <BreadcrumbItem>
        <Link href="/dashboard">Experiments A</Link>
      </BreadcrumbItem>
      <BreadcrumbItem>1</BreadcrumbItem>
    </Breadcrumbs>
  );
};

export default cacota;
