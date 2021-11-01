#! /usr/bin/env node
import "reflect-metadata";
import { Connection, createConnection } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { Routes } from "./routes";
import { Blocks } from "./entity/Blocks";
import { Extrinsics } from "./entity/Extrinsics";
import { Events } from "./entity/Events";
import { connect, fetchExtrinsics, fetchEvents, fetchBlocks, getBlockHash, getLastestHeight } from './chain/net';
import { BlockHash } from '@polkadot/types/interfaces';
import { ChainData, SubBlock, SubEvent, SubExtrinsic } from './chain/types/types';
import { logger } from "./logger";
import { program } from "commander";
import { exit } from "process";

let updateAllowed = false;
let fetchingData = false;

/** Commanders: 
 *  fetch: start fetching service
 *  api:   start api service, no options
 *  
 *  options: 
 *  -f: from block height
 *  -t: to block height, default is latest block height
 *  -u: update allowed, default is false
 *  -p: API port
 *  -l: update to latest block
 */

program
    .allowUnknownOption()
    .version('0.1.3')
    .usage('subpuppy fetch [options] or subpuppy api [options]')

program
    .command('fetch [options]')
    .description('Fetch substrate-based blockchain data')
    .option('-f --from <blockHeight>', 'from block height')
    .option('-t --to <blockHeight>', 'to block height')
    .option('-u --update', 'update existed block data allowed', false)
    .option('-l --latest', 'Fetch data until latest block')
    .action((name, options, command) => {
        // console.log(options.from, options.to, options.update);
        updateAllowed = options.update;
        createConnection().then(async connection => {
            await connect();
            if(options.latest) {
                setInterval(async() => {
                    if(!fetchingData) {
                        const latestHeight = await getLastestHeight();
                        const dbHeight = await getDBHeight(connection);
                        await fetchChainData(
                            connection,
                            dbHeight + 1,
                            latestHeight
                        )
                    }
                }, 12000);
            } else {
                await fetchChainData(
                    connection, 
                    parseInt(options.from),
                    parseInt(options.to)
                );
                exit(0);    
            }
        }).catch(error => logger.error(error));
    })

program
    .command('api [options]')
    .description('Run API service')
    .option('-p --port <Port>', 'API port', '3030')
    .action((name, options, command) => {
        logger.info('Starting API...')
        // create express app
        createConnection().then(async connection => {
            const app = express();
            app.use(bodyParser.json());

            Routes.forEach(route => {
                (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
                    const result = (new (route.controller as any))[route.action](req, res, next);
                    if (result instanceof Promise) {
                        result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);

                    } else if (result !== null && result !== undefined) {
                        res.json(result);
                    }
                });
            });

            app.listen(parseInt(options.port));
            logger.info(`Express server has started on port ${options.port}.`);
        }).catch(error => console.log(error));
    })

if(!process.argv[2]) {
    program.help();
}
program.parse(process.argv);


async function fetchChainData(conn: Connection, startBlockHeight: number, endBlockHeight: number) {
    if(endBlockHeight < startBlockHeight) return;
    fetchingData = true;

    for (let i = 0; i <= endBlockHeight - startBlockHeight; i++) {
        const h: number = startBlockHeight + i;
        if(await checkIfExists(conn, h) && !updateAllowed) continue;
        const blockHash: BlockHash = await getBlockHash(h);
        const block: SubBlock = await fetchBlocks(h, blockHash);
        if(block == null) continue;
        const extrinsics: Array<SubExtrinsic> = await fetchExtrinsics(h, blockHash);
        const events: Array<SubEvent> = await fetchEvents(h, blockHash);
        await saveChainData({
            block,
            extrinsics,
            events
        }, conn);
    }
    fetchingData = false;
}

async function checkIfExists(conn: Connection, height: number): Promise<boolean> {
    const record: Blocks = await conn.manager.findOne(Blocks, {block_num: height});
    return record != null;
}

async function saveChainData(chainData: ChainData, conn: Connection) {
    let action = '';
    try {
        // Blocks
        const record: Blocks = await conn.manager.findOne(Blocks, { hash: chainData.block.hash });
        if(record == null) {
            action = 'Add';
            await conn.manager.save(conn.manager.create(Blocks, chainData.block));
        } else if (updateAllowed) {
            action = 'Update';
            await conn.manager.update(Blocks, record.id, { ...chainData.block });
        } else {
            logger.info(`Pass Block Data #${chainData.block.block_num} Hash: ${chainData.block.hash} OK`);
            return;
        }

        if(action !== '') {
            // Extrinsics
            for(let i = 0; i < chainData.extrinsics.length; i++) {
                const record: Extrinsics = await conn.manager.findOne(Extrinsics, { 
                    extrinsic_index: chainData.extrinsics[i].extrinsic_index 
                })
                if(record == null) {
                    await conn.manager.save(conn.manager.create(Extrinsics, chainData.extrinsics[i]));
                } else if (updateAllowed) {
                    await conn.manager.update(Extrinsics, record.id, { ...chainData.extrinsics[i]});
                }
            }

            // Events
            for(let i = 0; i < chainData.events.length; i++) {
                const record: Events = await conn.manager.findOne(Events, {
                    event_index: chainData.events[i].event_index
                })
                if(record == null) {
                    await conn.manager.save(conn.manager.create(Events, chainData.events[i]));
                } else if (updateAllowed) {
                    await conn.manager.update(Events, record.id, { ...chainData.events[i] });
                }
            }
            logger.info(`${action} Block Data #${chainData.block.block_num} Hash: ${chainData.block.hash} OK`);
        }
    } catch (error) {
        logger.error(`ERROR #${chainData.block.block_num} ${error.message}`);
    }
}

async function getDBHeight(conn: Connection): Promise<number> {
    const sql = "select * from blocks order by block_num desc limit 1";
    const record: Array<Blocks> = await conn.manager.query(sql);
    return record[0].block_num;
}