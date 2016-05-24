#!/bin/bash

# generates a random branch name, e.g., deploy-production-7f42c9
BRANCH=deploy-$1-$(echo $RANDOM | md5sum | cut -c 1-5)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
DUMP_FILE=.dump.sql

case "$1" in
  dev)
    REMOTE=hlrdev.byu.edu
    APP=hlrdesk
    DB=hlrdesk
    cd core/db
    ./drop-db.sh
    cat *.sql | psql $DEVELOPMENT_POSTGRES_URI $DB
    cd -
    ;;
  staging)
    # TODO: handle schema migrations
    REMOTE=hlrdesk-staging.byu.edu
    APP=hlrdesk-staging
    ;;
  production)
    # TODO: handle schema migrations
    REMOTE=hlrdesk-prod.byu.edu
    APP=hlrdesk
    ;;
  *)
    echo "Usage: npm run deploy {dev|staging|production}"
    exit 3
esac

test $(git diff --cached --numstat | wc -l) -gt 0 && echo -e "I'm sorry, $USER; I'm afraid I can't do that.\nFiles are currently staged. I refuse to push to the server unless you stash or commit these changes." && exit 1

git checkout --orphan $BRANCH

function restore {
  test -e $DUMP_FILE && rm $DUMP_FILE
  git checkout $CURRENT_BRANCH
  git branch -D $BRANCH
}

trap restore EXIT

npm run compile-sass
git add -f public/css/*
git commit -m "$1"
git push dokku@$REMOTE:$APP $BRANCH:master -f

if [[ "$1" == "production" ]]; then
  echo "Sending production data to staging server"
  PGPASS=$PROD_DB_PASS PGPASSWORD=$PROD_DB_PASS pg_dump $PROD_DB_NAME -h $PROD_DB_HOST -p $PROD_DB_PORT -U $PROD_DB_USER --no-owner > $DUMP_FILE
  PGPASS=$STAGE_DB_PASS PGPASSWORD=$STAGE_DB_PASS psql $STAGE_DB_NAME -h $STAGE_DB_HOST -p $STAGE_DB_PORT -U $STAGE_DB_USER -c "DROP SCHEMA IF EXISTS public cascade; CREATE SCHEMA public;"
  PGPASS=$STAGE_DB_PASS PGPASSWORD=$STAGE_DB_PASS psql $STAGE_DB_NAME -h $STAGE_DB_HOST -p $STAGE_DB_PORT -U $STAGE_DB_USER < $DUMP_FILE
fi
