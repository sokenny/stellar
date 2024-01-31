function getSortedVariants(variants) {
  if (!variants) return [];

  const nonControlVariants = variants.filter((v) => !v.is_control);

  nonControlVariants.sort((a, b) => {
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return 0;
  });

  const controlVariant = variants.find((v) => v.is_control);
  const sortedVariants = [
    ...(controlVariant ? [controlVariant] : []),
    ...nonControlVariants,
  ];

  return sortedVariants;
}

export default getSortedVariants;
