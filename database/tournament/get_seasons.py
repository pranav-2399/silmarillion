import os, json
from pprint import pprint

def get_seasons(SRC_DIR, count = 100):
    l = os.listdir(SRC_DIR)

    seasons = []

    for i in l:
        if int(i.split('.')[0]) in range(335982, 336041):
            with open(SRC_DIR + '/' +  i, 'r') as f:
                print(i)
                data = json.load(f)
                season = data["info"]["season"]
                if str(season) not in seasons:
                     seasons += [str(season)]

    
    print(sorted(seasons))
    print(len(seasons))
    #pprint(players)
    return sorted(seasons)