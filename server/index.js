// INITIAL VARIABLES \\
const matrix = require("@matrix-io/matrix-lite");
const io = require("socket.io")(6001); // Start socket.io server
console.log("\nServer Started!\n");

// Unity client
class Client{
    // Data intervals requested by Unity client
    constructor(){
        this.sensors = {
            "humidity"  : false,
            "imu"       : false,
            "pressure"  : false, 
            "uv"        : false,
        }
    }

    // - Begin sending sensor data
    sendSensor(sensor, delay, callback) {
        if (this.sensors[sensor]) {
            callback();
            setTimeout(()=>{this.sendSensor(sensor, delay, callback);}, delay);
        }
    }
}

// On client connection
io.on("connection", function(socket) {
    console.log("Client Connected\n");

    var client = new Client();

    // * On Set LED
    socket.on("set LED", (color)=>{
        matrix.led.set(color);
    });

    // Create sensor Start & Stop event listeners
    for (let sensor in client.sensors) {
    // * On Sensor Start
    socket.on(sensor + " start", ()=>{
        client.sensors[sensor] = true;
        console.log("Sending " + sensor + " data...\n");

        client.sendSensor(sensor, 50, ()=>{
            socket.volatile.emit(sensor + " data", matrix[sensor].read());
        });
    });

    // * On Sensor Stop
    socket.on(sensor + " stop", ()=>{
        client.sensors[sensor] = false;
        console.log("Stopping " + sensor + " data...\n");
    });
  }

    // Emit ready status to unity
    socket.emit("Initialized");
});
