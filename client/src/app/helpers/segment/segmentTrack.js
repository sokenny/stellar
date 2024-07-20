function segmentTrack(eventName, properties) {
  if (window.analytics) {
    window.analytics.track(eventName, properties);
  }
}

export default segmentTrack;
