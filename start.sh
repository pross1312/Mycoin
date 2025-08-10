#!/usr/bin/env bash
set -xe

index=$1
if [ -z $1 ];
then
    index=1
fi

cd frontend
npm run build
cd ..
rm  -rf ./backend/public
cp -r ./frontend/dist ./backend/public

cd backend
sh 'start.sh' "$index"
