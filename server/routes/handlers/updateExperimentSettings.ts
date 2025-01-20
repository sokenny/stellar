import { Op } from 'sequelize';
import db from '../../models';

async function updateExperimentSettings(req, res) {
  const { id } = req.params;

  const settings = req.body;

  if (settings.scheduled_start_date) {
    const scheduledStartDate = new Date(settings.scheduled_start_date);
    if (scheduledStartDate < new Date()) {
      return res.status(400).json({
        error: 'scheduled_start_date must be later than today',
      });
    }
  }

  if (settings.scheduled_end_date) {
    const scheduledEndDate = new Date(settings.scheduled_end_date);
    if (scheduledEndDate < new Date(settings.scheduled_start_date)) {
      return res.status(400).json({
        error: 'scheduled_end_date must be later than scheduled_start_date',
      });
    }
  }

  const experiment = await db.Experiment.findOne({
    where: {
      id,
    },
  });

  if (!experiment) {
    return res.status(404).json({ error: 'Experiment not found' });
  }

  await experiment.update({
    auto_finalize: settings.auto_finalize,
    queue_after: settings.queue_after,
    scheduled_start_date: settings.scheduled_start_date,
    scheduled_end_date: settings.scheduled_end_date,
    allow_parallel: settings.allow_parallel,
    smart_trigger: settings.smart_trigger,
  });

  console.log('settings --- !', settings);

  // respond with success
  res.json({ success: true });
}

export default updateExperimentSettings;
