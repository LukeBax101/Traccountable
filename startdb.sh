#!/usr/bin/env bash

echo "Starting database container"
docker run -p 5431:5432 --name ta-postgres-v "`pwd`/database/volume:/var/lib/postgresql/data" -v "`pwd`/secrets:/run/secrets" -v "`pwd`/database/init:/docker-entrypoint-initdb.d" -e POSTGRES_PASSWORD_FILE=/run/secrets/password -d postgres
