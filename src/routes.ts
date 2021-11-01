import {BlocksController} from "./controller/BlocksController";
import {EventsController} from "./controller/EventsController";
import {ExtrinsicsController} from "./controller/ExtrinsicsController";

export const Routes = [
// {
//     method: "get",
//     route: "/block/:id",
//     controller: BlocksController,
//     action: "one"
// }, {
//     method: "get",
//     route: "/extrinsic/:id",
//     controller: ExtrinsicsController,
//     action: "one"
// }, 
{
    method: "post",
    route: "/api/scan/transfers",
    controller: ExtrinsicsController,
    action: "transfers"
}, {
    method: "post",
    route: "/api/scan/account/reward_slash",
    controller: EventsController,
    action: "rewardSlash"
}];