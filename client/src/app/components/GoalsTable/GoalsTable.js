'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
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
} from '@nextui-org/react';
import DeleteIcon from '../../icons/Delete/Delete';
import EditIcon from '../../icons/Edit/Edit';
import useStore from '../../store';
import styles from './GoalsTable.module.css';
import GoalSetupModal from '../Modals/GoalSetupModal/GoalSetupModal';

const GoalsTable = ({ goals = [] }) => {
  const [page, setPage] = React.useState(1);
  const [editingGoal, setEditingGoal] = useState(null);
  const { refetchProjects } = useStore();

  const rows = goals
    .map((goal) => ({
      id: goal.id,
      name: goal.name,
      type: goal.type,
      selector: goal.selector || '-',
      url_match_value: goal.url_match_value || '-',
      experiments: goal.Experiments?.length || 0,
      _original: goal,
    }))
    .sort((a, b) => b.id - a.id);

  const rowsPerPage = 10;
  const pages = Math.ceil(rows.length / rowsPerPage);

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
        <TableHeader>
          <TableColumn key="name" className={styles.th}>
            Name
          </TableColumn>
          <TableColumn key="type" className={styles.th}>
            Type
          </TableColumn>
          <TableColumn key="selector" className={styles.th}>
            Selector
          </TableColumn>
          <TableColumn key="url_match_value" className={styles.th}>
            URL Match
          </TableColumn>
          <TableColumn key="experiments" className={styles.th}>
            Used In
          </TableColumn>
          <TableColumn key="actions" className={styles.th}>
            Actions
          </TableColumn>
        </TableHeader>
        <TableBody
          items={rows.slice((page - 1) * rowsPerPage, page * rowsPerPage)}
        >
          {(item) => (
            <TableRow key={item.id} className={styles.row}>
              {(columnKey) => {
                if (columnKey === 'actions') {
                  return (
                    <TableCell>
                      <div className="relative flex items-center gap-2">
                        <span
                          className="text-lg text-default-400 cursor-pointer active:opacity-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingGoal(item._original);
                          }}
                        >
                          <EditIcon className={styles.editIcon} />
                        </span>
                        <span className="text-lg text-danger cursor-pointer active:opacity-50">
                          <DeleteIcon
                            className={styles.deleteIcon}
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (
                                confirm(
                                  'Are you sure you want to delete this goal?',
                                )
                              ) {
                                toast.promise(
                                  fetch(
                                    `${process.env.NEXT_PUBLIC_STELLAR_API}/api/goals/${item.id}`,
                                    {
                                      method: 'DELETE',
                                    },
                                  ).then(async (response) => {
                                    if (!response.ok) {
                                      const errorData = await response.json();
                                      console.log(errorData);
                                      throw new Error(
                                        errorData.error ||
                                          'An unknown error occurred',
                                      );
                                    }
                                    return response;
                                  }),
                                  {
                                    loading: 'Deleting goal...',
                                    success: async () => {
                                      await refetchProjects();
                                      return 'Goal deleted successfully';
                                    },
                                    error: (error) => {
                                      console.log(error);
                                      return `${
                                        error || 'Failed to delete goal'
                                      }`;
                                    },
                                  },
                                );
                              }
                            }}
                          />
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

      {editingGoal && (
        <GoalSetupModal
          experiment={null}
          goal={editingGoal}
          onClose={() => setEditingGoal(null)}
        />
      )}
    </>
  );
};

export default GoalsTable;
