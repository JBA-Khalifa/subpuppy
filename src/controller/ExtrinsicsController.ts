import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {Extrinsics} from "../entity/Extrinsics";
import { parseExtrinsic, parseExtrinsics, parseTransfersData } from "./services/parse";
import { keySort } from "./services/db";

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

    async getTransfers(request: Request, response: Response, next: NextFunction) {
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
        const inn: Array<Extrinsics> = await this.extrinsicsRepository.query(sql);
        if(out.length === 0 && inn.length === 0) return null;
        else {
            const ttl:Array<Extrinsics> = out.concat(inn);
            return parseTransfersData(ttl.sort(keySort('block_num', true)));
        }
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
        if(result.length === 0) return null;
        else return parseExtrinsics(result);
    }

    async getExtrinsic(request: Request, response: Response, next: NextFunction) {
        const req = request.body;
        const extrinsic_index = req.extrinsic_index;
        const hash = req.hash;
        const events_limit = req.events_limit;

        const sql = `select * from extrinsics where extrinsic_index = '${extrinsic_index}' or extrinsic_hash = '${hash}' order by block_num desc`;
        const result: Array<Extrinsics> = await this.extrinsicsRepository.query(sql);
        if(result.length === 0) return null;
        else return parseExtrinsic(result[0]);
    }



}
