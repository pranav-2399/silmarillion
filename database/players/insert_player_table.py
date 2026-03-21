import sqlite3, os, json

SRC_DIR = r"../../ipl_json/"

def get_players(SRC_DIR, count = 100):
    l = os.listdir(SRC_DIR)

    players = {}
    seasons = []

    for i in l:
        if int(i.split('.')[0]) in range(335982, 336041):
        #if count > 0:
            with open(SRC_DIR + i, 'r') as f:
                data = json.load(f)
                #print(data)
                season = data["info"]["season"]
                if str(season) not in seasons: seasons += [str(season)]
                keys = data["info"]["players"].keys()
                for j in keys:
                    for k in data["info"]["players"][j]:
                        player_id = data["info"]["registry"]["people"][k]
                        if player_id not in players:
                            players[player_id] = k
                            count -= 1
                    #if count <= 0:
                        #break
        #else:
            #break
    
    print(count)
    print(sorted(seasons))
    print(len(seasons))
    #pprint(players)
    return players

conn = sqlite3.connect(r"../cricket.db")
cursor = conn.cursor()

cursor.execute('DELETE FROM PLAYERS')

players = get_players(SRC_DIR)

for player_id in players:
  print(player_id, players[player_id])
  res = cursor.execute(f'''INSERT INTO PLAYERS (Player_ID, Player_name) VALUES (?, ?)''', (player_id, players[player_id]))
  conn.commit()


conn.commit()
conn.close()