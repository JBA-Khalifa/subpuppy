import {BlocksController} from "./controller/BlocksController";
import {EventsController} from "./controller/EventsController";
import {ExtrinsicsController} from "./controller/ExtrinsicsController";

export const Routes = [{
    method: "get",
    route: "/block/:id",
    controller: BlocksController,
    action: "one"
}, {
    method: "get",
    route: "/extrinsic/:id",
    controller: ExtrinsicsController,
    action: "one"
}];