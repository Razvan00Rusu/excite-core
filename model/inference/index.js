let express = require("express");
let bodyParser = require("body-parser");
let cors = require("cors");
let z = require("zod");
let UnixSocket = require("unix-domain-socket");
const yargs = require("yargs/yargs");
const { hideBin } = require('yargs/helpers');
const args = yargs(hideBin(process.argv)).argv;

let INFERENCE_REQUEST = require("./inference_request.js");


if (!args.socket) {
  console.log(
    "Error - Missing Param: socket flag must be specified (--socket ${socket})"
  );
  process.exit(1);
}

const PORT = 3000;
const SOCKET = args.socket;

try {
  z.string().parse(SOCKET);
} catch (e) {
  console.log(
    `FATAL: The socket path needs to be provided as the first command line arg to the progam. Expected a string but received "${SOCKET}"`
  );
  return;
}

let us = new UnixSocket(SOCKET);
us.payloadAsJSON();

let app = express(cors());
app.get("/", bodyParser.json(), (req, res) => {
  console.log(`INFO: Received request. Request Body: ${JSON.stringify(req.body)}`);
  try {
    INFERENCE_REQUEST.parse(req.body);
  } catch (e) {
    console.log(
      `ERROR: Request body does not match INFERENCE_PROJECT schema - ${e}`
    );
    res.status(400);
  }
  const dataToSend = req.body;

  us.send(dataToSend, (response) => {
    res.json(response);
  });
  // res.status(200).json({
  //   inference: [
  //     {
  //       result: [
  //         {
  //           title: "Citation recommendation: approaches and datasets",
  //           abstract: "",
  //           venue: "IJDL",
  //           year: 2020,
  //           author: "Michael Färber and Adam Jatowt",
  //           id: 1,
  //         }, {
  //           title: "Context sensitive article ranking with citation context analysis",
  //           abstract: "",
  //           venue: "Scientometrics",
  //           year: 2016,
  //           author: "Metin Doslu and Haluk O. Bingol",
  //           id: 2,
  //         }
  //       ]
  //     }
  //   ]
  // })
  res.status(200);
});

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
