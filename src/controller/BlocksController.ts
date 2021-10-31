import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {Blocks} from "../entity/Blocks";

export class BlocksController {

    private blocksRepository = getRepository(Blocks);

    async all(request: Request, response: Response, next: NextFunction) {
        return this.blocksRepository.find();
    }

    async one(request: Request, response: Response, next: NextFunction) {
        return this.blocksRepository.findOne(request.params.id);
    }

    async save(request: Request, response: Response, next: NextFunction) {
        return this.blocksRepository.save(request.body);
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let userToRemove = await this.blocksRepository.findOne(request.params.id);
        await this.blocksRepository.remove(userToRemove);
    }

}