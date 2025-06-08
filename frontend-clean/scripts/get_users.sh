#!/bin/bash
curl localhost:3000/api/users/search -X POST -H "Authorization: Bearer ${token}"
