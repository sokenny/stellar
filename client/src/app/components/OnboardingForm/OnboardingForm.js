'use client';

import React, { useState, useEffect } from 'react';
import { Select, SelectItem, Button } from '@nextui-org/react';
import styles from './OnboardingForm.module.css';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import useStore from '../../store';

const OnboardingForm = () => {
  const router = useRouter();
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [discoveryMethod, setDiscoveryMethod] = useState('');
  const [monthlyTraffic, setMonthlyTraffic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useStore();

  useEffect(() => {
    const formElement = document.querySelector(`.${styles.formContainer}`);
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleSubmit = async () => {
    if (!industry || !companySize || !discoveryMethod || !monthlyTraffic) {
      toast.error('All fields need to be selected');
      return;
    }

    setIsLoading(true);
    const data = {
      industry,
      companySize,
      discoveryMethod,
      monthlyTraffic,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/api/onboarding`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        toast.error('Failed to submit onboarding data');
        throw new Error('Failed to submit onboarding data');
      }

      console.log('Onboarding data submitted successfully');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success('Onboarding data submitted successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error submitting onboarding data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sideBar}>
        <div className={styles.id}>GoStellar.app</div>
      </div>

      <div className={styles.formContainer}>
        <h1 className={styles.title}>
          We're almost done <span>:)</span>
        </h1>
        <div className={styles.form}>
          <div className={styles.select}>
            <Select
              label="What is your industry?"
              labelPlacement="outside"
              placeholder="Select your industry"
              onSelectionChange={(val) => setIndustry(val.currentKey)}
            >
              <SelectItem key="ecommerce">E-commerce</SelectItem>
              <SelectItem key="finance">Finance</SelectItem>
              <SelectItem key="software">Software</SelectItem>
              <SelectItem key="agency">Agency</SelectItem>
              <SelectItem key="education">Education</SelectItem>
              <SelectItem key="nonprofit">Non-profit</SelectItem>
              <SelectItem key="government">Government</SelectItem>
              <SelectItem key="other">Other</SelectItem>
            </Select>
          </div>

          <div className={styles.select}>
            <Select
              label="What's the company size?"
              labelPlacement="outside"
              placeholder="Select company size"
              onSelectionChange={(val) => setCompanySize(val.currentKey)}
            >
              <SelectItem key="1-10">1 - 10 people</SelectItem>
              <SelectItem key="10-50">10 - 50 people</SelectItem>
              <SelectItem key="50-100">50 - 100 people</SelectItem>
              <SelectItem key="100-250">100 - 250 people</SelectItem>
              <SelectItem key="250+">+ 250 people</SelectItem>
            </Select>
          </div>

          <div className={styles.select}>
            <Select
              label="How did you find us?"
              labelPlacement="outside"
              placeholder="Select an option"
              onSelectionChange={(val) => setDiscoveryMethod(val.currentKey)}
            >
              <SelectItem key="linkedin">LinkedIn</SelectItem>
              <SelectItem key="google-seo">Google SEO</SelectItem>
              <SelectItem key="google-sem">Google SEM</SelectItem>
              <SelectItem key="facebook-ads">Facebook Ads</SelectItem>
              <SelectItem key="instagram-ads">Instagram Ads</SelectItem>
              <SelectItem key="reddit">Reddit</SelectItem>
              <SelectItem key="word-of-mouth">Word of mouth</SelectItem>
              <SelectItem key="other">Other</SelectItem>
            </Select>
          </div>

          <div className={styles.select}>
            <Select
              label="What is your estimated monthly traffic?"
              labelPlacement="outside"
              placeholder="Select traffic range"
              onSelectionChange={(val) => setMonthlyTraffic(val.currentKey)}
            >
              <SelectItem key="0-10k">0 - 10k monthly users</SelectItem>
              <SelectItem key="10k-50k">10k - 50k monthly users</SelectItem>
              <SelectItem key="50k-100k">50k - 100k monthly users</SelectItem>
              <SelectItem key="100k-250k">100k - 250k monthly users</SelectItem>
              <SelectItem key="250k+">+250k monthly users</SelectItem>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            color="primary"
            className={styles.submit}
            isLoading={isLoading}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;