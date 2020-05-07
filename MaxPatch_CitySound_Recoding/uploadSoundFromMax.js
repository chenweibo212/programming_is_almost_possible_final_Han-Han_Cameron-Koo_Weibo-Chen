const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

//const filePath = path.join(__dirname, './maxpatch/test.aif');
const dbName = 'soundfromMAX';
const FormData = require('form-data');
const maxApi = require("max-api");


maxApi.post("Hello from node!");

//data from max to a server
let maxfilename;
maxApi.addHandler('input', (message) => {
    maxApi.post(`received from max ${message}`);
    maxfilename = message;
	
    if(maxfilename != null){
      let filefromMax = path.join(__dirname, maxfilename);
      const stream = fs.createReadStream(filefromMax);


      let form = new FormData();
      form.append('name', path.basename(filefromMax));
      form.append('track', stream);

      fetch('http://localhost:3005/tracks/api/upload',{method: "post", body: form})
      .then(function(res){
        return res.json();
      })
      .then((json)=>{
            console.log(json);
            maxApi.post(json);
            maxApi.outlet(json.id);
          }).catch((err)=>{
            maxApi.post(err);
          });
    }
})



// let filefromMax = path.join(__dirname, './testFile/', maxfilename);
//           fs.createReadStream(filefromMax).
//           //add data to upload filename
//           pipe(bucket.openUploadStream(maxfilename)).
//             on('error', function(error){
//               assert.ifError(error);
//             }).
//             on('finish', function(file){
//               console.log('done!');
//               maxApi.post(`upload done with _id: ${file._id}`);
//             }) 