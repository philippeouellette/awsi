#!/usr/bin/env bash

export AWS_SDK_LOAD_CONFIG=1

# Check the arguments
case "$1" in
  -d|--delete-cache)
    awsi_prompt --delete-cache
    ;;
  -h|--help)
    show_help
    ;;
  *)
    awsi_prompt
    ;;
esac