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
} from '@nextui-org/react';
import getVariantsTrafficInitialValues from '../../helpers/getVariantsTrafficInitialValues';
import DeleteIcon from '../../icons/Delete/Delete';
import EditIcon from '../../icons/Edit/Edit';
import EyeIcon from '../../icons/Eye/Eye';
import styles from './VariantsTable.module.css';
import useStore from '../../store';
import VariantModal from '../Modals/VariantModal';
import DeleteVariantModal from '../Modals/DeleteVariantModal';

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
  const { stats, getExperimentStats } = useStore();
  const thisStats = stats[experiment.id];

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
        // name: variant.name,
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
                            onClick={() => handleOnView(item.id)}
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
                return <TableCell>{getKeyValue(item, columnKey)}</TableCell>;
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

// Esto  capaz lo implementemos mas adelante
// const NameCell = ({ name }) => {
//   const [value, setValue] = useState(name);
//   const [isEditing, setIsEditing] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const textRef = useRef(null); // Reference to the div element

//   console.log('is editing: ', isEditing);

//   async function handleSave(data) {
//     setSaving(true);
//     setIsEditing(false);
//     console.log('saving...', data);
//   }

//   return (
//     <div
//       className={styles.nameCell}
//       onClick={() => setIsEditing(true)}
//       contentEditable={isEditing}
//       ref={textRef}
//       suppressContentEditableWarning={true}
//     >
//       {isEditing ? (
//         <Input
//           focus
//           size={'sm'}
//           type="text"
//           value={value}
//           onChange={(e) => setValue(e.target.value)}
//           onBlur={handleSave}
//         />
//       ) : (
//         <>
//           <div>{name}</div>
//           {!saving && (
//             <div className={styles.edit}>
//               <EditIcon />
//             </div>
//           )}
//         </>
//       )}

//       {saving && (
//         <div className={`flex gap-4 ${styles.spinner}`}>
//           <Spinner size="sm" />
//         </div>
//       )}
//     </div>
//   );
// };