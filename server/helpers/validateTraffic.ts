// trafficValidator.ts or a similar file
interface TrafficObject {
  [key: string]: number;
}

function validateTraffic(reqBody: Record<string, any>): TrafficObject | Error {
  const trafficObj: TrafficObject = Object.keys(reqBody)
    .filter((key) => key.startsWith('traffic_'))
    .reduce((acc: TrafficObject, key: string) => {
      const id: string = key.split('_')[1];
      acc[id] = parseInt(reqBody[key], 10);
      return acc;
    }, {});

  const totalTraffic: number = Object.values(trafficObj).reduce(
    (sum, traffic) => sum + traffic,
    0,
  );

  if (totalTraffic !== 100) {
    return new Error('The sum of all traffic values must equal 100.');
  }

  return trafficObj;
}

export default validateTraffic;
