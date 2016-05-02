#! /bin/sh

tput setaf 6
echo "Adding Database Migrations"
tput setaf 5

for i in core/db/migration/*.sql; do
  echo "Adding file: $i"
  psql -f "$i"
done
tput setaf 4

echo "Implementing Migrations"
#ADD MIGRATIONS BELOW
#Note: If this becomes very long, may need to make individual files for readability

psql -c "select addcol('public','users', 'last_login', 'timestamp', 'current_timestamp');"
psql -c "select addcol('public','media', 'fine_amount', 'real', '0.50');"
psql -c "CREATE TABLE newsbox (
          news_id serial PRIMARY KEY,
          heading character varying(250) NOT NULL,
          body character varying(1000) NOT NULL,
          img_link character varying(500) NOT NULL);"

tput setaf 6
echo "Database Migrations Added"
tput setaf 7
