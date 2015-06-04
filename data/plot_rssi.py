import json
from pprint import pprint
import matplotlib.pyplot as plt
from scipy import integrate
import math

with open('sdc_1430484094445.json') as data_file:
	data1 = json.load(data_file)
with open('sdc_1430486849244.json') as data_file:    
    data2 = json.load(data_file)
with open('sdc_1430495816089.json') as data_file:    
    data3 = json.load(data_file)

data1 = data1["devices"]
data2 = data2["devices"]
data3 = data3["devices"]

uid1 = "5E:D8:23:4A:DC:41"
uid21 = "7C:7F:37:FE:36:96"
uid22 = "66:42:38:E3:CB:FC"
uid31 = "6E:D6:C8:CA:2D:CD"
uid32 = "7B:50:C2:A5:D2:19"

Y1 = [rssi for time, rssi in  data1[uid1]["rssi"].iteritems()]
Y2 = [rssi for time, rssi in  data2[uid21]["rssi"].iteritems()]
Y3 = [rssi for time, rssi in  data2[uid22]["rssi"].iteritems()]
Y4 = [rssi for time, rssi in  data3[uid31]["rssi"].iteritems()]
Y5 = [rssi for time, rssi in  data3[uid32]["rssi"].iteritems()]

length = min(len(Y1), len(Y2), len(Y3), len(Y4), len(Y5))

Y1 = Y1[0:length]
Y2 = Y2[0:length]
Y3 = Y3[0:length]
Y4 = Y4[0:length]
Y5 = Y5[0:length]

fig1 = plt.figure()
plt.plot(Y1, 's', fillstyle='none', label='RSSI, 30cm')
plt.plot(Y3, 'x', label='RSSI, 60cm')
plt.plot(Y4, '+', label='RSSI, 100cm')
plt.plot(Y5, '*', label='RSSI, 300cm')
plt.plot(Y2, 'o', fillstyle='none', label='RSSI, room')
plt.legend()
plt.ylim((-100,-40))
plt.xlim((0, length))
plt.xlabel('Time')
plt.ylabel('RSSI')
plt.show()
