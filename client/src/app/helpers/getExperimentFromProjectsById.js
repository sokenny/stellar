function getExperimentFromProjectsById(experimentId, projects) {
  for (let project of projects) {
    if (project.experiments) {
      const foundExperiment = project.experiments.find(
        (exp) => exp.id == experimentId,
      );
      if (foundExperiment) {
        return foundExperiment;
      }
    }
  }
  return null;
}

export default getExperimentFromProjectsById;
