#!/bin/bash
set -e

TEST_DB_RANDOM=`printf "%x" $RANDOM`
TEST_DB_PREFIX=hlrdesk_test_db_$TEST_DB_RANDOM
TEST_DB=$TEST_DB_PREFIX
TEMPLATE_DB=hlrdesk_test_template_db
DB_FILES=core/db/*.sql
CASPER_BIN=$(npm root)/casperjs/bin/casperjs
ISTANBUL_BIN=$(npm root)/istanbul/lib/cli.js
MOCHA_BIN=$(npm root)/mocha/bin/_mocha

export $(./.env.sh)

printf "Creating and populating test database $TEST_DB"
dropdb $TEMPLATE_DB --if-exists > /dev/null 2>&1
printf "."
dropdb $TEST_DB --if-exists > /dev/null 2>&1
printf "."
createdb $TEST_DB > /dev/null
printf "."
createdb $TEMPLATE_DB > /dev/null
printf "."
cat $DB_FILES | psql $TEMPLATE_DB > /dev/null
printf "."
dropdb $TEST_DB --if-exists > /dev/null
printf "."
createdb $TEST_DB -T $TEMPLATE_DB > /dev/null
printf " Done!\n"

export NODE_TEST=true
export PGPOOLSIZE=0
export HOSTNAME=localhost
export EMAIL=nodetest@example.com
export PGDATABASE=$TEST_DB
export TEST_DB_PREFIX=$TEST_DB_PREFIX
export TEMPLATE_DB=$TEMPLATE_DB
export PHANTOMJS_EXECUTABLE=$(npm root)/casperjs/node_modules/phantomjs/bin/phantomjs
export EMAILSERVICE=

# NOTE: potential race condition
which netstat && \
  USED_PORTS=`netstat -lnt | awk '{print $4}' | tail -n+3 | awk -F ":" '{print $NF}' | sort -nr | uniq`

function get_unused_port() {
  # modified from Chris Down's post on StackExchange
  # http://unix.stackexchange.com/a/55918/37560
  read lowerPort upperPort < /proc/sys/net/ipv4/ip_local_port_range
  while :; do
    port=`expr $(($RANDOM % ($upperPort + 1 - $lowerPort))) + $lowerPort`
    [[ $USED_PORTS =~ $port ]] || break
  done
  echo $port
}

export SMTP_PORT=`get_unused_port`

function cleanupPostgres {
  TEST_DBS_TO_DELETE=`psql -Atqc "SELECT datname FROM pg_database WHERE datistemplate IS FALSE AND datname LIKE '${TEST_DB_PREFIX}%';"`
  echo "Deleting `echo $TEST_DBS_TO_DELETE | wc -w` test databases; this may take some time."
  for i in $TEST_DBS_TO_DELETE; do
    dropdb $i
    printf "."
  done
  echo " Done!"
}
trap cleanupPostgres EXIT

# NB: the istanbul harmony branch broke because an older version of esprima no longer builds
# the latest stable version of istanbul does not support generator functions
#
#node --harmony $ISTANBUL_BIN --harmony cover $MOCHA_BIN -- --require co-mocha --harmony tests/ "$@"

node --harmony $MOCHA_BIN --require co-mocha --harmony tests/ "$@"

export PORT=`get_unused_port`
echo "Starting server in background on port $PORT"
nohup npm run server -- COME_AND_GET_ME &>nohup.out &

function killserver {
  FAIL=$?
  cleanupPostgres
  pkill -f COME_AND_GET_ME || :
  if [[ $FAIL -ne  0 ]]; then
    exit $FAIL
  fi
  exit 0
}
trap killserver EXIT

TIME=5
printf "Sleeping $TIME seconds to ensure server is ready"

for i in `seq 1 $TIME`;
do
  printf "."
  sleep 1
done
printf "\n"

npm run compile-sass
echo "Running CasperJS tests."
echo "Screenshots saved to tests/screenshots/"

CASPER_STATUS=0
for i in `ls tests/casperjs/*.js`; do
  # ugly, but CasperJS won't run all our files in one command
  OUTPUT=`mktemp`
  ERROR_LOG=tests/logs/slimer-`basename $i`.txt
  $CASPER_BIN --engine=slimerjs --ssl-protocol=any --error-log-file="$ERROR_LOG" test $i | tee -i $OUTPUT
  # remove color, if found (thanks to Zhoul on http://www.commandlinefu.com/commands/view/3584/remove-color-codes-special-characters-with-sed)
  sed "s,\x1B\[[0-9;]*[a-zA-Z],,g" $OUTPUT | grep -e "^FAIL " >/dev/null && CASPER_STATUS=1 || :
  echo "Any JavaScript error logs sent to $ERROR_LOG"
done
exit $CASPER_STATUS
