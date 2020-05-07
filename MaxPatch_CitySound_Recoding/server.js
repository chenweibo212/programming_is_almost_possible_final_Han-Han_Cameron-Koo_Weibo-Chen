const WebSocket = require('ws');
const osc = require("osc");

class DataListener{
    constructor(options){
        
        this.getData = options.getData;
        this.microphoneCount = options.microphoneCount || 1;
        this.microphoneIds = options.microphoneIds;
        this.aggregatedData = [];

        this.setupServer();
    }    

    setupServer = () => {
        const _this = this,
                server = new WebSocket.Server({ port: 41235 });

        server.on('connection', socket => {
            var socketPort = new osc.WebSocketPort({
                socket: socket,
                metadata: true
            });

            socketPort.on("message", oscMsg => {
                var value = JSON.parse(oscMsg.args[0].value),
                    //create empty data to format
                    data = [];               

                //check if thre is data
                if(value.data){
                    var keys = Object.keys(value.data),
                        incrementCount = _this.microphoneIds ? _this.microphoneIds.length : _this.microphoneCount; 
                       
                    for(var i = 0; i < incrementCount; i++){
                        var microphoneId = _this.microphoneIds ? _this.microphoneIds[i] : keys[i]
                     
                        if(microphoneId){
                            var dataItems = value.data[microphoneId]
                            data.push({
                                microphoneId: microphoneId,
                                data: dataItems
                            });
                        }        
                
                    }
                    //_this.aggregatedData.push(data)

                    _this.getData(data);
                }

            });
        });
    }


}


module.exports = DataListener



