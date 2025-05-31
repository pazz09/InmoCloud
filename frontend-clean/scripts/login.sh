export token=$(curl localhost:3000/api/users/login -X POST -H "content-type: application/json" -d '{"rut": "'$user'", "password":"'$password'"}'  2>/dev/null | jq .data.token | sed 's/"//g')
