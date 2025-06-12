#!/bin/bash
curl localhost:3000/api/payments/search -X POST -H "Authorization: Bearer ${token}" | jq .
