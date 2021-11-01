import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {Extrinsics} from "../entity/Extrinsics";

export class ExtrinsicsController {

    private extrinsicsRepository = getRepository(Extrinsics);

    // async all(request: Request, response: Response, next: NextFunction) {
    //     return this.extrinsicsRepository.find();
    // }

    // async one(request: Request, response: Response, next: NextFunction) {
    //     return this.extrinsicsRepository.findOne(request.params.id);
    // }

    // async save(request: Request, response: Response, next: NextFunction) {
    //     return this.extrinsicsRepository.save(request.body);
    // }

    // async remove(request: Request, response: Response, next: NextFunction) {
    //     let userToRemove = await this.extrinsicsRepository.findOne(request.params.id);
    //     await this.extrinsicsRepository.remove(userToRemove);
    // }

    async transfers(request: Request, response: Response, next: NextFunction) {
        const req = request.body;
        const row = req.row;
        const page = req.page;
        const address = req.address;
        const from_block = req.from_block;
        const to_block = req.to_block;

        if(page === undefined || row === undefined) return null;
        
        // out
        let where = address !== undefined ? `and account_id = '${address}'` : '';
        const fromBlock = from_block !== undefined ? `and block_num >= ${from_block}` : '';
        const toBlock = to_block !== undefined ? `and block_num <= ${to_block}` : '';
        let sql = `select * from extrinsics where call_module = 'balances' ${where} ${fromBlock} ${toBlock} order by block_num desc limit ${page}, ${row};`;
        // console.log(sql);
        const out: Array<Extrinsics> = await this.extrinsicsRepository.query(sql);
        // console.log(this.parseTransfersData(out, 1));

        // in
        where = address !== undefined ? `and INSTR(params, '${address}') > 0` : '';
        sql = `select * from extrinsics where call_module = 'balances' ${where} ${fromBlock} ${toBlock} order by block_num desc limit ${page}, ${row};`;
        // console.log(sql);
        const inn = await this.extrinsicsRepository.query(sql);
        // console.log(this.parseTransfersData(inn, 2));

        return {
            out: this.parseTransfersData(out),
            in: this.parseTransfersData(inn)
        }
    }

    parseTransfersData(data: Array<Extrinsics>) {
        let transfers = [];
        for(let i = 0; i < data.length; i++) {
            const extrinsic: Extrinsics = data[i];
            const transfer = {
                amount:             parseInt(extrinsic.params.split(',')[1]) / 1e9,
                block_num:          extrinsic.block_num,
                block_timestamp:    extrinsic.block_timestamp,
                extrinsic_index:    extrinsic.extrinsic_index,
                fee:                extrinsic.fee,
                from:               extrinsic.account_id,
                from_account_display: {},
                hash:               extrinsic.extrinsic_hash,
                module:             extrinsic.call_module,
                nonce:              extrinsic.nonce,
                success:            extrinsic.success === 1,
                to:                 extrinsic.params.split(',')[0],
                to_account_display: {}
            }
            transfers.push(transfer);
        }
        return {
            code: 0,
            message: "Success",
            generated_at: Math.round((new Date()).getTime() / 1000),
            data: {
                count: transfers.length,
                transfers,
            }
        }
    }
}


/*
curl -X POST 'http://127.0.0.1:3000/api/scan/transfers' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_KEY' \
  --data-raw '{
    "row": 20,
    "page": 1,
    "from_block": 1000000,
    "to_block": 1010000,
    "address": "5GNER3tsmKkv7SmMpKBeKynKgBr5Bf2iriS1pzPFUuH5jehR"
  }'
*/

/** 
 * {
    id: 6321,
    extrinsic_index: '1172010-1',
    block_num: 1172010,
    block_timestamp: 1635608442,
    extrinsic_length: '',
    version_info: '',
    call_code: '0400',
    call_module_function: 'transfer',
    call_module: 'balances',
    params: '5DHbeNM6317fuduTB2x6Z2P4AeWVghvF9Wc4EEX4xn5346AG,100000000000',
    account_id: '5DPQ6FSKVbdxFdai4x4keMKjpEiswR3a8MHhio7p67HFmr8K',
    signature: '0xbe48a03bab812076784ad97728136f5d4c312f99af48400d6cee464d506fc13d01939daa99524620055721e7f50a7214b6b841ac213cb4641a6ca949434a9b8c',
    nonce: 7351,
    era: '0x00',
    extrinsic_hash: '0x0b797ed860927231a8821d8431530787bdda0ef09a60d8f58b7427dd576dc9cf',
    is_signed: 1,
    success: 1,
    fee: '0'
  }
*/

/**
 * {
    "code": 0,
    "data": {
        "count": 207304,
        "transfers": [
            {
                "amount": "1",
                "block_num": 2028585,
                "block_timestamp": 1602732066,
                "extrinsic_index": "2028585-2",
                "fee": "154000000",
                "from": "1t8SpsoGckWBT7rdG7mpFdXxcT3hiQZEH3bGga6vi1wnm7h",
                "from_account_display": {
                    "account_index": "",
                    "address": "1t8SpsoGckWBT7rdG7mpFdXxcT3hiQZEH3bGga6vi1wnm7h",
                    "display": "",
                    "identity": false,
                    "judgements": null,
                    "parent": "",
                    "parent_display": ""
                },
                "hash": "0xdfcb85ab383b8cd30e2f8e76e99432e9961e59432b5d8f88712457f51988fe44",
                "module": "balances",
                "nonce": 8,
                "success": true,
                "to": "14i4t1FyBknoyEwoj3BXBZmboHT3aNK345XZ2YHGeRUYRkL6",
                "to_account_display": {
                    "account_index": "",
                    "address": "14i4t1FyBknoyEwoj3BXBZmboHT3aNK345XZ2YHGeRUYRkL6",
                    "display": "",
                    "identity": false,
                    "judgements": null,
                    "parent": "",
                    "parent_display": ""
                }
            }
        ]
    },
    "message": "Success",
    "generated_at": 1628587129
}
*/