import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {Point} from "../entity/Point";
import { nullObject } from "./services/parse";

export class ExtrinsicsController {

    private extrinsicsRepository = getRepository(Point);
    
    async getPoints(request: Request, response: Response, next: NextFunction) {
        const req = request.body;
        const validator = req.validator;
        const era = req.era;
        const from = req.from;
        const to = req.to;

        if(validator === undefined) return nullObject;

        // TODO
        
    }



}
