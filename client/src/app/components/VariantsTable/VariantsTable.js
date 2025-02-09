'use client';

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Spinner,
  getKeyValue,
  Tooltip,
  useDisclosure,
} from '@nextui-org/react';
import getVariantsTrafficInitialValues from '../../helpers/getVariantsTrafficInitialValues';
import DeleteIcon from '../../icons/Delete/Delete';
import EditIcon from '../../icons/Edit/Edit';
import EyeIcon from '../../icons/Eye/Eye';
import GearIcon from '../../icons/Gear';
import useStore from '../../store';
import VariantModal from '../Modals/VariantModal';
import VariantName from './VariantName';
import DeleteVariantModal from '../Modals/DeleteVariantModal';
import SnippetInstallationModal from '../Modals/SnippetInstallationModal';
import GoalTypesEnum from '../../helpers/enums/GoalTypesEnum';
import styles from './VariantsTable.module.css';
import useVariantEditor from '../../helpers/useVariantEditor';

const dummyKeyboardDelegate = Object.fromEntries(
  [
    'getKeyBelow',
    'getKeyAbove',
    'getKeyLeftOf',
    'getKeyRightOf',
    'getKeyPageBelow',
    'getKeyPageAbove',
    'getFirstKey',
    'getLastKey',
  ].map((name) => [name, () => null]),
);

const columns = (statsType, experimentType) => [
  {
    key: 'name',
    label: 'Name',
    goalTypes: [
      GoalTypesEnum.CLICK,
      GoalTypesEnum.PAGE_VISIT,
      GoalTypesEnum.SESSION_TIME,
      undefined,
    ],
  },
  {
    key: 'traffic',
    label: 'Traffic',
    goalTypes: [
      GoalTypesEnum.CLICK,
      GoalTypesEnum.PAGE_VISIT,
      GoalTypesEnum.SESSION_TIME,
      undefined,
    ],
  },
  ...((experimentType === 'SPLIT_URL' && [
    {
      key: 'url',
      label: 'URL',
      goalTypes: [
        GoalTypesEnum.CLICK,
        GoalTypesEnum.PAGE_VISIT,
        GoalTypesEnum.SESSION_TIME,
        undefined,
      ],
    },
  ]) || [
    {
      key: 'changes',
      label: 'Changes',
      goalTypes: [
        GoalTypesEnum.CLICK,
        GoalTypesEnum.PAGE_VISIT,
        GoalTypesEnum.SESSION_TIME,
        undefined,
      ],
    },
  ]),
  ...(statsType === 'total-sessions'
    ? [
        {
          key: 'sessions',
          label: 'Sessions',
          goalTypes: [
            GoalTypesEnum.CLICK,
            GoalTypesEnum.PAGE_VISIT,
            GoalTypesEnum.SESSION_TIME,
            undefined,
          ],
        },
      ]
    : [
        {
          key: 'unique_visitors',
          label: 'Unique Visitors',
          goalTypes: [
            GoalTypesEnum.CLICK,
            GoalTypesEnum.PAGE_VISIT,
            GoalTypesEnum.SESSION_TIME,
            undefined,
          ],
        },
      ]),
  {
    key: 'uplift',
    label: 'Uplift',
    goalTypes: [GoalTypesEnum.CLICK, GoalTypesEnum.PAGE_VISIT, undefined],
  },
  {
    key: 'conversions',
    label: 'Conversions',
    goalTypes: [GoalTypesEnum.CLICK, GoalTypesEnum.PAGE_VISIT, undefined],
  },
  {
    key: 'conversion_rate',
    label: 'Conversion Rate',
    goalTypes: [GoalTypesEnum.CLICK, GoalTypesEnum.PAGE_VISIT, undefined],
  },
  {
    key: 'average_session_time',
    label: 'Avg. Session Time',
    goalTypes: [GoalTypesEnum.SESSION_TIME],
  },
  {
    key: 'total_session_time',
    label: 'Total Session Time',
    goalTypes: [GoalTypesEnum.SESSION_TIME],
  },
  {
    key: 'actions',
    label: 'Actions',
    goalTypes: [
      GoalTypesEnum.CLICK,
      GoalTypesEnum.PAGE_VISIT,
      GoalTypesEnum.SESSION_TIME,
      undefined,
    ],
  },
];

const getUpliftClassName = (columnKey, value, isControl) => {
  if (columnKey !== 'uplift') return '';

  if (isControl) return styles['uplift-baseline'];

  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) return '';

  return numericValue > 0
    ? styles['uplift-positive']
    : numericValue < 0
    ? styles['uplift-negative']
    : '';
};

const getHighestUpliftId = (rows) => {
  let highestUplift = 0;
  let highestUpliftId = null;

  rows.forEach((row) => {
    if (!row._isControl) {
      const upliftValue = parseFloat(row.uplift);
      if (!isNaN(upliftValue) && upliftValue > highestUplift) {
        highestUplift = upliftValue;
        highestUpliftId = row.id;
      }
    }
  });

  return highestUpliftId;
};

