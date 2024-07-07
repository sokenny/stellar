function getAuthTokenName() {
  return process.env.NODE_ENV === 'development'
    ? 'next-auth.session-token'
    : '__Secure-next-auth.session-token';
}

export default getAuthTokenName;
