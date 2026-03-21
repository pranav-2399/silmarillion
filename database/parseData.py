import os
import json
from pprint import pprint

DATABASE_DIR = r"./ipl_json/"
files = os.listdir(DATABASE_DIR)
""" k = 0
for i in files:
	with open(DATABASE_DIR+i, 'r') as f:
		pprint(json.load(f))
	if k == 10:
		break """

with open(DATABASE_DIR + files[0]) as f:
    # pprint(json.load(f))
    data = json.load(f)
    
#print(data.keys())
# for i in list(data.keys()):
    # print(data[i].keys())
    
# pprint(data['innings'])
#pprint(data['innings'][0].keys())

