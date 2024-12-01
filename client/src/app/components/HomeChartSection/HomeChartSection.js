'use client';

import { Tooltip } from '@nextui-org/react';
import ExperimentChart from '../ExperimentChart';
import styles from './HomeChartSection.module.css';

const mockupSessions = [
  {
    date: '2024-10-24',
    variant_id: 2641,
    unique_visitors: 1,
    visitors: 1,
    conversions: 0,
    cumulative_unique_visitors: 1,
    cumulative_visitors: 1,
    cumulative_conversions: 0,
    conversion_rate_unique: 0,
    conversion_rate_visitors: 0,
    cumulative_conversion_rate_unique: 0,
    cumulative_conversion_rate_visitors: 0,
  },
  {
    date: '2024-10-24',
    variant_id: 2642,
    unique_visitors: 2,
    visitors: 12,
    conversions: 0,
    cumulative_unique_visitors: 2,
    cumulative_visitors: 12,
    cumulative_conversions: 0,
    conversion_rate_unique: 0,
    conversion_rate_visitors: 0,
    cumulative_conversion_rate_unique: 0,
    cumulative_conversion_rate_visitors: 0,
  },
  {
    date: '2024-10-24',
    variant_id: 2643,
    unique_visitors: 3,
    visitors: 34,
    conversions: 2,
    cumulative_unique_visitors: 3,
    cumulative_visitors: 34,
    cumulative_conversions: 2,
    conversion_rate_unique: 0.6667,
    conversion_rate_visitors: 0.0588,
    cumulative_conversion_rate_unique: 0.6667,
    cumulative_conversion_rate_visitors: 0.0588,
  },
  {
    date: '2024-10-25',
    variant_id: 2641,
    unique_visitors: 17,
    visitors: 26,
    conversions: 14,
    cumulative_unique_visitors: 18,
    cumulative_visitors: 27,
    cumulative_conversions: 14,
    conversion_rate_unique: 0.8235,
    conversion_rate_visitors: 0.5385,
    cumulative_conversion_rate_unique: 0.7778,
    cumulative_conversion_rate_visitors: 0.5185,
  },
  {
    date: '2024-10-25',
    variant_id: 2642,
    unique_visitors: 10,
    visitors: 14,
    conversions: 4,
    cumulative_unique_visitors: 12,
    cumulative_visitors: 26,
    cumulative_conversions: 4,
    conversion_rate_unique: 0.4,
    conversion_rate_visitors: 0.2857,
    cumulative_conversion_rate_unique: 0.3333,
    cumulative_conversion_rate_visitors: 0.1538,
  },
  {
    date: '2024-10-25',
    variant_id: 2643,
    unique_visitors: 13,
    visitors: 29,
    conversions: 5,
    cumulative_unique_visitors: 16,
    cumulative_visitors: 63,
    cumulative_conversions: 7,
    conversion_rate_unique: 0.3846,
    conversion_rate_visitors: 0.1724,
    cumulative_conversion_rate_unique: 0.4375,
    cumulative_conversion_rate_visitors: 0.1111,
  },
  {
    date: '2024-10-26',
    variant_id: 2641,
    unique_visitors: 11,
    visitors: 13,
    conversions: 3,
    cumulative_unique_visitors: 29,
    cumulative_visitors: 40,
    cumulative_conversions: 17,
    conversion_rate_unique: 0.2727,
    conversion_rate_visitors: 0.2308,
    cumulative_conversion_rate_unique: 0.5862,
    cumulative_conversion_rate_visitors: 0.425,
  },
  {
    date: '2024-10-26',
    variant_id: 2642,
    unique_visitors: 11,
    visitors: 23,
    conversions: 11,
    cumulative_unique_visitors: 23,
    cumulative_visitors: 49,
    cumulative_conversions: 15,
    conversion_rate_unique: 1,
    conversion_rate_visitors: 0.4783,
    cumulative_conversion_rate_unique: 0.6522,
    cumulative_conversion_rate_visitors: 0.3061,
  },
  {
    date: '2024-10-26',
    variant_id: 2643,
    unique_visitors: 12,
    visitors: 18,
    conversions: 6,
    cumulative_unique_visitors: 28,
    cumulative_visitors: 81,
    cumulative_conversions: 13,
    conversion_rate_unique: 0.5,
    conversion_rate_visitors: 0.3333,
    cumulative_conversion_rate_unique: 0.4643,
    cumulative_conversion_rate_visitors: 0.1605,
  },
  {
    date: '2024-10-27',
    variant_id: 2641,
    unique_visitors: 9,
    visitors: 12,
    conversions: 2,
    cumulative_unique_visitors: 38,
    cumulative_visitors: 52,
    cumulative_conversions: 19,
    conversion_rate_unique: 0.2222,
    conversion_rate_visitors: 0.1667,
    cumulative_conversion_rate_unique: 0.5,
    cumulative_conversion_rate_visitors: 0.3654,
  },
  {
    date: '2024-10-27',
    variant_id: 2642,
    unique_visitors: 13,
    visitors: 20,
    conversions: 5,
    cumulative_unique_visitors: 36,
    cumulative_visitors: 69,
    cumulative_conversions: 20,
    conversion_rate_unique: 0.3846,
    conversion_rate_visitors: 0.25,
    cumulative_conversion_rate_unique: 0.5556,
    cumulative_conversion_rate_visitors: 0.2899,
  },
  {
    date: '2024-10-27',
    variant_id: 2643,
    unique_visitors: 7,
    visitors: 9,
    conversions: 2,
    cumulative_unique_visitors: 35,
    cumulative_visitors: 90,
    cumulative_conversions: 15,
    conversion_rate_unique: 0.2857,
    conversion_rate_visitors: 0.2222,
    cumulative_conversion_rate_unique: 0.4286,
    cumulative_conversion_rate_visitors: 0.1667,
  },
  {
    date: '2024-10-28',
    variant_id: 2641,
    unique_visitors: 9,
    visitors: 29,
    conversions: 2,
    cumulative_unique_visitors: 47,
    cumulative_visitors: 81,
    cumulative_conversions: 21,
    conversion_rate_unique: 0.2222,
    conversion_rate_visitors: 0.069,
    cumulative_conversion_rate_unique: 0.4468,
    cumulative_conversion_rate_visitors: 0.2593,
  },
  {
    date: '2024-10-28',
    variant_id: 2642,
    unique_visitors: 10,
    visitors: 21,
    conversions: 4,
    cumulative_unique_visitors: 46,
    cumulative_visitors: 90,
    cumulative_conversions: 24,
    conversion_rate_unique: 0.4,
    conversion_rate_visitors: 0.1905,
    cumulative_conversion_rate_unique: 0.5217,
    cumulative_conversion_rate_visitors: 0.2667,
  },
  {
    date: '2024-10-28',
    variant_id: 2643,
    unique_visitors: 14,
    visitors: 37,
    conversions: 7,
    cumulative_unique_visitors: 49,
    cumulative_visitors: 127,
    cumulative_conversions: 22,
    conversion_rate_unique: 0.5,
    conversion_rate_visitors: 0.1892,
    cumulative_conversion_rate_unique: 0.449,
    cumulative_conversion_rate_visitors: 0.1732,
  },
  {
    date: '2024-10-29',
    variant_id: 2641,
    unique_visitors: 2,
    visitors: 3,
    conversions: 0,
    cumulative_unique_visitors: 49,
    cumulative_visitors: 84,
    cumulative_conversions: 21,
    conversion_rate_unique: 0,
    conversion_rate_visitors: 0,
    cumulative_conversion_rate_unique: 0.4286,
    cumulative_conversion_rate_visitors: 0.25,
  },
  {
    date: '2024-10-29',
    variant_id: 2642,
    unique_visitors: 7,
    visitors: 9,
    conversions: 0,
    cumulative_unique_visitors: 53,
    cumulative_visitors: 99,
    cumulative_conversions: 24,
    conversion_rate_unique: 0,
    conversion_rate_visitors: 0,
    cumulative_conversion_rate_unique: 0.4528,
    cumulative_conversion_rate_visitors: 0.2424,
  },
  {
    date: '2024-10-29',
    variant_id: 2643,
    unique_visitors: 6,
    visitors: 35,
    conversions: 0,
    cumulative_unique_visitors: 55,
    cumulative_visitors: 162,
    cumulative_conversions: 22,
    conversion_rate_unique: 0,
    conversion_rate_visitors: 0,
    cumulative_conversion_rate_unique: 0.4,
    cumulative_conversion_rate_visitors: 0.1358,
  },
].map((item) => {
  // Increase all volume metrics by ~60%
  item.unique_visitors *= 2;
  item.visitors *= 2;
  item.conversions *= 2;
  item.cumulative_unique_visitors *= 2;
  item.cumulative_visitors *= 2;
  item.cumulative_conversions *= 2;
  item.conversion_rate_unique *= 2;
  item.conversion_rate_visitors *= 2;
  item.cumulative_conversion_rate_unique *= 2;
  item.cumulative_conversion_rate_visitors *= 2;

  // For variant B (2642), increase conversions by additional 45%
  if (item.variant_id === 2642) {
    item.conversions = Math.round(item.conversions * 1.21);
    item.cumulative_conversions = Math.round(
      item.cumulative_conversions * 1.21,
    );
    item.conversion_rate_unique *= 1.21;
    item.conversion_rate_visitors *= 1.21;
    item.cumulative_conversion_rate_unique *= 1.21;
    item.cumulative_conversion_rate_visitors *= 1.21;
  }

  return item;
});

