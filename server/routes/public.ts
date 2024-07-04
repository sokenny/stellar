import express from 'express';
import getExperimentsForClient from './handlers/getExperimentsForClient';

const router = express.Router();

router.get('/experiments/client', getExperimentsForClient);

export default router;
