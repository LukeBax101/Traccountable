const express = require('express');

const { addReading, deleteReading, editReading } = require('../functions/readings');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const reading = await addReading(req.metricId, req.body);
    req.socketio.emit('reading_new', {
      ...reading,
      track_id: req.trackId,
    });
    res.json(reading);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.patch('/:readingId', async (req, res) => {
try {
  const reading = await editReading(req.params.readingId, req.body);
  req.socketio.emit('reading_update', {
    ...reading,
    track_id: req.trackId,
  });
    res.json(reading);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.delete('/:readingId', async (req, res) => {
  try {
    const deleted = await deleteReading(req.params.readingId);
    req.socketio.emit('reading_delete', {
      reading_id: req.params.readingId,
      track_id: req.trackId,
      metric_id: req.metricId,
    });
    res.send(deleted);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

module.exports = router;
