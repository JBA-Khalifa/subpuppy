# SubPuppy 
### An awesome tool for fetching chain data from substrate-based blockchain to Mysql database, and serve an API service for remote loading.

## Install
Run `npm i` or `yarn` command

## Database configuration

Setup database settings inside `ormconfig.json` file

## Run
Run `yarn start` command to get help

## Command options
Examples:

### Fetch from block number 10000-20000
```
yarn start fetch -f 10000 -t 20000
```

### Fetch from block number 10000-20000, if the data already existed, update the current data. 
```
yarn start fetch -f 10000 -t 20000 -u
```
Default is passing without updating.

### Start API service, set port 3000
```
yarn start api -p 3000
```
Default port is `3000`

### Log File
located in `./info.log`

