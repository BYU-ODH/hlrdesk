#! /bin/sh

tput setaf 6 || true
echo "Adding Database Migrations"
tput setaf 5 || true

for i in core/db/migration/*.sql; do
  echo "Adding file: $i"
  psql -f "$i"
done
tput setaf 4 || true

echo "Implementing Migrations"
#ADD MIGRATIONS BELOW
#Note: If this becomes very long, may need to make individual files for readability

psql -c "select addcol('public','users', 'last_login', 'timestamp', 'current_timestamp');"
psql -c "select addcol('public','media', 'fine_amount', 'real', '0.50');"
psql -c "select addcol('public','media', 'code', 'varchar(2)', null);"
psql -c "select addcol('public','inventory', 'icn', 'varchar(16)', null);"
psql -c "create table IF NOT EXISTS locations(name varchar(32) PRIMARY KEY);"
psql -c "select addcol('public','inventory', 'location', 'varchar(32) REFERENCES locations (name)', null);"
psql -c "CREATE TABLE IF NOT EXISTS newsbox (
           news_id serial PRIMARY KEY,
           heading character varying(250) NOT NULL,
           body character varying(1000) NOT NULL,
           img_link character varying(3000) NOT NULL);"

tput setaf 6 || true
echo "Database Migrations Added"
tput setaf 7 || true
