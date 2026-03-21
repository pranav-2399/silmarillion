import sqlite3

SRC_DIR = r"../ipl_json/"

conn = sqlite3.connect(r"../cricket.db")
cursor = conn.cursor()


cursor.execute('DROP TABLE IF EXISTS TOURNAMENTS')
res = cursor.execute('''CREATE TABLE TOURNAMENTS (
    Tournament_ID INT PRIMARY KEY,
    Tournament_Name VARCHAR(100) NOT NULL,
    Shared BOOLEAN NOT NULL,

    Winner_team_id INT,
    Runner_team_id INT,

    POTF INT,
    POTT INT,

    FOREIGN KEY (Winner_team_id) REFERENCES TEAMS(Team_ID),
    FOREIGN KEY (Runner_team_id) REFERENCES TEAMS(Team_ID),

    FOREIGN KEY (POTF) REFERENCES PLAYERS(Player_ID),
    FOREIGN KEY (POTT) REFERENCES PLAYERS(Player_ID),

    CHECK (Winner_team_id IS NULL OR Runner_team_id IS NULL OR Winner_team_id != Runner_team_id)
);''')


print(*cursor.execute('''PRAGMA TABLE_INFO(TOURNAMENTS)''').fetchall(), sep="\n")


conn.commit()
conn.close()