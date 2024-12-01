'use client';

import React from 'react';
import { Chart as ChartJS } from 'chart.js/auto';
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useState } from 'react';
import { Select, SelectItem } from '@nextui-org/react';

import styles from './ExperimentChart.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
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
        text: 'Date',
      },
    },
    y: {
      display: true,
      title: {
        display: true,
        text: 'Count',
      },
    },
  },
};

const colorOptions = [
  '#3c93d6',
  '#e37ddc',
  '#ffbe30',
  '#ff8fb1',
  '#68e1b7',
  '#ffa84c',
  '#75c8ff',
  '#ff8a8d',
  '#e675a5',
  '#cc7a7a',
  '#ffa863',
  '#a687ff',
  '#ffc857',
];

const modeOptions = [
  { label: 'Conversions', value: 'conversions' },
  { label: 'Unique Visitors', value: 'unique_visitors' },
  { label: 'Total Visitors', value: 'visitors' },
  { label: 'Conversion Rate (Unique)', value: 'conversion_rate_unique' },
  { label: 'Conversion Rate (Visitors)', value: 'conversion_rate_visitors' },
];

const ExperimentChart = ({
  data,
  mode = 'conversions',
  height = '350px',
  defaultCumulative = false,
  customOptions = null,
  variants,
  className,
}) => {
  const [selectedMode, setSelectedMode] = useState(new Set([mode]));
  const [isCumulative, setIsCumulative] = useState(defaultCumulative);

  const handleModeChange = (newMode) => {
    setSelectedMode(newMode);
  };

  const handleToggleChange = () => {
    setIsCumulative((prev) => !prev);
  };

  return (
    <div className={` ${className} ${styles.container}`}>
      <div className={styles.modeSelectors}>
        <Select
          variant="bordered"
          placeholder="Select a mode"
          selectedKeys={selectedMode}
          className={styles.chartSelect}
          onSelectionChange={handleModeChange}
          labelPlacement="outside"
        >
          {modeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
        <label>
          <input
            type="checkbox"
            checked={isCumulative}
            onChange={handleToggleChange}
          />
          Cumulative
        </label>
      </div>
      <div style={{ height }}>
        <Line
          data={prepareChartData(
            data,
            Array.from(selectedMode)[0],
            variants,
            isCumulative,
          )}
          options={customOptions || defaultOptions}
        />
      </div>
    </div>
  );
};

function prepareChartData(data, mode, variants, isCumulative) {
  const labels = [...new Set(data.map((entry) => entry.date))];

  const datasets = data.reduce((acc, entry) => {
    const variantLabel = variants.find(
      (variant) => variant.id === entry.variant_id,
    )?.name;
    const existingDataset = acc.find(
      (dataset) => dataset.label === variantLabel,
    );

    const dataKey = isCumulative ? `cumulative_${mode}` : mode;

    if (existingDataset) {
      existingDataset.data.push(entry[dataKey]);
    } else {
      acc.push({
        label: variantLabel,
        data: [entry[dataKey]],
        borderColor: colorOptions[acc.length % colorOptions.length],
        fill: false,
      });
    }

    return acc;
  }, []);

  return {
    labels,
    datasets,
  };
}

export default React.memo(ExperimentChart);
