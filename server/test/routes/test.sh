curl localhost:8081/users -XGET

curl localhost:8081/signup -XPOST -i -H "Content-Type: application/json" -d '{"email": "test@xyz.com", "password": "123", "firstName": "John", "lastName": "Smith"}'

curl localhost:8081/login -XPOST -i -H "Content-Type: application/json" -d '{"email": "test@xyz99.com", "password": "123"}'
{"auth":true,"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAeHl6OTkuY29tIiwiaWF0IjoxNTM5OTAzNzExLCJleHAiOjE1Mzk5OTAxMTF9.VN7j9ss3ECuEco_NATGGf8iE9vwesjvlfIyj56_rRA8"}


curl localhost:8081/login -XPOST -i -H "Content-Type: application/json" -d '{"email": "test@xyz.com", "password": "123"}'|grep x-access-token|sed 's/x-access-token: //'


curl localhost:8081/eventtypes -XGET

