import db from '../models';

async function launchJourney(req, res) {
  const { id } = req.params;

  // check it has not been launched

  // get experiment with this journey id and earliest start_date - check it has a goal set

  // set its column started_at to now (add columns started_at and edited_at to experiments table)
}

export default launchJourney;
