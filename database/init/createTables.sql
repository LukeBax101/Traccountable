CREATE TABLE tracks (track_id UUID PRIMARY KEY, username VARCHAR(255),  password_hash VARCHAR(255));

CREATE TABLE metrics (metric_id UUID PRIMARY KEY, track_id UUID REFERENCES tracks(track_id), name VARCHAR(255), units VARCHAR(255), colour VARCHAR(255), active BOOLEAN);

CREATE TABLE readings (reading_id UUID PRIMARY KEY, metric_id UUID REFERENCES metrics(metric_id), value DOUBLE PRECISION, read_at TIMESTAMP);