const VariantsTable = ({ variants = [], experiment, statsType }) => {
  variants.sort((a, b) => a.id - b.id);
  const [variantToEdit, setVariantToEdit] = useState(null);
  const [variantToDelete, setVariantToDelete] = useState(null);
  const [page, setPage] = React.useState(1);
  const hasStarted = !!experiment.started_at;
  const hasEnded = !!experiment.ended_at;
  const { stats, getExperimentStats, currentProject, token } = useStore();
  const missingSnippet = currentProject?.snippet_status !== 1;
  const thisStats = stats[experiment.id + '-' + statsType];

  const {
    isOpen: isSnippetModalOpen,
    onOpen: onOpenSnippetModal,
    onOpenChange: onOpenSnippetModalChange,
  } = useDisclosure();
  const { handleEditVariant } = useVariantEditor({ experiment });

  useEffect(() => {
    if (hasStarted) {
      getExperimentStats(experiment.id, statsType);
    }
  }, [hasStarted, getExperimentStats, statsType]);

  function getVariantsRows(variants, hasStarted) {
    const controlStats = thisStats?.find(
      (v) => v.variantId === variants.find((v) => v.is_control)?.id,
    );
    const controlConversionRate = controlStats?.conversionRate || 0;

    return variants.map((variant) => {
      const variantStats = thisStats?.find((v) => v.variantId === variant.id);

      return {
        id: variant.id,
        name: variant.name,
        traffic: <>{variant.traffic + '%'}</>,
        ...((experiment.type === 'SPLIT_URL' && {
          url: variant.url,
        }) || {
          changes:
            (variant?.modifications?.length || 0) +
            (variant.global_css ? 1 : 0) +
            (variant.global_js ? 1 : 0),
        }),
        ...(statsType === 'total-sessions'
          ? { sessions: hasStarted ? variantStats?.sessions : '-' }
          : {
              unique_visitors: hasStarted ? variantStats?.unique_visitors : '-',
            }),
        uplift:
          hasStarted && variantStats?.conversionRate && !variant.is_control
            ? (
                ((variantStats?.conversionRate - controlConversionRate) /
                  controlConversionRate) *
                100
              ).toFixed(2) + '%'
            : variant.is_control
            ? 'baseline'
            : '-',
        conversions: hasStarted ? variantStats?.conversions : '-',
        conversion_rate:
          hasStarted && variantStats?.conversionRate
            ? variantStats?.conversionRate + '%'
            : '-',
        average_session_time: hasStarted
          ? variantStats?.averageSessionTime
          : '-',
        total_session_time: hasStarted ? variantStats?.totalSessionTime : '-',
        _isControl: variant.is_control,
        _hasNoSessions: hasStarted && variantStats?.sessions === 0,
      };
    });
  }

  const rows = getVariantsRows(variants, hasStarted);
  const rowsPerPage = 10;
  const pages = rows.length ? Math.ceil(rows.length / rowsPerPage) : 0;

  function handleOnView(variantId) {
    const variant = variants.find((v) => v.id === variantId);
    let baseUrl, queryParams;

    if (experiment.type === 'SPLIT_URL') {
      baseUrl = variant.url;
      queryParams = 'stellarMode=true';
    } else {
      baseUrl = experiment.editor_url;
      queryParams = `stellarMode=true&experimentId=${experiment.id}&variantId=${variantId}&previewMode=true&token=${token}`;
    }

    const url = baseUrl.includes('?')
      ? `${baseUrl}&${queryParams}`
      : `${baseUrl}?${queryParams}`;

    window.open(url, '_blank');
  }

  return (
    <>
      <SnippetInstallationModal
        isOpen={isSnippetModalOpen}
        onOpenChange={onOpenSnippetModalChange}
      />
      {variantToEdit && (
        <VariantModal
          isEditingTrue
          onClose={() => setVariantToEdit(null)}
          experiment={experiment}
          id={variantToEdit}
          variants={variants}
          initialValues={{
            name: variants.find((v) => v.id === variantToEdit).name,
            ...getVariantsTrafficInitialValues(variants),
            ...(experiment.type === 'SPLIT_URL' && {
              url: variants.find((v) => v.id === variantToEdit).url,
            }),
          }}
        />
      )}
      <Table
        keyboardDelegate={dummyKeyboardDelegate}
        className={`${styles.table} ${rows.length ? '' : styles.empty} ${
          hasStarted ? styles.hasStarted : ''
        } ${hasEnded ? styles.hasEnded : ''}`}
        aria-label="Variants Table"
        bottomContent={
          pages > 1 ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={pages}
                onChange={(page) => setPage(page)}
                size="sm"
              />
            </div>
          ) : null
        }
      >
        <TableHeader className={styles.tableHeader}>
          {columns(statsType, experiment.type)
            .filter((col) => col.goalTypes.includes(experiment?.goal?.type))
            .map((column) => {
              return (
                <TableColumn key={column.key} className={styles.th}>
                  {column.label}
                </TableColumn>
              );
            })}
        </TableHeader>
        <TableBody
          items={rows.slice((page - 1) * rowsPerPage, page * rowsPerPage) ?? []}
          loadingContent={<Spinner />}
        >
          {(item) => (
            <TableRow
              key={item?.id}
              className={`${styles.row} ${
                item.id === getHighestUpliftId(rows) ? styles.highestUplift : ''
              }`}
              data-no-sessions={item._hasNoSessions}
            >
              {(columnKey) => {
                if (columnKey === 'actions') {
                  return (
                    <TableCell>
                      <div className="relative flex items-center gap-2">
                        <Tooltip
                          content={'Preview'}
                          showArrow
                          className={styles.tooltip}
                          closeDelay={200}
                        >
                          <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                            <EyeIcon
                              className={styles.eyeIcon}
                              onClick={() =>
                                missingSnippet
                                  ? onOpenSnippetModal()
                                  : handleOnView(item.id)
                              }
                            />
                          </span>
                        </Tooltip>
                        {experiment.type !== 'SPLIT_URL' && (
                          <Tooltip
                            content={
                              item._isControl
                                ? 'Can not edit control variant'
                                : hasEnded
                                ? 'Can not edit variant after experiment has ended'
                                : 'Visual Editor'
                            }
                            showArrow
                            className={styles.tooltip}
                            closeDelay={200}
                          >
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                              <EditIcon
                                className={styles.editIcon}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (hasEnded || item._isControl) return;
                                  missingSnippet
                                    ? onOpenSnippetModal()
                                    : handleEditVariant(item.id);
                                }}
                                style={{
                                  cursor:
                                    hasEnded || item._isControl
                                      ? 'not-allowed'
                                      : 'pointer',
                                }}
                              />
                            </span>
                          </Tooltip>
                        )}
                        <Tooltip
                          content={
                            hasEnded
                              ? "Can not edit a variant's config after the experiment has ended."
                              : 'Settings'
                          }
                          showArrow
                          className={styles.tooltip}
                          closeDelay={200}
                        >
                          <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                            <GearIcon
                              width={18}
                              height={18}
                              className={styles.gearIcon}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (hasEnded) return;
                                missingSnippet
                                  ? onOpenSnippetModal()
                                  : setVariantToEdit(item.id);
                              }}
                            />
                          </span>
                        </Tooltip>
                        {!item._isControl && (
                          <Tooltip
                            content={
                              hasStarted && !item._hasNoSessions
                                ? 'Can not delete a variant after the experiment has started and has recorded sessions.'
                                : 'Delete'
                            }
                            showArrow
                            className={styles.tooltip}
                            closeDelay={200}
                            color={
                              hasStarted && !item._hasNoSessions
                                ? 'default'
                                : 'danger'
                            }
                          >
                            <span className="text-lg text-danger cursor-pointer active:opacity-50">
                              <DeleteIcon
                                className={styles.deleteIcon}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (hasStarted && !item._hasNoSessions)
                                    return;
                                  setVariantToDelete(item.id);
                                }}
                              />
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  );
                }
                if (columnKey === 'name') {
                  return (
                    <TableCell
                      className={`${styles['cell-' + columnKey]} ${
                        item._isControl ? styles['cell-control'] : ''
                      }`}
                    >
                      <VariantName name={item.name} variantId={item.id} />
                    </TableCell>
                  );
                }
                if (columnKey === 'url') {
                  return (
                    <TableCell className={styles['cell-url']}>
                      {getKeyValue(item, columnKey) ? (
                        <Tooltip
                          content={getKeyValue(item, columnKey)}
                          className={`${styles.tooltip} ${styles.urlTooltip}`}
                          closeDelay={50}
                        >
                          <a
                            href={getKeyValue(item, columnKey)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {getKeyValue(item, columnKey).replace(
                              /^https?:\/\/[^/]+/,
                              '',
                            )}
                          </a>
                        </Tooltip>
                      ) : (
                        <span
                          className={styles['url-not-set']}
                          onClick={() => setVariantToEdit(item.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          URL not set
                        </span>
                      )}
                    </TableCell>
                  );
                }
                return (
                  <TableCell
                    className={`${styles['cell-' + columnKey]} ${
                      item._isControl ? styles['cell-control'] : ''
                    } ${getUpliftClassName(
                      columnKey,
                      item.uplift,
                      item._isControl,
                    )}`}
                  >
                    {getKeyValue(item, columnKey)}
                  </TableCell>
                );
              }}
            </TableRow>
          )}
        </TableBody>
      </Table>
      {variantToDelete && (
        <DeleteVariantModal
          onClose={() => setVariantToDelete(null)}
          variantId={variantToDelete}
          experimentId={experiment.id}
        />
      )}
    </>
  );
};

export default VariantsTable;
