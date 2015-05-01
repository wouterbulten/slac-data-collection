var slacdc = {

	scanning: false,
	restartTimer: undefined,

	motionScannerId: undefined,
	motionOptions: { frequency: 25 },

	recordingStarted: false,

	deviceList: {},

	trace: {
		devices: {

		},

		motion: []
	},

	motionSampleSize: 1,
	motionSample: [],
	motionViewUpdate: 10,
	motionViewIteration: 0,

	start: function() {

		this.initBluetooth(function(enabled) {
			$('.disabled-before-load').prop("disabled", false);
		});

		$('#btn-start-trace').click($.proxy(function() {
			this.recordingStarted = true;

			//Make sure everything works in the background
			cordova.plugins.backgroundMode.setDefaults({ title: 'SLACdc running', text:'Background monitoring'});
			cordova.plugins.backgroundMode.enable();

			$('#btn-start-trace').attr('disabled', true);
			$('#btn-end-trace').attr('disabled', false);

		}, this));

		$('#btn-end-trace').click($.proxy(function() {
			this.recordingStarted = false;
			cordova.plugins.backgroundMode.disable();
			console.log(JSON.stringify(this.trace));

			$('#btn-start-trace').attr('disabled', false);
			$('#btn-end-trace').attr('disabled', true);
		}, this));

		$('#btn-reset-trace').click(function() {
			
			navigator.notification.confirm("Do you really want to reset the trace? (Deletes local data)", function(b) {

				if(b == 1){ //= first button, delete
					slacdc.trace = {
						devices: {},
						motion: []
					};
				}
			}, "Delete trace", ["Delete", "Cancel"]);
		});

		$('#btn-login').click($.proxy(function() {
			this.login();
		}, this));

		$('#btn-upload-trace').click($.proxy(function() {
			
			console.log('Uploading trace..');
			datastore.addTrace(this.trace);

		}, this));

		$('#btn-save-trace').click($.proxy(function() {
			
			console.log('Saving trace..');
			var data = JSON.stringify(this.trace);

			console.log('Trying to save to ' + cordova.file.externalDataDirectory)
			window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir) {
				console.log("Got main dir " + dir.fullPath);
				dir.getFile("sdc_" + (new Date).getTime() + ".json", {create:true}, function(file) {
					console.log("Got file object " + file);
					
					file.createWriter(function(fileWriter) {
						
						fileWriter.seek(fileWriter.length);
						fileWriter.write(data);
						console.log("Saved to " + fileWriter.fileName);

						navigator.notification.alert(
							'Data saved!',
							null,
							'Status',
							'Ok'
						);

					}, function(error) {
						navigator.notification.alert(
						'Could not save data with error code: ' + error.code,
						null,
						'Status',
						'Sorry!')
					});
				});
			}, function(error) {
				navigator.notification.alert(
				'Could not save data with error code: ' + error.code,
				null,
				'Status',
				'Sorry!')
			});


		}, this));

		$('#btn-find-all-devices').click($.proxy(function() {
			if(this.scanning) {
				this.stopEndlessScan();
				this.scanning = false;
				clearInterval(this.restartTimer)
				$('#btn-find-all-devices').html("<i class='fa fa-circle-o-notch'></i> Start scanning");
			} else {
				this.startEndlessScan(this.updateDevicesList)

				 // [9.12.14] Some devices (such as the Nexus 4) only report
	            //   the first advertisement for each device. all
	            //   subsequently received advertisements are dropped. In order
	            //   to receive rssi updates for such devices too, we now
	            //   restart the ble scan every second, thus getting at least
	            //     an rssi update every second
	            // if (device.model == "Nexus 4") {
	                this.restartTimer = setInterval(function() {
	                    
	                    if(slacdc.scanning)
	                    {
	                    	console.log("restart scan");
	                   	 	slacdc.stopEndlessScan();
	                    	slacdc.startEndlessScan(slacdc.updateDevicesList);
	                    }
	                }, 1000);
	            // }
	            
				this.scanning = true;
				$('#btn-find-all-devices').html("<i class='fa fa-circle-o-notch fa-spin'></i> Stop scanning&nbsp;");
			}
		}, this));

		$('#btn-start-motion-scan').click($.proxy(function() {

			if(this.motionScannerId == undefined) {

				$('#btn-start-motion-scan').html("<i class='fa fa-circle-o-notch fa-spin'></i> Stop scanning&nbsp;");

				this.motionScannerId = navigator.accelerometer.watchAcceleration(this.getCompassDataAndForward, function() {
					navigator.notification.alert(
						'Could not read acceleration data.',
						null,
						'Status',
						'Sorry!');
				}, this.motionOptions);
			}
			else {
				$('#btn-start-motion-scan').html("<i class='fa fa-circle-o-notch'></i> Start scanning");

				navigator.accelerometer.clearWatch(this.motionScannerId);
				this.motionScannerId = undefined;
			}

		}, this));
	},

	login: function() {
		$('#btn-login').attr('disabled', true);
		datastore.init($('#user-email').val(), $('#user-password').val());
	},

	getCompassDataAndForward: function(data) {

		navigator.compass.getCurrentHeading(function(heading) {
			slacdc.updateMotionList(data, heading);
		}, function() {
			navigator.notification.alert(
				'Could not read compass data.',
				null,
				'Status',
				'Sorry!');
		});
	},

	updateMotionList: function(data, heading) {
		
		heading = heading.magneticHeading;

		if(++slacdc.motionViewIteration > slacdc.motionViewUpdate) {
			$('#motion-x').html(data.x);
			$('#motion-y').html(data.y);
			$('#motion-z').html(data.z);
			$('#motion-c').html(heading);

			slacdc.motionViewIteration = 0;
		}

		//If the recording has started, we save data to our trace variable
		if(slacdc.recordingStarted) {

			slacdc.motionSample.push([data.x, data.y, data.z, heading]);

			if(slacdc.motionSample.length >= slacdc.motionSampleSize)
			{
				var xSum = ySum = zSum = 0;
				var length = slacdc.motionSample.length;

				for(var i = 0; i < length; i++)
				{
					xSum += slacdc.motionSample[i][0];
					ySum += slacdc.motionSample[i][1];
					zSum += slacdc.motionSample[i][2];
				}

				slacdc.trace.motion.push([(new Date).getTime(), xSum/length, ySum/length, zSum/length, heading]);
				slacdc.motionSample = []

				if((slacdc.trace.motion.length % 100) === 0) {
					cordova.plugins.backgroundMode.configure({
						ticker: 'Motion trace length: ' + slacdc.trace.motion.length,
						text: 'Motion trace length: ' + slacdc.trace.motion.length
					});
				}
			}
		}
	},

	updateDevicesList: function(device) {
		
		var now = (new Date).getTime();

		if(slacdc.deviceList.hasOwnProperty(device.address)) {
			slacdc.deviceList[device.address].rssi = device.rssi;
			slacdc.deviceList[device.address].lastSeen = now;

			console.log('Updated device' + JSON.stringify(device));
		}
		else {
			slacdc.deviceList[device.address] = {
				rssi: device.rssi,
				address: device.address,
				name: device.name,
				lastSeen: (new Date).getTime()
			};

			console.log('Found new device ' + JSON.stringify(device));
		}

		//If the recording has started, we save data to our trace variable
		if(slacdc.recordingStarted) {
			if(slacdc.trace.devices[device.address] == undefined) {

				if(device.name == undefined) {
					device.name = 'undefined';
				}

				slacdc.trace.devices[device.address] = {name: device.name, rssi: {}};
			}

			slacdc.trace.devices[device.address].rssi[now] = device.rssi;
		}


		$('#device-list > tbody').html('');

		for(var d in slacdc.deviceList) {

			$('#device-list > tbody:last').append(
			 '<tr><td>'
			+ slacdc.deviceList[d].name
			+ '</td><td>'
			+ slacdc.deviceList[d].rssi
			+ '</td><td>'
			+ (new Date(slacdc.deviceList[d].lastSeen)).toUTCString()
			+ '</td><td>'
			+ slacdc.deviceList[d].address
			+ '</td></tr>');
		}
	},

	initBluetooth: function(callback) {
		bluetoothle.initialize(function(obj) {
			console.log('Properly connected to BLE chip');
			console.log("Message " + JSON.stringify(obj));
			if (obj.status == 'enabled' || obj.status == 'initialized') {
				callback(true);
			}
		}, 
		function(obj) {
			console.log('Connection to BLE chip failed');
			console.log('Message', obj.status);
			navigator.notification.alert(
					'Bluetooth is not turned on, or could not be turned on. Make sure your phone has a Bluetooth 4.+ (BLE) chip.',
					null,
					'BLE off?',
					'Sorry!');
			callback(false);
		}, 
		{"request": true});
	},

	startEndlessScan: function(callback) {
		//console.log('start endless scan');
		var paramsObj = {}
		bluetoothle.startScan(function(obj) {  // start scan success
			console.log(JSON.stringify(obj))
			if (obj.status == 'scanResult') {
				callback(obj)
			} else if (obj.status == 'scanStarted') {
				//console.log('Endless scan was started successfully');
			} else {
				console.log('Unexpected start scan status: ' + obj.status);
				console.log('Stopping scan');
				stopEndlessScan();
			}
		}, 
		function(obj) { // start scan error
			console.log('Scan error', obj.status);
			navigator.notification.alert(
					'Could not find a device using Bluetooth scanning.',
					null,
					'Status',
					'Sorry!');
		}, 
		paramsObj);
	},

	stopEndlessScan: function() {
		//console.log("stop endless scan...");
		bluetoothle.stopScan(function(obj) { // stop scan success
				if (obj.status == 'scanStopped') {
					//console.log('Scan was stopped successfully');
				} else {
					console.log('Unexpected stop scan status: ' + obj.status);
				}
			}, 
			function(obj) { // stop scan error
				console.log('Stop scan error: ' + obj.error + ' - ' + obj.message);
			});
	}
	
};