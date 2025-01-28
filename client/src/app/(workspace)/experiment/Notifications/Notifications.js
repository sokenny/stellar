'use client';

import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

const Notifications = ({ searchParams }) => {
  const toastTriggeredRef = useRef(false);

  useEffect(() => {
    if (searchParams.fromCreateForm && !toastTriggeredRef.current) {
      toast.success('Experiment created successfully');
      toastTriggeredRef.current = true;
    }
  }, [searchParams, toastTriggeredRef]);

  return <></>;
};

export default Notifications;
