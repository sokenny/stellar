'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  getKeyValue,
  Tooltip,
  Spinner,
} from '@nextui-org/react';
import DeleteIcon from '../../icons/Delete/Delete';
import EditIcon from '../../icons/Edit/Edit';
import useStore from '../../store';
import styles from './ExperimentsTable.module.css';
import StatusChip from '../StatusChip';
import ExperimentStatusesEnum from '../../helpers/enums/ExperimentStatusesEnum';
import DeleteExperimentModal from '../Modals/DeleteExperimentModal/DeleteExperimentModal';

const ExperimentsTable = ({ experiments = [] }) => {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const { stats, getExperimentStats } = useStore();
  const [experimentToDelete, setExperimentToDelete] = useState(null);

  const getExperimentRows = useCallback(
    (experiments) => {
      return experiments.map((experiment) => {
        let experimentStats = [];
        let loadingStats = false;
        if (experiment.status !== ExperimentStatusesEnum.PENDING) {
          getExperimentStats(experiment.id, 'total-sessions');
          experimentStats = stats[experiment.id + '-total-sessions'];
          if (experimentStats === undefined) {
            loadingStats = true;
          }
        }

        const sessions =
          experimentStats?.length > 0
            ? experimentStats.reduce(
                (acc, variant) => acc + variant.sessions,
                0,
              )
            : '';

        return {
          id: experiment.id,
          name: experiment.name,
          status: <StatusChip status={experiment.status} />,
          variants: experiment.variants.length,
          sessions: loadingStats ? (
            <Spinner size="sm" color="default" />
          ) : (
            sessions
          ),
          started_at: experiment.started_at
            ? new Date(experiment.started_at).toLocaleDateString()
            : '-',
          ended_at: experiment.ended_at
            ? new Date(experiment.ended_at).toLocaleDateString()
            : '-',
          _status: experiment.status,
          _hasStarted: experiment.started_at,
        };
      });
    },
    [getExperimentStats, stats],
  );

  const rows = getExperimentRows(experiments);
  const rowsPerPage = 10;
  const pages = rows.length ? Math.ceil(rows.length / rowsPerPage) : 0;

  return (
    <>
      <Table
        className={`${styles.table} ${rows.length ? '' : styles.empty}`}
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
          <TableColumn key="name" className={styles.th}>
            Name
          </TableColumn>
          <TableColumn key="status" className={styles.th}>
            Status
          </TableColumn>
          <TableColumn key="variants" className={styles.th}>
            Variants
          </TableColumn>
          <TableColumn key="sessions" className={styles.th}>
            Sessions
          </TableColumn>
          <TableColumn key="started_at" className={styles.th}>
            Start Date
          </TableColumn>
          <TableColumn key="ended_at" className={styles.th}>
            End Date
          </TableColumn>
          <TableColumn key="actions" className={styles.th}>
            Actions
          </TableColumn>
        </TableHeader>
        <TableBody
          items={rows.slice((page - 1) * rowsPerPage, page * rowsPerPage) ?? []}
          loadingContent={<Spinner />}
        >
          {(item) => (
            <TableRow
              key={item?.id}
              className={
                //  string interpolation
                `${styles.row} ${item._hasStarted ? styles.hasStarted : ''}`
              }
              onClick={() => router.push(`/experiment/${item.id}`)}
            >
              {(columnKey) => {
                if (columnKey === 'actions') {
                  return (
                    <TableCell>
                      <div className="relative flex items-center gap-2">
                        <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                          <EditIcon className={styles.editIcon} />
                        </span>
                        <span className="text-lg text-danger cursor-pointer active:opacity-50">
                          <Tooltip
                            content="Can not delete an experiment that has already started."
                            isDisabled={
                              item._status === ExperimentStatusesEnum.PENDING
                            }
                            showArrow
                            className={styles.tooltip}
                            closeDelay={200}
                          >
                            <span>
                              <DeleteIcon
                                className={styles.deleteIcon}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    item._status !==
                                    ExperimentStatusesEnum.PENDING
                                  ) {
                                    return;
                                  }
                                  setExperimentToDelete(item.id);
                                }}
                              />
                            </span>
                          </Tooltip>
                        </span>
                      </div>
                    </TableCell>
                  );
                }
                return <TableCell>{getKeyValue(item, columnKey)}</TableCell>;
              }}
            </TableRow>
          )}
        </TableBody>
      </Table>
      {experimentToDelete && (
        <DeleteExperimentModal
          onClose={() => setExperimentToDelete(null)}
          experimentId={experimentToDelete}
        />
      )}
    </>
  );
};

export default ExperimentsTable;
