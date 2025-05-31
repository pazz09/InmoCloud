#!/bin/bash

# Default values
name=""
property=""

# Parse options
while getopts "n:p:" opt; do
  case $opt in
    n) name="$OPTARG"
       ;;
    p) property="$OPTARG"
       ;;
    *) echo "Usage: $0 -n <name> -p <property>"
       exit 1
       ;;
  esac
done

# You must set the token variable before running the script
if [ -z "$token" ]; then
  echo "Error: token variable not set."
  exit 1
fi

# Prepare JSON body
json_body=$(jq -n \
  --arg name "$name" \
  --arg property "$property" \
  '{name: $name, property_name: $property}')

# Make the POST request
curl localhost:3000/api/users \
  -X POST \
  -H "Authorization: Bearer ${token}" \
  -H "Content-Type: application/json" \
  -d "$json_body"
