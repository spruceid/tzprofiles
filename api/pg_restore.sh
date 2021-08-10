#! /bin/bash

pg_restore -c --if-exists -v -d tzkt_db -U tzkt -1 /tmp/tzkt_db.backup
