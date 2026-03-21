from pprint import pprint
import json

matches = []

with open(r'./matches.txt', 'r+') as f:
  l = f.readlines()

  for i in l:
    i = i.strip('\n').split(" - ")
    i[-1] = i[-1].split(' vs ')

    matches.append({
      'id': i[4],
      'date': i[0],
      'team1': i[5][0],
      'team2': i[5][1], 
    })

pprint(matches)

with open(r'./matches.json', 'w') as f:
  json.dump(matches, f, indent = 2)