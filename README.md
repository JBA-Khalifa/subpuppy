# SubPuppy 
### An awesome tool for fetching chain data from substrate-based blockchain to Mysql database, and serve an API service for remote loading.

## Install
Run `npm i` or `yarn` command

## Database configuration

Setup database settings inside `ormconfig.json` file

## Run
Run `yarn start` command to get help as floowing:
```
Usage:  subpuppy fetch [options] or subpuppy api [options]

Options:
  -V, --version              output the version number
  -h, --help                 display help for command

Commands:
  fetch [options] [options]  Fetch substrate-based blockchain data
  api [options] [options]    Run API service
  help [command]             display help for command
```
Run `yarn start help fetch` to get help for fetch:
```
Usage: index fetch [options] [options]

Fetch substrate-based blockchain data

Options:
  -f --from <blockHeight>  from block height
  -t --to <blockHeight>    to block height
  -u --update              update existed block data allowed (default: false)
  -l --latest              Fetch data until latest block
  -h, --help               display help for command
```

## Examples:

### Fetch from block number 10000-20000
```
yarn start fetch -f 10000 -t 20000
```

### Fetch from block number 10000-20000, if the data already existed, update the current data. 
```
yarn start fetch -f 10000 -t 20000 -u
```
Default is passing without updating.

### Fetch the lastest block data.
```
yarn start fetch -l
```

### If you use pm2
```
pm2 start yarn -n subpuppy1030000~1050000 -- run fetch -f 1030000 -t 1050000
```

### Start API service, set port 3000
```
yarn start api -p 3000
```
Default port is `3000`


### Log File
located in `./info.log`

