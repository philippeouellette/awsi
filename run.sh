#!/usr/bin/env bash

export AWS_SDK_LOAD_CONFIG=1

# Usage function
show_help() {
  echo "Usage: $0 [OPTIONS]"
  echo "Options:"
  echo "  -d, --delete-cache   Delete the AWS SDK configuration cache"
  echo "  -h, --help           Show this help message"
}

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