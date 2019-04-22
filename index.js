// helper package for parsing command arguments
const program = require('commander');
const packageJson = require('./package.json');
// require the hyperion middleware
const hyperionMiddleware = require('@magaya/hyperion-express-middleware');
// create the hyperion middleware for express.js, pass the required arguments to connect to the database
// the second parameter is optional, if you specify it it will include specialized APIs like the one for LiveTrack Mobile (ltm)
const middleware = hyperionMiddleware.middleware(process.argv,'17642-dae');
// require the express framework and create an instance of it
const express = require('express');
const app = express();
// helper for paths
const path = require('path');
// helper package to get the body of requests
const bodyParser = require("body-parser");
// require our setup helper functions
const setup = require(path.join(__dirname, 'api/setup'));
const configuration = require(path.join(__dirname, 'api/configuration'));

program.version(packageJson.version)
    .option('-p, --port <n>', 'running port', parseInt)
    .option('-r, --root <value>', 'startup root for api')
    .option('-s, --service-name <value>', 'name for service')
    .option('-g, --gateway', 'dictates if we should be through gateway')
    .option('-i, --network-id <n>', 'magaya network id', parseInt)
    .option('--connection-string <value>', 'connection endpoint for database')
    .parse(process.argv);

if (!program.port) {
    console.log('Must submit port on which to listen...');
    process.exit(1);
} else if (!program.root) {
    console.log('Must submit root...');
    process.exit(1);
}

const hyperion = hyperionMiddleware.hyperion(process.argv,'17642-dae');

// setup the extension with required data, notice this occurs at the application startup, not thru a web request
setup.createCustomFieldDefinitions(hyperion,'dae_info', 'DAE', 'Not Assigned');
setup.createCustomFieldDefinitions(hyperion,'mrn_number', 'MRN Number', 'Not Assigned');

// apply the middleware in the application
app.use(middleware);
// apply other helper middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// serve the static content under the root path
app.use(`${program.root}/`, express.static(path.join(__dirname, 'static')));

const ship = require(path.join(__dirname, 'api/transactionManager'));
// define a route that can be consumed from a web browser
app.get(`${program.root}/test`, function(request, response) {
    const dbx = request.dbx;                // hyperion namespaces
    const algorithm = request.algorithm;    // hyperion algorithms
    const api = request.api;                // api functions (requested with the second argument at require time)
 
    if (dbx.Company)
        response.send('Success!! ' + dbx.Company.Name);
    else
        response.send('Fail to connect to the database!!');
});
app.get(`${program.root}/transactionManager/:guid`, async (request, response) => {
    const result = await ship.getShip(request.params.guid, request.dbx, request.algorithm);
    // send the response to the browser
    response.json(result);
    
});


app.get(`${program.root}/getConfig`, async (request, response) => {
    //const result = await ship.getConfiguration(path.join(__dirname, 'static/assets/auxData'));
    
    // send the response to the browser
    response.json(await configuration.getConfig());
    
})

app.post(`${program.root}/transactionManager/saveConfig`, async (request, response) =>{
    //const result = await ship.postConfig(request.body, request.dbx, request.algorithm,fs,path.join(__dirname, 'static/assets/auxData'));
    const result =await configuration.saveConfig(request.body);
    response.json({"result":result});  
});


app.get(`${program.root}/transactionManager/saveCF/`, async (request, response) => {
    const result = await ship.saveCustomFields(request.params.BLNumber, "SUCESS v2", request.dbx, request.dbw, request.algorithm);
    // send the response to the browser
    response.send('Success Saved!! ');
});

app.get(`${program.root}/transactionManager/:guid/mrn`, async (request, response) => {
    const result = await ship.calculateMrn(request.params.guid,  request.dbx, request.dbw, request.algorithm);
    // send the response to the browser
    response.send('Success Saved!! ');
});

app.post(`${program.root}/transactionManager/:guid/customfields`, async (request, response) => {
    const result = await ship.saveCustomFields(request.params.guid, request.body, request.dbx, request.dbw, request.algorithm);
    // send the response to the browser
    response.json(result);
});

app.get(`${program.root}/getConfig/:shipper/:destination`, async (request, response) => {
    console.log("DAE \r\n");
    console.log("Shipper: " + request.params.shipper +"\r\n");
    console.log("Destination: " + request.params.destination+"\r\n");
    const result = await ship.getConfiguration(request.params.shipper,request.params.destination,path.join(__dirname, 'static/json'));
    // send the response to the browser
    console.log("Finishing");
    response.json(result);
    
});



app.post(`${program.root}/saveConfig`, async (request, response) =>{
    const result = await ship.postConfig(request.body, request.dbx, request.algorithm,path.join(__dirname, 'static/json'));
    response.json(result);
});

// start your application in the port specified
app.listen(program.port, () => {
    console.log(`Server started on port ${program.port}...`);
});