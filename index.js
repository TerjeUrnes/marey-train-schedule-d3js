import { MareyTrainSchedule } from "./marey-train-schedule.js";

document.addEventListener('readystatechange', function () {
    if (document.readyState === 'complete') {
        console.log("init");
        let instance = new MareyTrainSchedule();
    }
});