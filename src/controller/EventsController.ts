import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {Events} from "../entity/Events";
import fs = require('fs');
import { Blocks } from "../entity/Blocks";
const eventTypes = JSON.parse(fs.readFileSync('./src/chain/types/eventTypes.json').toString()).eventTypes;

interface EventModule {
    module: string;
    event: string;
}

export class EventsController {

    private eventsRepository = getRepository(Events);

    // async all(request: Request, response: Response, next: NextFunction) {
    //     return this.eventsRepository.find();
    // }

    // async one(request: Request, response: Response, next: NextFunction) {
    //     return this.eventsRepository.findOne(request.params.id);
    // }

    // async save(request: Request, response: Response, next: NextFunction) {
    //     return this.eventsRepository.save(request.body);
    // }

    // async remove(request: Request, response: Response, next: NextFunction) {
    //     let userToRemove = await this.eventsRepository.findOne(request.params.id);
    //     await this.eventsRepository.remove(userToRemove);
    // }

    
    async rewardSlash(request: Request, response: Response, next: NextFunction) {
        const req = request.body;
        const row = req.row;
        const page = req.page;
        const address = req.address;
        
        const type = "0601"; // module is staking, event is Reward
        const where = address !== undefined ? `and INSTR(params, '${address}') > 0` : '';
        const sql = `select * from events where type = '${type}' ${where} order by block_num limit ${page}, ${row}`;
        const result: Array<Events> = await this.eventsRepository.query(sql);

        return await this.parseRewardSlash(result);
    }

    async parseRewardSlash(data: Array<Events>) {
        let events = [];
        for(let i = 0; i < data.length; i++) {
            const event: Events = data[i];
            const eventModule: EventModule = this.getEventModule(event.type);
            const params = JSON.parse(event.params);
            const timestamp: Array<Blocks> = await this.eventsRepository.query(`SELECT * FROM blocks WHERE block_num = ${event.block_num} limit 1`);

            const dat = {
                account: params[0],
                amount: params[1].toString(),
                block_num: event.block_num,
                block_timestamp: timestamp[0].block_timestamp,
                event_id: eventModule.event,
                event_idx: event.event_idx,
                event_index: event.event_index,
                extrinsic_hash: event.extrinsic_hash, // 暂时不用
                extrinsic_idx: event.extrinsic_idx, // 暂时不用
                module_id: eventModule.module,
                params: JSON.stringify([{
                    "type": "[U8; 32]", 
                    "value": params[0],
                }, {
                    "type": "U128",
                    "value": params[1].toString(),
                }]),
                stash: params[0],
            }
            events.push(dat);
        }
        return {
            code: 0,
            message: "Success",
            generated_at: Math.round((new Date()).getTime() / 1000),
            data: {
                count: events.length,
                list: events
            }
        }
    }

    getEventModule(type: string): EventModule {
        let re: EventModule = { module: '', event: '' };
        for(let t in eventTypes) {
            if(eventTypes[t].type === type) {
                re = {
                    module: eventTypes[t].module,
                    event: eventTypes[t].event,
                }
                break;   
            }
        }
        return re;
    }

}

/**
 * {
    "code": 0,
    "message": "Success",
    "generated_at": 1628587129,
    "data": {
        "count": 2,
        "list": [
            {
                "event_index": "1780256-3",
                "block_num": 1780256,
                "extrinsic_idx": 3,
                "module_id": "staking",
                "event_id": "Reward",
                "params": "[{\"type\":\"AccountId\",\"value\":\"0x6cf4b9ce8d60ca73a35f036cd58afbc52ecea4d691484586967ae1ed45a1c423\",\"valueRaw\":\"6cf4b9ce8d60ca73a35f036cd58afbc52ecea4d691484586967ae1ed45a1c423\"},{\"type\":\"Balance\",\"value\":\"129823168189\",\"valueRaw\":\"bd56103a1e0000000000000000000000\"}]",
                "extrinsic_hash": "0x7484200dc749d42f6233186081a47fc977b45deec7f95468e0e68d277acf033a",
                "event_idx": 5
            },
            {
                "event_index": "1780256-3",
                "block_num": 1780256,
                "extrinsic_idx": 3,
                "module_id": "staking",
                "event_id": "Reward",
                "params": "[{\"type\":\"AccountId\",\"value\":\"0x6cf4b9ce8d60ca73a35f036cd58afbc52ecea4d691484586967ae1ed45a1c423\",\"valueRaw\":\"6cf4b9ce8d60ca73a35f036cd58afbc52ecea4d691484586967ae1ed45a1c423\"},{\"type\":\"Balance\",\"value\":\"151198365253\",\"valueRaw\":\"45f61f34230000000000000000000000\"}]",
                "extrinsic_hash": "0x7484200dc749d42f6233186081a47fc977b45deec7f95468e0e68d277acf033a",
                "event_idx": 6
            }
        ]
    }
}
 */

/*
curl -X POST 'http://127.0.0.1:3000/api/scan/account/reward_slash' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_KEY' \
  --data-raw '{
    "row": 20,
    "page": 1,
    "address": "5GNER3tsmKkv7SmMpKBeKynKgBr5Bf2iriS1pzPFUuH5jehR"
  }'

curl -X POST 'https://kusama.api.subscan.io/api/scan/account/reward_slash' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_KEY' \
  --data-raw '{
    "row": 20,
    "page": 0,
    "address": "HNPmcMFUenVkonaVBzxknjjZ4uptXNirTamUEfCYp86o1af"
  }'

  */
