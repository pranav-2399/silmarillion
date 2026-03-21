import sqlite3

SRC_DIR = r"../ipl_json/"

conn = sqlite3.connect(r"../cricket.db")
cursor = conn.cursor()


# res = cursor.execute('''CREATE TABLE IF NOT EXISTS PLAYERS (PLAYER_ID CHAR(10) PRIMARY KEY NOT NULL, PLAYER_NAME VARCHAR(50) NOT NULL, NATIONALITY VARCHAR(30) NOT NULL, DOB )''')

cursor.execute('DROP TABLE IF EXISTS DELIVERY')

res = cursor.execute('''CREATE TABLE DELIVERY (
  Match_ID INT,
  Innings_no INT,
  Over_no INT,
  Delivery_no INT,

  Ball_no INT,

  Bowler INT,
  Striker INT,
  Non_striker INT,

  PRIMARY KEY (Match_ID, Innings_no, Over_no, Delivery_no),

  FOREIGN KEY (Match_ID) REFERENCES MATCHES(Match_ID),
  FOREIGN KEY (Bowler) REFERENCES PLAYERS(Player_ID),
  FOREIGN KEY (Striker) REFERENCES PLAYERS(Player_ID),
  FOREIGN KEY (Non_striker) REFERENCES PLAYERS(Player_ID),

  CHECK (Striker != Bowler),
  CHECK (Non_striker != Bowler),
  CHECK (Striker != Non_striker)
);''')
conn.commit()

cursor.execute('DROP TABLE IF EXISTS DELIVERY_OUTCOME_RUNS')
res = cursor.execute('''CREATE TABLE DELIVERY_OUTCOME_RUNS (
  Match_ID INT,
  Innings_no INT,
  Over_no INT,
  Delivery_no INT,

  Ball_no INT,
  Runs_scored INT NOT NULL,
  Boundary BOOLEAN,

  PRIMARY KEY (Match_ID, Innings_no, Over_no, Delivery_no),

  FOREIGN KEY (Match_ID, Innings_no, Over_no, Delivery_no)
    REFERENCES DELIVERY(Match_ID, Innings_no, Over_no, Delivery_no)
);''')
conn.commit()

cursor.execute('DROP TABLE IF EXISTS DELIVERY_OUTCOME_WICKETS')
res = cursor.execute('''CREATE TABLE DELIVERY_OUTCOME_WICKETS (
  Match_ID INT,
  Innings_no INT,
  Over_no INT,
  Delivery_no INT,

  Ball_no INT,
  Wicket_type VARCHAR(20),
  Runs_scored INT, 
  Out_batter INT,
  Fielder INT,

  PRIMARY KEY (Match_ID, Innings_no, Over_no, Delivery_no),

  FOREIGN KEY (Match_ID, Innings_no, Over_no, Delivery_no)
    REFERENCES DELIVERY(Match_ID, Innings_no, Over_no, Delivery_no),

  FOREIGN KEY (Out_batter) REFERENCES PLAYERS(Player_ID),
  FOREIGN KEY (Fielder) REFERENCES PLAYERS(Player_ID),

  CHECK (Wicket_type IN (
    'bowled', 'caught', 'lbw', 'run out',
    'stumped', 'hit wicket', 'caught and bowled',
    'obstructing the field', 'retired out', 'timed out', 'retired hurt'
  ))
);''')
conn.commit()

cursor.execute('DROP TABLE IF EXISTS DELIVERY_OUTCOME_EXTRAS')
res = cursor.execute('''CREATE TABLE DELIVERY_OUTCOME_EXTRAS (
  Match_ID INT,
  Innings_no INT,
  Over_no INT,
  Delivery_no INT,

  Ball_no INT,
  Extras_type VARCHAR(20),
  Runs_scored INT,

  PRIMARY KEY (Match_ID, Innings_no, Over_no, Delivery_no),

  FOREIGN KEY (Match_ID, Innings_no, Over_no, Delivery_no)
    REFERENCES DELIVERY(Match_ID, Innings_no, Over_no, Delivery_no),

  CHECK (Extras_type IN (
    'wides', 'noballs', 'byes', 'legbyes', 'penalty'
  ))
);''')

print(*cursor.execute('''PRAGMA TABLE_INFO(DELIVERY)''').fetchall(), sep="\n")
print(*cursor.execute('''PRAGMA TABLE_INFO(DELIVERY_OUTCOME_RUNS)''').fetchall(), sep="\n")
print(*cursor.execute('''PRAGMA TABLE_INFO(DELIVERY_OUTCOME_WICKETS)''').fetchall(), sep="\n")
print(*cursor.execute('''PRAGMA TABLE_INFO(DELIVERY_OUTCOME_EXTRAS)''').fetchall(), sep="\n")

conn.commit()
conn.close()