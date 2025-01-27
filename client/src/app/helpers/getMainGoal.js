function getMainGoal(experiment) {
  return (
    experiment?.goals?.find((goal) => goal?.GoalExperiment?.is_main) ||
    experiment?.primaryGoal
  );
}

export default getMainGoal;
