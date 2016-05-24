hlrdesk
=======
[![Code Climate](https://codeclimate.com/github/BYU-ODH/hlrdesk/badges/gpa.svg)](https://codeclimate.com/github/BYU-ODH/hlrdesk)
[![Test Coverage](https://codeclimate.com/github/BYU-ODH/hlrdesk/badges/coverage.svg)](https://codeclimate.com/github/BYU-ODH/hlrdesk)

[Recent Build Screenshots](https://byu-odh.github.io/hlrdesk)

## Requirements

* Node.js 0.12.x
* Postgres >= 9.3
* Redis

## Setup

### Configuration

You will need to set the following environment variables. The following
example is for a `~/.pam_environment` file on an Ubuntu machine. `npm start`
will attempt to evaluate this file (see `package.json` for details) if it
exists.

If you are running Dokku, specify the TZ environment variable to make
sure your time zone is accurate.

```bash
HLRDESK_DEV=true

# for false, uncomment the following line
#HLRDESK_DEV=

PORT=80 # this is unprefixed for Dokku's sake
HLRDESK_HOST=hlrdesk.byu.edu

# Postgres database values

PGPASSWORD=password
PGHOST=localhost
PGUSER=postgres
PGDATABASE=hlrdesk
PGPORT=5432
PGPOOLSIZE=10

# for Postgres versions < 9.4
PGPASS=password

#Google Analytics ID
GAID=UA-57856521-1

#Redis
REDIS_PORT=6379
REDIS_IP=hostname

# Email G00dness

EMAIL=hlr.dev.useyouremailN00Bulous@gmail.com
# note the cap
EMAILSERVICE=Gmail
EMAILPASS=my.password.here
```

## Commands

### Starting the server

`npm start`

### Sending reminder emails

You may want to automatically send out reminder emails to users about overdue
or soon-to-be due items.

```bash
# Send reminder emails for items that became due yesterday (and are now overdue)
npm run email-overdue

# Send reminder emails to users with items due within the next 24 hours
npm run email-reminder
```

### Testing

Test files can be found under `tests/`, with mock session data in
`tests/sessions/` and mock database data in `core/db/mock-data.sql`

Run `npm test` to run the tests.

### Deployment

Deployment to our servers can be done using one of the following commands and
should typically only take place through Travis.

Travis will deploy under these conditions, so long as the build passes.

1. **Commits** on **master** are deployed to **hlrdesk.hlrdev.byu.edu**
2. **Commits** on **staging** are deployed to **hlrdesk-staging.byu.edu**
3. **Tags** on **production** are deployed to **hlrdesk.byu.edu**

```bash

# automatically run when code is merged into development
npm run deploy dev # to update hlrdesk.hlrdev.byu.edu

# automatically run when code is merged into staging
npm run deploy staging # to update hlrdesk-staging.byu.edu

# automatically run when a commit is tagged, preferably
# by adding a release through Github's interface.
# Pushing to production automatically updates the database on staging.
# It is assumed that staging is up-to-date when a tag is added.
npm run deploy production # to update hlrdesk.byu.edu
```

If you need to re-deploy on the server (the server is down), run `dokku deploy hlrdesk` on the server.

All versions must needs be from the list of My Little Pony characters
http://mlp.wikia.com/wiki/Characters
