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
psql -c "select addcol('public','inventory', 'icn', 'varchar(16)' );"

tput setaf 6
echo "Database Migrations Added"
tput setaf 7
