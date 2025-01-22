const express = require('express');
const { doSomeHeavyTask } = require('./util');

const app = express();
const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  return res.json({ message: `Hello World` });
});

app.get("/slow", async (req, res) => {
  try{
    const timeTaken = await doSomeHeavyTask();
    return res.json({ 
        status: "Success",
        message: `Heavy task completed in ${timeTaken}ms` });
  }
  catch(err){    
    return res.status(500).json({
      status: "Failed",
      error: "Internal Server Error",
    })
  }
});

app.listen(PORT, () => {
  console.log(`Express Server is running at http://localhost:${PORT}`);
});

