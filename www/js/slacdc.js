var slacdc = {

	scanning: false,
	
	motionScannerId: undefined,
	motionOptions: { frequency: 500 },

	recordingStarted: false,

	deviceList: {},

	trace: {
		devices: {

		},

		motion: []
	},

	start: function(email, password) {

		this.initBluetooth(function(enabled) {
			$('.disabled-before-load').prop("disabled", false);
		});

		$('#btn-start-trace').click($.proxy(function() {
			this.recordingStarted = true;

			$('#btn-start-trace').attr('disabled', true);
			$('#btn-end-trace').attr('disabled', false);

		}, this));

		$('#btn-end-trace').click($.proxy(function() {
			this.recordingStarted = false;
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
			
			datastore.addTrace(this.trace);

		}, this));

		$('#btn-find-all-devices').click($.proxy(function() {
			if(this.scanning) {
				this.stopEndlessScan();
				this.scanning = false;
				$('#btn-find-all-devices').html("<i class='fa fa-circle-o-notch'></i> Start scanning");
			} else {
				this.startEndlessScan(this.updateDevicesList)
				this.scanning = true;
				$('#btn-find-all-devices').html("<i class='fa fa-circle-o-notch fa-spin'></i> Stop scanning&nbsp;");
			}
		}, this));

		$('#btn-start-motion-scan').click($.proxy(function() {

			if(this.motionScannerId == undefined) {

				$('#btn-start-motion-scan').html("<i class='fa fa-circle-o-notch fa-spin'></i> Stop scanning&nbsp;");

				this.motionScannerId = navigator.accelerometer.watchAcceleration(this.updateMotionList, function() {
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

	updateMotionList: function(data) {

		$('#motion-x').html(data.x);
		$('#motion-y').html(data.y);
		$('#motion-z').html(data.z);

		//If the recording has started, we save data to our trace variable
		if(slacdc.recordingStarted) {

			slacdc.trace.motion.push([(new Date).getTime(), data.x, data.y, data.z]);
		}
	},

	updateDevicesList: function(device) {
		
		var now = (new Date).getTime();

		if(slacdc.deviceList.hasOwnProperty(device.address)) {
			slacdc.deviceList[device.address].rssi = device.rssi;
			slacdc.deviceList[device.address].lastSeen = now;

			console.log('Device update ' + JSON.stringify(device));	
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