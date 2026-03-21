import sqlite3

SRC_DIR = r"../ipl_json/"

conn = sqlite3.connect(r"../cricket.db")
cursor = conn.cursor()


# res = cursor.execute('''CREATE TABLE IF NOT EXISTS PLAYERS (PLAYER_ID CHAR(10) PRIMARY KEY NOT NULL, PLAYER_NAME VARCHAR(50) NOT NULL, NATIONALITY VARCHAR(30) NOT NULL, DOB )''')

cursor.execute('DROP TABLE IF EXISTS PLAYERS')
res = cursor.execute('''CREATE TABLE PLAYERS (
    Player_ID TEXT PRIMARY KEY,
    Player_name VARCHAR(100) NOT NULL,
    Nationality VARCHAR(50),
    DOB DATE,

    Player_type VARCHAR(20),

    Matches_played INT DEFAULT 0,
    Innings_batted INT DEFAULT 0,
    Runs_scored INT DEFAULT 0,
    Balls_faced INT DEFAULT 0,
    Batting_strike_rate DECIMAL(6,2),
    Batting_average DECIMAL(6,2),
    Not_outs INT DEFAULT 0,
    Fours INT DEFAULT 0,
    Sixes INT DEFAULT 0,
    Hundreds INT DEFAULT 0,
    Fifties INT DEFAULT 0,

    Innings_bowled INT DEFAULT 0,
    Wickets_taken INT DEFAULT 0,
    Balls_bowled INT DEFAULT 0,
    Runs_given INT DEFAULT 0,
    Economy DECIMAL(6,2),
    Bowling_average DECIMAL(6,2),
    Bowling_strike_rate DECIMAL(6,2),
    Four_wicket_hauls INT DEFAULT 0,
    Five_wicket_hauls INT DEFAULT 0,

    UNIQUE (Player_name, Nationality, DOB)
);''')



print(*cursor.execute('''PRAGMA TABLE_INFO(PLAYERS)''').fetchall(), sep="\n")
""" 
players = get_players(SRC_DIR)

for player_id in players:

    res = cursor.execute(f'''INSERT INTO PLAYERS (Player_ID, Player_name) VALUES (?, ?) ON CONFLICT(PLAYER_ID) DO UPDATE SET Player_name= excluded.Player_name ''', (player_id, players[player_id])) """


    #print(res)

conn.commit()
conn.close()