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
        const out: Array<Extrinsics> = await this.extrinsicsRepository.query(sql);

        // in
        where = address !== undefined ? `and INSTR(params, '${address}') > 0` : '';
        sql = `select * from extrinsics where call_module = 'balances' ${where} ${fromBlock} ${toBlock} order by block_num desc limit ${page}, ${row};`;
        const inn = await this.extrinsicsRepository.query(sql);

        return this.parseTransfersData(out.concat(inn));
    }

    async getExtrinsics(request: Request, res: Response, next: NextFunction) {
        const req = request.body;
        const row = req.row;
        const page = req.page;
        const signed = req.signed;
        const address = req.address;
        const module = req.module;
        const call = req.call;
        const block_num = req.block_num;

        if(page === undefined || row === undefined) return null;

        const where_address = address !== undefined ? `and account_id = '${address}'` : '';
        const where_signed = signed !== undefined ? `and is_signed = ${signed}` : '';
        const where_module = module !== undefined ? `and call_module = '${module}'` : '';
        const where_call = call !== undefined ? `and call_module_function = '${call}'` : '';
        const where_block_num = block_num !== undefined ? `and block_num = ${block_num}` : '';

        const sql = `select * from extrinsics where id > 0 ${where_address} ${where_signed} ${where_module} ${where_call} ${where_block_num} order by block_num desc limit ${page}, ${row}`;
        const result: Array<Extrinsics> = await this.extrinsicsRepository.query(sql);
        return this.parseExtrinsics(result);
    }

    parseExtrinsics(data: Array<Extrinsics>) {
        let extrinsics = [];
        for(let i = 0; i < data.length; i++) {
            const extrinsic: Extrinsics = data[i];
            extrinsics.push({
                account_display:    extrinsic.account_id,
                account_id:         extrinsic.account_id,
                account_index:      '',
                block_num:          extrinsic.block_num,
                block_timestamp:    extrinsic.block_timestamp,
                call_module:        extrinsic.call_module,
                call_module_function: extrinsic.call_module_function,
                extrinsic_hash:     extrinsic.extrinsic_hash,
                extrinsic_index:    extrinsic.extrinsic_index,
                fee:                extrinsic.fee.toString(),
                nonce:              extrinsic.nonce,
                params:             JSON.stringify([{
                                        "name": extrinsic.call_module_function, 
                                        "type": "Vec<sp_runtime:multiaddress:MultiAddress>", 
                                        "value": [ {
                                            "Id": extrinsic.params.substr(1, extrinsic.params.length - 2)
                                        }]
                                    }]),
                signature:          extrinsic.signature,
                success:            extrinsic.success == 1 ? true : false,
            })
        }
        return {
            code: 0,
            message: "Success",
            generated_at: Math.round((new Date()).getTime() / 1000),
            data: {
                count: extrinsics.length,
                extrinsics,
            }
        }
    }

    parseTransfersData(data: Array<Extrinsics>) {
        let transfers = [];
        for(let i = 0; i < data.length; i++) {
            const extrinsic: Extrinsics = data[i];
            transfers.push({
                amount:             (parseInt(extrinsic.params.split(',')[1]) / 1e9).toString(),
                block_num:          extrinsic.block_num,
                block_timestamp:    extrinsic.block_timestamp,
                extrinsic_index:    extrinsic.extrinsic_index,
                fee:                extrinsic.fee,
                from:               extrinsic.account_id,
                from_account_display: {
                    address: extrinsic.account_id,
                    display: "",
                    judgements: null,
                    account_index: "",
                    identity: false,
                    parent: null,
                },
                hash:               extrinsic.extrinsic_hash,
                module:             extrinsic.call_module,
                nonce:              extrinsic.nonce,
                success:            extrinsic.success === 1,
                to:                 extrinsic.params.split(',')[0],
                to_account_display: {
                    address: extrinsic.params.split(',')[0],
                    display: "",
                    judgements: null,
                    account_index: "",
                    identity: false,
                    parent: null,
                }
            })
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
