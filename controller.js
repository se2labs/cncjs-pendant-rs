const HID = require('node-hid');
const EventEmitter=require('events')
const events=new EventEmitter();
util = require("util");
// [Function] check for controller to conect (show up in devices), then start services. Kill services on disconect.
function checkController(socket, controller) {
    // Get HID Devices
    var devices = HID.devices();
    var found=false;
    devices.forEach(function (device) {
        console.log(device.vendorId + " | " + device.productId);

        // Detect rpi HID
        if ((device.vendorId == 11914 && device.productId == 192)) {
		console.log('found pendant hardware');
		found=true;
        }
    });
	return (found)?true:false;  //no pendant found
}
function connectPendant(){
    var devices = HID.devices();
    var deviceInfo = devices.find(function (d) {
        var isTeensy = d.vendorId === 11914 && d.productId === 192;
        return isTeensy;
    });
    var controller = new HID.HID(deviceInfo.path);



    controller.on('error', function (err) {
        console.log("Error Message: " + err);
        process.exit();  // Kill Program
    });

    // ------------------------------------------

    controller.on('data', gotData);



};

function gotData(data) {
        var v = data[18] << 8 | data[17];
        if (v & 0x8000)
            v = -(0x7fff - (v & 0x7fff));
	if(v==gotData.pv)
		return;
	gotData.pv=v;
	var payload={};
	payload.value=v/1000;
	payload.axis=data[1];
	payload.multiplier=data[19];
	events.emit('newdata',payload);
};
exports.events=events;
exports.checkController=checkController;
exports.connectPendant=connectPendant;
