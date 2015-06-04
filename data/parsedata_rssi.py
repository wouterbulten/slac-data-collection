import json
from pprint import pprint
import matplotlib.pyplot as plt
from scipy import integrate
import math

#with open('sdc_1430484094445.json') as data_file:    
with open('sdc_1433422773120.json') as data_file:    
    data = json.load(data_file)

data = data["devices"]

highestUid = "FC:6A:EC:90:F8:01"
highestN = 0;

# for uid, value in data.iteritems():
# 	total = 0;

# 	rssiData = value["rssi"];

# 	for time, rssi in rssiData.iteritems():
# 		total += 1;

# 	print uid + " : " + str(total)

# 	if highestN < total:
# 		highestN = total
# 		highestUid = uid

plotData = data[highestUid]["rssi"];

Y = [rssi for time, rssi in plotData.iteritems() if rssi < 0]

fig1 = plt.figure()
plt.plot(Y, label='RSSI')
plt.legend()
plt.ylim((-100,0))
plt.show()

# dataAX = [d[1] for d in data]
# dataAY = [d[2] for d in data]
# dataAZ = [d[3] for d in data]

# def convAngle(a, base):
# 	if a <= base:
# 		print base - a
# 		return base - a
# 	else:
# 		print base + (360 - a)
# 		return base + (360 - a)


# # Convert to counter clockwise
# dataC = [data[i-1][4] - d[4] if i > 0 else 0 for i,d in enumerate(data) ]
# temp = math.pi / 180;

# # Convert to radians
# dataRadians = [d * temp for d in dataC]
# print dataRadians

# # Calculate stack angles
# stackedRadians = []
# total = 0;
# for r in dataRadians:
# 	total = total + r;
# 	stackedRadians.append(total)

# #y_int = integrate.cumtrapz(dataAX, dx = 1, initial=0)
# #y_disp = integrate.cumtrapz(y_int, dx = 1, initial=0)

# fig1 = plt.figure()
# plt.plot(dataAX, label='X')
# plt.plot(dataAY, label='Y')
# plt.plot(dataAZ, label='Z')
# #plt.plot(y_int)
# #plt.plot(y_disp)
# plt.legend()

# fig2 = plt.figure()
# plt.plot(dataC)

# fig3 = plt.figure()
# plt.plot(dataRadians)

# fig4 = plt.figure()
# plt.plot(stackedRadians)

# plt.show()