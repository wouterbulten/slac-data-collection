# SLAC Data Collection app

Cordova app that monitors nearby Bluetooth LE devices and reports the singal strength (RSSI) of each device. Accelerometer data can be monitored simultaneously.

Data can sent to a Firebase instance using web sockets (if supported by the device) and support user/password authentication.

Partially based on code from from https://github.com/dobots/crownstone-app

# Installation

1. Run `scripts/update_cordova.sh`

# Running

1. Change the Firebase ref in js/datastore.js to your own reference (only needed for storing)
2. Install cordova plugins (see scripts/update_cordova.sh)
3. Run `cordova run android --device` with a Android device connected to your computer with debugging mode on.

# Debugging

You can use the following to read log messages from the app:

`adb logcat CordovaLog:D *:S`

