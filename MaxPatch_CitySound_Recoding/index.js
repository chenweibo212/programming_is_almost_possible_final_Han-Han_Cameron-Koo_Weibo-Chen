const DataListener = require('./server.js');
let maxAPI = undefined;

try{
    maxAPI = require("max-api");
} catch (e) { 
    console.log("Could not load max-api, ignoring"); 
}

new DataListener({
    //select the amount the 
    microphoneCount: 1,
    //call the specific rsd with its identified ID
    //microphoneIds: ["1105", "1230"],

    getData: (data) => {
        
        console.log("******* DATA ********");
        console.log(data);
        if(data[0].data){
            if (maxAPI){
                maxAPI.outlet("data",data[0].data.TD_RMS.avg);
            }
            console.log(data[0].data.TD_RMS);
            console.log(data[0].data.TD_RMS.avg);
        }
    }
})
