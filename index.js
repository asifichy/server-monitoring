const express = require('express');
const client = require('prom-client'); //metric collection
const responseTime = require('response-time');
const { createLogger, transports } = require("winston");
const { doSomeHeavyTask } = require('./util');

const app = express();
const PORT = process.env.PORT || 8000;

const collectionDefualtMetrics = client.collectDefaultMetrics;

collectionDefualtMetrics({ register: client.register });

app.get("/", (req, res) => {
  logger.info('Req came to / route');
  return res.json({ message: `Hello World` });
});

app.get("/slow", async (req, res) => {
  try {
    logger.info('Req came to / slow route');
    const timeTaken = await doSomeHeavyTask();
    return res.json({
      status: "Success",
      message: `Heavy task completed in ${timeTaken}ms`
    });
  }
  catch (err) {
    return res.status(500).json({
      status: "Failed",
      error: "Internal Server Error",
    })
  }
});

//historgram metreics
const reqResTime = new client.Histogram({
  name: 'http_express_req_res_time',
  help: 'This tells how much time it takes',
  labelNames: ["method", "route", "code"],
  buckets: [1, 5, 15, 50, 100, 500, 1000],
});

app.use(responseTime((req, res, time) => {
    reqResTime.labels({
      method: req.method,
      route: req.url,
      code: res.statusCode,
    }).observe(time);
  })
);

//adding the metrics endpoint
app.get("/metrics", async (req, res) => {
  res.setHeader('Content-Type', client.register.contentType);
  const metrics = await client.register.metrics();
  res.send(metrics);
})

app.listen(PORT, () => {
  console.log(`Express Server is running at http://localhost:${PORT}`);
});

//winston logger
const LokiTransport = require("winston-loki");
const options = {
  transports: [
    new LokiTransport({
      host: "http://127.0.0.1:3100"
    })
  ]
};
const logger = createLogger(options);
