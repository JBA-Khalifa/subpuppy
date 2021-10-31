# SubPuppy 
## - an awesome tool for fetching chain data from substrate-based blockchain and store to mysql database, serve an API service for remote loading.

Steps to run this project:

1. Run `npm i` or `yarn` command
2. Setup database settings inside `ormconfig.json` file
3. Run `yarn start` command to get help
4. Example:
```
yarn start fetch -f 10000 -t 20000 // Fetch from block number 10000-20000

yarn start fetch -f 10000 -t 20000 -u // Fetch from block number 10000-20000, if the data have been fetched, update the existed data, default is passing without updating.

yarn start api -p 3000 // Start API service, set port 3000
```
