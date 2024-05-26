'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  Input,
  Button as NextUIButton,
  useDisclosure,
} from '@nextui-org/react';
import getVariantsTrafficInitialValues from '../../helpers/getVariantsTrafficInitialValues';
import DeleteIcon from '../../icons/Delete/Delete';
import EditIcon from '../../icons/Edit/Edit';
import EyeIcon from '../../icons/Eye/Eye';
import styles from './VariantsTable.module.css';
import useStore from '../../store';
import VariantModal from '../Modals/VariantModal';
import DeleteVariantModal from '../Modals/DeleteVariantModal';
import SnippetInstallationModal from '../Modals/SnippetInstallationModal';

const NameCell = ({ name, variantId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const inputRef = useRef(null); // Reference to the input element

  const handleSave = async () => {
    if (editedName === name) {
      console.log('No changes made.');
      setIsEditing(false);
      return;
    }

    setSaving(true);
    console.log('saving...', editedName);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/variant/${variantId}/name`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: editedName }),
        },
      );
      console.log('Save successful');
    } catch (error) {
      console.error('Save failed:', error);
    }
    setSaving(false);
    setIsEditing(false);
  };

  return (
    <div className={styles.nameCell} onClick={() => setIsEditing(true)}>
      {isEditing ? (
        <input
          type="text"
          ref={inputRef}
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onBlur={handleSave}
          autoFocus
          className={styles.nameInput}
        />
      ) : (
        <div className={styles.nameContainer}>{editedName}</div>
      )}

      {/* Optional: Show spinner when saving */}
      {saving && (
        <div className={`flex gap-4 ${styles.spinner}`}>
          <Spinner size="sm" />
        </div>
      )}
    </div>
  );
};

function getConversionRate(variantStats) {
  // TODO-p2: Add handling for scenarios where goal is session time
  if (!variantStats || !variantStats.sessions) {
    return '-';
  }
  return (
    ((variantStats.conversions / variantStats.sessions) * 100).toFixed(2) + '%'
  );
}

const VariantsTable = ({ variants = [], experiment }) => {
  variants.sort((a, b) => a.id - b.id);
  const [variantToEdit, setVariantToEdit] = useState(null);
  const [variantToDelete, setVariantToDelete] = useState(null);
  const [page, setPage] = React.useState(1);
  const hasStarted = experiment.started_at;
  const { stats, getExperimentStats, currentProject } = useStore();
  const missingSnippet = currentProject.snippet_status !== 1;
  const thisStats = stats[experiment.id];
  const {
    isOpen: isSnippetModalOpen,
    onOpen: onOpenSnippetModal,
    onOpenChange: onOpenSnippetModalChange,
  } = useDisclosure();

  useEffect(() => {
    if (hasStarted) {
      getExperimentStats(experiment.id);
    }
  }, [hasStarted, getExperimentStats]);

  function getVariantsRows(variants, hasStarted) {
    return variants.map((variant) => {
      const variantStats = thisStats?.find((v) => v.variantId === variant.id);
      return {
        id: variant.id,
        name: variant.name,
        traffic: <>{variant.traffic + '%'}</>,
        changes: variant?.modifications?.length,
        sessions: hasStarted ? variantStats?.sessions : '-',
        conversions: hasStarted ? variantStats?.conversions : '-',
        conversion_rate: hasStarted ? getConversionRate(variantStats) : '-',
        _isControl: variant.is_control,
      };
    });
  }

  const rows = getVariantsRows(variants, hasStarted);
  const rowsPerPage = 10;
  const pages = rows.length ? Math.ceil(rows.length / rowsPerPage) : 0;

  function handleOnView(variantId) {
    window.open(
      `${experiment.url}?stellarMode=true&experimentId=${experiment.id}&variantId=${variantId}&previewMode=true`,
      '_blank',
    );
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
          }}
        />
      )}
      <Table
        className={`${styles.table} ${rows.length ? '' : styles.empty} ${
          hasStarted ? styles.hasStarted : ''
        }`}
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
          <TableColumn key="traffic" className={styles.th}>
            Traffic
          </TableColumn>
          <TableColumn key="changes" className={styles.th}>
            Changes
          </TableColumn>
          <TableColumn key="sessions" className={styles.th}>
            Sessions
          </TableColumn>
          <TableColumn key="conversions" className={styles.th}>
            Conversions
          </TableColumn>
          <TableColumn key="conversion_rate" className={styles.th}>
            Conversion Rate
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
            <TableRow key={item?.id} className={styles.row}>
              {(columnKey) => {
                if (columnKey === 'actions') {
                  return (
                    <TableCell>
                      <div className="relative flex items-center gap-2">
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
                        <Tooltip
                          content={
                            'Can not edit a variant after the experiment has started.'
                          }
                          isDisabled={!hasStarted}
                          showArrow
                          className={styles.tooltip}
                          closeDelay={200}
                        >
                          <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                            <EditIcon
                              className={styles.editIcon}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (hasStarted) return;
                                setVariantToEdit(item.id);
                              }}
                            />
                          </span>
                        </Tooltip>
                        {!item._isControl && (
                          <Tooltip
                            content="Can not delete a variant after the experiment has started."
                            isDisabled={!hasStarted}
                            showArrow
                            className={styles.tooltip}
                            closeDelay={200}
                          >
                            <span className="text-lg text-danger cursor-pointer active:opacity-50">
                              <DeleteIcon
                                className={styles.deleteIcon}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (hasStarted) return;
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
                // if column key is name return
                if (columnKey === 'name') {
                  return (
                    <TableCell
                      className={`${styles['cell-' + columnKey]} ${
                        item._isControl ? styles['cell-control'] : ''
                      }`}
                    >
                      <NameCell name={item.name} variantId={item.id} />
                    </TableCell>
                  );
                }
                return (
                  <TableCell
                    className={`${styles['cell-' + columnKey]} ${
                      item._isControl ? styles['cell-control'] : ''
                    }`}
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
        />
      )}
    </>
  );
};

export default VariantsTable;
