function getVariantsTrafficInitialValues(variants) {
  return variants.reduce((acc, v) => {
    acc[`traffic_${v.id}`] = v.traffic;
    return acc;
  }, {});
}

export default getVariantsTrafficInitialValues;
