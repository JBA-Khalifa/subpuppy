import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {Extrinsics} from "../entity/Extrinsics";

export class ExtrinsicsController {

    private extrinsicsRepository = getRepository(Extrinsics);

    async all(request: Request, response: Response, next: NextFunction) {
        return this.extrinsicsRepository.find();
    }

    async one(request: Request, response: Response, next: NextFunction) {
        return this.extrinsicsRepository.findOne(request.params.id);
    }

    async save(request: Request, response: Response, next: NextFunction) {
        return this.extrinsicsRepository.save(request.body);
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let userToRemove = await this.extrinsicsRepository.findOne(request.params.id);
        await this.extrinsicsRepository.remove(userToRemove);
    }

}