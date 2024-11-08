function isInAppBrowser() {
  const userAgent =
    window?.navigator?.userAgent || window?.navigator?.vendor || window?.opera;
  return /Instagram|FBAN|FBAV/.test(userAgent);
}

export default isInAppBrowser;
