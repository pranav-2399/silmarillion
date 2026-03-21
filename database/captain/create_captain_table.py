import sqlite3

SRC_DIR = r"../ipl_json/"

conn = sqlite3.connect(r"../cricket.db")
cursor = conn.cursor()

cursor.execute('DROP TABLE IF EXISTS TEAM_CAPTAIN_INFORMATION')

res = cursor.execute('''CREATE TABLE TEAM_CAPTAIN_INFORMATION (
  Team_ID TEXT NOT NULL,
  Start_Captaincy DATE NOT NULL,
  End_Captaincy DATE,
  Captain_ID TEXT NOT NULL,

  PRIMARY KEY (Team_ID, Start_Captaincy),

  FOREIGN KEY (Team_ID) REFERENCES TEAMS(Team_ID) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (Captain_ID) REFERENCES PLAYERS(Player_ID) ON UPDATE CASCADE ON DELETE CASCADE,
  CHECK (End_Captaincy IS NULL OR End_Captaincy > Start_Captaincy)
);''')

print(*cursor.execute('''PRAGMA TABLE_INFO(MATCHES)''').fetchall(), sep="\n")

conn.commit()
conn.close()

