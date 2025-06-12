#!/bin/bash
curl localhost:3000/api/properties -X POST -H "Authorization: Bearer ${token}" -d '{}' 
