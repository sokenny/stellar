'use client';

import colors from '../../helpers/colors';

const Check = ({
  width = 20,
  height = 20,
  color = colors.green,
  className,
}) => {
  return (
    <svg
      className={className}
      fill={color}
      height={height}
      width={width}
      viewBox="0 0 512 512"
    >
      <g>
        <g>
          <path
            d="M256,0C114.615,0,0,114.615,0,256s114.615,256,256,256s256-114.615,256-256S397.385,0,256,0z M219.429,367.932
			L108.606,257.108l38.789-38.789l72.033,72.035L355.463,154.32l38.789,38.789L219.429,367.932z"
          />
        </g>
      </g>
    </svg>
  );
};

export default Check;
