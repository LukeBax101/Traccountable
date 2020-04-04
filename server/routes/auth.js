const express = require('express');
const bcrypt = require('bcrypt');

const { Track } = require('../db/models');
const { addTrack } = require('../functions/tracks');

const router = express.Router();

async function loginToTrack(req) {
  if (req && req.username && req.password) {
    let track;
    try {
      const trackRequest = await new Track({ ['username']: req.username }).fetch();
      track = await trackRequest.toJSON();
    } catch(e) {
      throw new Error('No matching username');
    }
    if (track.password_hash) {
      const valid = await bcrypt.compare(req.password, track.password_hash);
      if (valid) {
        return { trackId: track.track_id, username: req.username };
      } else {
        return { trackId: null, username: null };
      }
    } else {
      throw new Error('No matching username');
    }
  } else {
    throw new Error('Please provide a username and password')
  }
}

async function signup(req) {
  if (req && req.username && req.password) {
    const trackRequest = await Track.where({ ['username']: req.username }).fetchAll();
    const tracks = trackRequest.toJSON();
    if (tracks.length === 0) {
      const hash = await bcrypt.hash(req.password, 10);
      const track = await addTrack({ username: req.username, password_hash: hash });
      return { trackId: track.track_id, username: req.username };
    } else {
      throw new Error('Username already exists');
    }
  } else {
    throw new Error('Please provide a username and password');
  }
}

router.post('/login', async (req, res) => {
  try {
    const { trackId, username } = await loginToTrack(req.body);
    if (trackId) {
      res.cookie('track_id', trackId, {
        httpOnly: true,
        signed: true,
        // secure: true,
      });
      res.json({
        track_id: trackId,
        username,
      });
    } else {
      res.status(401).send('Invalid credentials')
    }
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { trackId, username } = await signup(req.body);
    if (trackId) {
      res.cookie('track_id', trackId, {
        httpOnly: true,
        signed: true,
        secure: req.app.get('env') === 'production',
      });
      res.json({
        track_id: trackId,
        username,
      });
    } else {
      res.status(400).send(`Couldn't sign up with those credentials`)
    }
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.get('/logout', (req, res) => {
  try {
    res.clearCookie('track_id');
    res.send('Logged out');
  } catch (e) {
    res.status(400).send(e.message);
  }
});

module.exports = router;
