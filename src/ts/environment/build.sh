#!/bin/bash

if [ $# -ne 1 ]; then
  echo "Usage: $0 [dev|staging|prod]"
  exit 1
fi

if [ "$1" = "dev" ]; then
  export NODE_ENV=dev
elif [ "$1" = "staging" ]; then
  export NODE_ENV=staging
elif [ "$1" = "prod" ]; then
  export NODE_ENV=prod
else
  echo "Invalid environment: $1"
  echo "Usage: $0 [dev|staging|prod]"
  exit 1
fi

echo "Environment set to $NODE_ENV"
tsc
