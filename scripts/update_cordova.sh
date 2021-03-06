#!/bin/bash

cordova platform add android
cordova platform update android

echo "Current plugin versions"
cordova plugin
cordova plugin remove org.apache.cordova.device-motion
cordova plugin add org.apache.cordova.device-motion
cordova plugin remove com.randdusing.bluetoothle
cordova plugin add com.randdusing.bluetoothle
cordova plugin remove org.apache.cordova.dialogs
cordova plugin add org.apache.cordova.dialogs
cordova plugin remove org.apache.cordova.console
cordova plugin add org.apache.cordova.console
cordova plugin remove org.apache.cordova.device-orientation
cordova plugin add org.apache.cordova.device-orientation
cordova plugin remove org.apache.cordova.file
cordova plugin add org.apache.cordova.file
cordova plugin remove de.appplant.cordova.plugin.background-mode
cordova plugin add de.appplant.cordova.plugin.background-mode

echo "New plugin versions"
cordova plugin
