#!/bin/bash
curl localhost:3000/api/users -X POST -H "Authorization: Bearer ${token}"
