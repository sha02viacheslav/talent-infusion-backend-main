
# Talent Infusion API


## Enviroment setup
```bash
 # Create the folder config at root of app and add file default.yml or production.yml if env is set to 
 # production.yml like. 

server:
  host: 0.0.0.0
  port: 3000
database:
 url: mongodb://localhost/talent-infusion
jwt:
 secretkey: talent-infusion-api
  
```


## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```