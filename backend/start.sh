#!/usr/bin/env bash
set -xe

index=$1
if [ -z $1 ];
then
    index=1
fi

mkdir -p "./dist/data"
KEY_FILE="./dist/data/$index.pem" DATA_FILE="./dist/data/$index.json" PORT="900$index" P2P_PORT="1900$index" npm run start
