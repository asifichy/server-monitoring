const { getRandomValues } = require("crypto");

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function doSomeHeavyTask() {
    const ms = getRandomInt([100, 150, 200, 300, 600, 500, 1000, 1400, 2500]);
    const shouldThrwoError = getRandomValue([1, 2, 3, 4, 5, 6, 7, 8,]) === 8;
    if(shouldThrwoError){
        const randomError = getRandomValue([
            "DB Payment Failure",
            "DB Server is Down",
            "Access Denied",
            "Not Found Error",
        ]);
        throw new Error(randomError);
    }
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(ms);
        }, ms);
    });
}

module.exports = {
    doSomeHeavyTask,
};

