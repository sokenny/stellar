import React, { useState, useEffect } from 'react';
import {
  Switch,
  Select,
  SelectItem,
  Avatar,
  Tooltip,
  Button as NextUIButton,
} from '@nextui-org/react';
import Desktop from '../../icons/Desktop';
import Tablet from '../../icons/Tablet';
import Mobile from '../../icons/Mobile';
import countries from '../../helpers/countries';
import styles from './TargetAudienceForm.module.css';
import PropTypes from 'prop-types';
import { toast } from 'sonner';
import useStore from '../../store';

const deviceOptions = [
  {
    key: 'mobile',
    label: 'Mobile',
    icon: <Mobile width={16} height={16} />,
  },
  {
    key: 'desktop',
    label: 'Desktop',
    icon: <Desktop width={16} height={16} />,
  },
  {
    key: 'tablet',
    label: 'Tablet',
    icon: <Tablet width={16} height={16} />,
  },
];

const countryOptions = countries.map((country) => ({
  key: country.name.toLowerCase().replace(/\s+/g, '-'),
  label: country.name,
  flag: `https://flagcdn.com/${country.code.toLowerCase()}.svg`,
  code: country.code,
}));

const defaultRules = {
  device: { enabled: false, include: [] },
  country: { enabled: false, include: [], exclude: [] },
  url_params: { enabled: false, settings: {} },
};

