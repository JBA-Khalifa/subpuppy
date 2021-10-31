import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {Events} from "../entity/Events";

export class EventsController {

    private eventsRepository = getRepository(Events);

    async all(request: Request, response: Response, next: NextFunction) {
        return this.eventsRepository.find();
    }

    async one(request: Request, response: Response, next: NextFunction) {
        return this.eventsRepository.findOne(request.params.id);
    }

    async save(request: Request, response: Response, next: NextFunction) {
        return this.eventsRepository.save(request.body);
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let userToRemove = await this.eventsRepository.findOne(request.params.id);
        await this.eventsRepository.remove(userToRemove);
    }
    
}
/*
curl -X POST 'http://127.0.0.1:3000/api/scan/transfers' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_KEY' \
  --data-raw '{
    "row": 10,
    "page": 1
  }'
*/