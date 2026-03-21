import sqlite3

SRC_DIR = r"../ipl_json/"

conn = sqlite3.connect(r"../cricket.db")
cursor = conn.cursor()


# res = cursor.execute('''CREATE TABLE IF NOT EXISTS PLAYERS (PLAYER_ID CHAR(10) PRIMARY KEY NOT NULL, PLAYER_NAME VARCHAR(50) NOT NULL, NATIONALITY VARCHAR(30) NOT NULL, DOB )''')

cursor.execute('DROP TABLE IF EXISTS TEAMS')
res = cursor.execute('''CREATE TABLE TEAMS (
    Team_ID INT PRIMARY KEY,
    Team_name VARCHAR(100) NOT NULL,
    Founded_year INT
);''')



print(*cursor.execute('''PRAGMA TABLE_INFO(TEAMS)''').fetchall(), sep="\n")
""" 
players = get_players(SRC_DIR)

for player_id in players:

    res = cursor.execute(f'''INSERT INTO PLAYERS (Player_ID, Player_name) VALUES (?, ?) ON CONFLICT(PLAYER_ID) DO UPDATE SET Player_name= excluded.Player_name ''', (player_id, players[player_id])) """


    #print(res)

conn.commit()
conn.close()