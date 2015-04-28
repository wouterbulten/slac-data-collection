import json
from pprint import pprint
import matplotlib.pyplot as plt

with open('sdc_1430214114546.json') as data_file:    
    data = json.load(data_file)

data = data["motion"]

dataAX = [d[1] for d in data]
dataAY = [d[2] for d in data]
dataAZ = [d[3] - 9.81  for d in data]
dataC = [d[4] for d in data]

fig1 = plt.figure()
plt.plot(dataAX, label='X')
plt.plot(dataAY, label='Y')
plt.plot(dataAZ, label='Z')
plt.legend()

fig2 = plt.figure()
plt.plot(dataC)

plt.show()