import colors from '../helpers/colors';

const Close = ({ width = 18, height = 18 }) => (
  <svg width={width} height={height} fill="none" viewBox="0 0 24 24">
    <path
      fill={colors.lightGray}
      fillRule="evenodd"
      d="M19.207 6.207a1 1 0 0 0-1.414-1.414L12 10.586 6.207 4.793a1 1 0 0 0-1.414 1.414L10.586 12l-5.793 5.793a1 1 0 1 0 1.414 1.414L12 13.414l5.793 5.793a1 1 0 0 0 1.414-1.414L13.414 12l5.793-5.793z"
      clipRule="evenodd"
    />
  </svg>
);

export default Close;
