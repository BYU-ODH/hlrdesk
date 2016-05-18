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

tput setaf 6 || true
echo "Database Migrations Added"
tput setaf 7 || true
