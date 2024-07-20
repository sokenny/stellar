function segmentIdentify(userId, traits) {
  if (window.analytics) {
    window.analytics.identify(userId, traits);
  }
}

export default segmentIdentify;
