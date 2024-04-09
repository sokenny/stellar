'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
} from '@nextui-org/react';
import DeleteIcon from '../../icons/Delete/Delete';
import EditIcon from '../../icons/Edit/Edit';
import EyeIcon from '../../icons/Eye/Eye';
import useStore from '../../store';
import styles from './ExperimentsTable.module.css';
import StatusChip from '../StatusChip';

const ExperimentsTable = ({ experiments = [] }) => {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const { stats } = useStore();

  function getExperimentRows(experiments) {
    return experiments.map((experiment) => {
      const experimentStats = stats[experiment.id];
      console.log('experimentStats', stats);
      return {
        id: experiment.id,
        name: experiment.name,
        status: <StatusChip status={experiment.status} />,
        variants: experiment.variants.length,
        // TODO-p1: Mostrar el count de sessions
        sessions: '-',
        started_at: experiment.started_at
          ? new Date(experiment.started_at).toLocaleDateString()
          : '-',
        ended_at: experiment.ended_at
          ? new Date(experiment.ended_at).toLocaleDateString()
          : '-',
      };
    });
  }

  const rows = getExperimentRows(experiments);
  const rowsPerPage = 10;
  const pages = rows.length ? Math.ceil(rows.length / rowsPerPage) : 0;
  return (
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
            className={styles.row}
            onClick={() => router.push(`/experiment/${item.id}`)}
          >
            {(columnKey) => {
              if (columnKey === 'actions') {
                return (
                  <TableCell>
                    <div className="relative flex items-center gap-2">
                      <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                        <EyeIcon
                          className={styles.eyeIcon}
                          onClick={() => handleOnView(item.id)}
                        />
                      </span>
                      <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                        <EditIcon className={styles.editIcon} />
                      </span>
                      <span className="text-lg text-danger cursor-pointer active:opacity-50">
                        {/* TODO-p1: Poder borrar experiments no empezados */}
                        <DeleteIcon className={styles.deleteIcon} />
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
  );
};

export default ExperimentsTable;
