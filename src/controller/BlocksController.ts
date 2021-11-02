import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {Blocks} from "../entity/Blocks";
import { getBlockTimestamp } from "../chain/net";
import { parseBlock, parseBlocks } from "./services/parse";

export class BlocksController {

    private blocksRepository = getRepository(Blocks);

    // async all(request: Request, response: Response, next: NextFunction) {
    //     return this.blocksRepository.find();
    // }

    // async one(request: Request, response: Response, next: NextFunction) {
    //     return this.blocksRepository.findOne(request.params.id);
    // }

    // async save(request: Request, response: Response, next: NextFunction) {
    //     return this.blocksRepository.save(request.body);
    // }

    // async remove(request: Request, response: Response, next: NextFunction) {
    //     let userToRemove = await this.blocksRepository.findOne(request.params.id);
    //     await this.blocksRepository.remove(userToRemove);
    // }
    async getTimestamp(request: Request, response: Response, next: NextFunction) {
        return {
            code: 0,
            message: "Success",
            generated_at: Math.round((new Date()).getTime() / 1000),
            data: await getBlockTimestamp(),
        }
    }

    async getBlocks(request: Request, response: Response, next: NextFunction) {
        const req = request.body;
        const row = req.row;
        const page = req.page;

        if(page === undefined || row === undefined) return null;
        const sql = `select * from blocks order by block_num desc limit ${page}, ${row}`;
        const result: Array<Blocks> = await this.blocksRepository.query(sql);
        if(result.length === 0) return null;
        else return parseBlocks(result);
    }

    async getBlock(request: Request, response: Response, next: NextFunction) {
        const req = request.body;
        const block_num = req.block_num;
        const block_hash = req.block_hash;

        const sql = `select * from blocks where block_num = '${block_num}' or hash = '${block_hash}' limit 1`;
        const result: Array<Blocks> = await this.blocksRepository.query(sql);
        if(result.length === 0) return null;
        else return parseBlock(result[0]);
    }

    async getSearch(request: Request, response: Response, next: NextFunction) {
        const req = request.body;
        const key = req.key;
        const row = req.row;
        const page = req.page;

        if(key === undefined || row === undefined || page === undefined) return null;

        // Search block
        let r: Request = request;
        r.body.block_num = key;
        let result = this.getBlock(r, response, next);
        if(result !== null) return result;

        // Search extrinsic by extrinsic_index
        // TODO

        // Search extrinsic by extrinsic_hash
        // TODO

        // Search event by event_index
        // TODO

    }
}