const TargetAudienceForm = ({
  experimentId,
  targetRules = defaultRules,
  onClose,
  saveButtonLabel = 'Save Changes',
  onSuccess,
}) => {
  console.log('targetRules111', targetRules);
  const { refetchProjects } = useStore();
  const [deviceRulesEnabled, setDeviceRulesEnabled] = useState(
    targetRules?.device?.enabled ?? false,
  );

  console.log('deviceRulesEnabled --', deviceRulesEnabled);
  const [selectedDevices, setSelectedDevices] = useState(
    targetRules?.device?.include ?? [],
  );
  const [countryRulesEnabled, setCountryRulesEnabled] = useState(
    targetRules?.country?.enabled ?? false,
  );
  const [includedCountries, setIncludedCountries] = useState(
    targetRules?.country?.include ?? [],
  );
  const [excludedCountries, setExcludedCountries] = useState(
    targetRules?.country?.exclude ?? [],
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleDeviceSelectionChange = (val) => {
    const selectedKeysArray = [...val];
    setSelectedDevices(selectedKeysArray);
  };

  const handleIncludedCountriesChange = (val) => {
    const selectedKeysArray = [...val].map((key) => {
      const country = countryOptions.find((country) => country.key === key);
      return country ? country.code : key;
    });
    setIncludedCountries(selectedKeysArray);
  };

  const handleExcludedCountriesChange = (val) => {
    const selectedKeysArray = [...val].map((key) => {
      const country = countryOptions.find((country) => country.key === key);
      return country ? country.code : key;
    });
    setExcludedCountries(selectedKeysArray);
  };

  const saveRules = async () => {
    console.log('saveRules disparado!');
    setIsSaving(true);
    const rules = {
      device: {
        enabled: deviceRulesEnabled,
        include: selectedDevices,
      },
      country: {
        enabled: countryRulesEnabled,
        include: includedCountries,
        exclude: excludedCountries,
      },
      url_params: {
        enabled: false,
        settings: {},
      },
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/api/experiment/${experimentId}/target-rules`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(rules),
        },
      );
      if (response.ok) {
        refetchProjects();
        toast.success('Target rules saved successfully');
        onSuccess?.();
        onClose?.();
      } else {
        toast.error('Failed to save targeting rules');
      }
    } catch (error) {
      console.error('Error saving target rules:', error);
      toast.error('Failed to save targeting rules');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.targetting}>
      <div
        className={`${styles.ruleType} ${
          deviceRulesEnabled ? styles.enabled : ''
        }`}
      >
        <div className={styles.ruleTypeRow}>
          <div className={styles.ruleLeft}>
            <div className={styles.ruleTypeTitle}>Device rules</div>
            <div className={styles.ruleTypeDetail}>
              {deviceRulesEnabled ? (
                <>
                  Show experiment to: <span>{selectedDevices.join(', ')}</span>
                </>
              ) : (
                <>
                  Currently set to <span>all devices</span>
                </>
              )}
            </div>
          </div>
          <div className={styles.ruleTypeOption}>
            <Switch
              defaultSelected={deviceRulesEnabled}
              onChange={(e) => {
                setDeviceRulesEnabled(e.target.checked);
                if (!e.target.checked) {
                  setSelectedDevices([]);
                }
              }}
            />
          </div>
        </div>
        {deviceRulesEnabled && (
          <Select
            placeholder="Select Devices"
            selectionMode="multiple"
            className={`max-w-xs ${styles.select}`}
            size="sm"
            defaultSelectedKeys={selectedDevices}
            onSelectionChange={handleDeviceSelectionChange}
          >
            {deviceOptions.map((device) => (
              <SelectItem key={device.key} startContent={device.icon}>
                {device.label}
              </SelectItem>
            ))}
          </Select>
        )}
      </div>
      <div
        className={`${styles.ruleType} ${styles.countries} ${
          countryRulesEnabled ? styles.enabled : ''
        }`}
      >
        <div className={styles.ruleTypeRow}>
          <div className={styles.ruleLeft}>
            <div className={styles.ruleTypeTitle}>Country rules</div>
            <div className={styles.ruleTypeDetail}>
              {countryRulesEnabled ? (
                <>
                  Include:{' '}
                  <span>
                    {includedCountries
                      .map(
                        (code) =>
                          countryOptions.find(
                            (country) => country.code === code,
                          )?.label,
                      )
                      .join(', ')}
                  </span>
                  ; Exclude:{' '}
                  <span>
                    {excludedCountries
                      .map(
                        (code) =>
                          countryOptions.find(
                            (country) => country.code === code,
                          )?.label,
                      )
                      .join(', ')}
                  </span>
                </>
              ) : (
                <>
                  Currently set to <span>all countries</span>
                </>
              )}
            </div>
          </div>
          <div className={styles.ruleTypeOption}>
            <Switch
              defaultSelected={countryRulesEnabled}
              onChange={(e) => {
                setCountryRulesEnabled(e.target.checked);
                if (!e.target.checked) {
                  setIncludedCountries([]);
                  setExcludedCountries([]);
                }
              }}
            />
          </div>
        </div>
        {countryRulesEnabled && (
          <>
            <Select
              label="Include Countries"
              selectionMode="multiple"
              className={`max-w-xs ${styles.select}`}
              size="sm"
              defaultSelectedKeys={includedCountries.map(
                (code) =>
                  countryOptions.find((country) => country.code === code)?.key,
              )}
              onSelectionChange={handleIncludedCountriesChange}
            >
              {countryOptions.map((country) => (
                <SelectItem
                  key={country.key}
                  startContent={
                    <Avatar
                      alt={country.label}
                      className="w-6 h-6"
                      src={country.flag}
                    />
                  }
                >
                  {country.label}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Exclude Countries"
              selectionMode="multiple"
              className={`max-w-xs ${styles.select}`}
              size="sm"
              defaultSelectedKeys={excludedCountries.map(
                (code) =>
                  countryOptions.find((country) => country.code === code)?.key,
              )}
              onSelectionChange={handleExcludedCountriesChange}
            >
              {countryOptions.map((country) => (
                <SelectItem
                  key={country.key}
                  startContent={
                    <Avatar
                      alt={country.label}
                      className="w-6 h-6"
                      src={country.flag}
                    />
                  }
                >
                  {country.label}
                </SelectItem>
              ))}
            </Select>
          </>
        )}
      </div>

      <div className={styles.buttonContainer}>
        {onClose && (
          <NextUIButton variant="light" onClick={onClose}>
            Close
          </NextUIButton>
        )}
        <NextUIButton
          color="primary"
          onClick={saveRules}
          isLoading={isSaving}
          className={styles.saveButton}
        >
          {saveButtonLabel}
        </NextUIButton>
      </div>
    </div>
  );
};

TargetAudienceForm.propTypes = {
  experimentId: PropTypes.string.isRequired,
  targetRules: PropTypes.object,
  onClose: PropTypes.func,
  saveButtonLabel: PropTypes.string,
};

export default TargetAudienceForm;
