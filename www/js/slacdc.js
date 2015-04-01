var slacdc = {

	scanning: false,
	deviceList: [],

	start: function() {

		this.initBluetooth(function(enabled) {
			$('.disabled-before-load').prop("disabled", false);
		});

		$('#btn-find-all-devices').click($.proxy(function() {
			if(this.scanning) {
				this.stopEndlessScan();
				this.scanning = false;
				$('#btn-find-all-devices').html("Find all devices");
			} else {
				this.startEndlessScan(this.updateDevicesList)
				this.scanning = true;
				$('#btn-find-all-devices').html("Stop scanning");
			}
		}, this));
	},

	updateDevicesList: function(device) {
		console.log('Found new device ' + JSON.stringify(device));

		$('#device-list > tbody:last').append(
			 '<tr><td>'
			+ device.name
			+ '</td><td>'
			+ device.rssi
			+ '</td></tr>');
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