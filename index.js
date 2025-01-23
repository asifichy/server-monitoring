const express = require('express');
const client = require('prom-client'); //metric collection
const responseTime = require('response-time');
const { doSomeHeavyTask } = require('./util');

const app = express();
const PORT = process.env.PORT || 8000;

const collectionDefualtMetrics = client.collectDefaultMetrics;

collectionDefualtMetrics({ register: client.register });

app.get("/", (req, res) => {
  return res.json({ message: `Hello World` });
});

app.get("/slow", async (req, res) => {
  try {
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