const mockupVariants = [
  {
    id: 2641,
    name: 'Variant A (Control)',
    text: null,
    font_size: null,
    color: null,
    background_color: null,
    experiment_id: 913,
    is_control: true,
    modifications: [],
    traffic: 33,
    deleted_at: null,
    created_at: '2024-10-24T14:08:38.778Z',
    updated_at: '2024-10-24T14:12:30.542Z',
  },
  {
    id: 2642,
    name: 'Variant B',
    text: null,
    font_size: null,
    color: null,
    background_color: null,
    experiment_id: 913,
    is_control: false,
    modifications: [
      {
        cssText: '',
        selector:
          'html > body:nth-child(2) > div:nth-child(2) > div:nth-child(3) > div > div > div > h1',
        innerText: 'Free Split Testing Software For Websites.\n',
      },
    ],
    traffic: 34,
    deleted_at: null,
    created_at: '2024-10-24T14:08:38.778Z',
    updated_at: '2024-10-24T14:12:30.543Z',
  },
  {
    id: 2643,
    name: 'Variant C',
    text: null,
    font_size: null,
    color: null,
    background_color: null,
    experiment_id: 913,
    is_control: false,
    modifications: [
      {
        cssText: '',
        selector:
          'html > body:nth-child(2) > div:nth-child(2) > div:nth-child(3) > div > div > div:nth-child(2) > button',
        innerText: 'Start For Free',
      },
    ],
    traffic: 33,
    deleted_at: null,
    created_at: '2024-10-24T14:09:36.795Z',
    updated_at: '2024-10-24T14:12:30.505Z',
  },
];

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
    },
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        borderDash: [5, 5],
      },
      ticks: {
        color: 'rgba(0, 0, 0, 0.15)',
      },
    },
    y: {
      display: true,
      title: {
        display: true,
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        borderDash: [5, 5],
      },
      ticks: {
        color: 'rgba(0, 0, 0, 0.15)',
      },
    },
  },
};

const HomeChartSection = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Without testing,
        <br /> you leave <span>money</span> on the table.
      </h2>
      <div className={styles.variants}>
        {['a', 'b', 'c'].map((variant) => (
          <div key={variant} className={`${styles.variant}`}>
            <div className={styles.varTag}>Variant {variant.toUpperCase()}</div>
            <img
              src={`https://stellar-app-bucket.s3.us-east-2.amazonaws.com/assets/var-${variant}.webp`}
              alt={'varant' + variant}
            />
            {variant === 'b' && (
              <Tooltip
                content="This variant achieved a 21% higher conversion rate than baseline."
                showArrow
                className={styles.tooltip}
                closeDelay={200}
              >
                <div className={styles.cvr}>+21% CVR</div>
              </Tooltip>
            )}
          </div>
        ))}
      </div>
      <ExperimentChart
        data={mockupSessions}
        variants={mockupVariants}
        className={styles.chart}
        customOptions={chartOptions}
        defaultCumulative
        mode="conversions"
      />
    </div>
  );
};

export default HomeChartSection;
