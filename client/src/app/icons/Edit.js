'use client';

import colors from '../helpers/colors';

const Edit = ({ width = 20, height = 20 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="Layer_1"
      width={width}
      height={height}
      data-name="Layer 1"
      viewBox="0 0 24 24"
    >
      <defs>
        <style>
          {`.cls-1 { fill:none; stroke:${colors.lightGray}; stroke-miterlimit:10; stroke-width:1.91px; }`}
        </style>
      </defs>
      <path d="M20.59 12v10.5H1.5V3.41h11.46" className="cls-1" />
      <path
        d="m12 15.82-4.77.95.95-4.77 9.71-9.71a2.69 2.69 0 0 1 1.91-.79 2.7 2.7 0 0 1 2.7 2.7 2.69 2.69 0 0 1-.79 1.91Z"
        className="cls-1"
      />
    </svg>
  );
};

export default Edit;
