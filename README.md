# Traccountable


Tracking app to hold you accountable for your metrics

Secrets:

 - Add a secret password file to the secrets folder, this will be the password for the database


Docker commands:

 - To start postgres database container:

```
./startdb.sh
```

 - To manage from inside container:

```
docker exec -it ta-postgres bash
psql -U postgres
```

 - To manage from host machine:

```
psql -h localhost -p 5431 -U postgres -W
```

- To shutdown database container

```
docker stop ta-postgres
docker rm ta-postgres
```
