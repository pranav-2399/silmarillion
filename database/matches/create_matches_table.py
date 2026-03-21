import sqlite3

SRC_DIR = r"../ipl_json/"

conn = sqlite3.connect(r"../cricket.db")
cursor = conn.cursor()


# res = cursor.execute('''CREATE TABLE IF NOT EXISTS PLAYERS (PLAYER_ID CHAR(10) PRIMARY KEY NOT NULL, PLAYER_NAME VARCHAR(50) NOT NULL, NATIONALITY VARCHAR(30) NOT NULL, DOB )''')

cursor.execute('DROP TABLE IF EXISTS MATCHES')

res = cursor.execute('''CREATE TABLE MATCHES (
    Match_ID INT PRIMARY KEY,
    Match_name VARCHAR(100),
    Date DATE,

    Tournament_ID INT,
    Team1_ID INT NOT NULL,
    Team2_ID INT NOT NULL,
    Toss_win INT,
    
    Elected_to VARCHAR(10) CHECK (Elected_to IN ('bat', 'field')),
    
    Result_type VARCHAR(15) CHECK (Result_type IN ('Win', 'Tie', 'Abandoned', 'No-result')),
    Super_over BOOLEAN,

    Winner_team INT,
    Win_margin_type VARCHAR(10) CHECK (Win_margin_type IN ('wickets', 'runs', NULL)),
    Win_margin INT,

    DLS BOOLEAN,

    Abandon_reason TEXT,

    FOREIGN KEY (Tournament_ID) REFERENCES TOURNAMENTS(Tournament_ID),
    FOREIGN KEY (Team1_ID) REFERENCES TEAMS(Team_ID),
    FOREIGN KEY (Team2_ID) REFERENCES TEAMS(Team_ID),
    FOREIGN KEY (Toss_win) REFERENCES TEAMS(Team_ID),
    FOREIGN KEY (Winner_team) REFERENCES TEAMS(Team_ID),

    CHECK (Team1_ID <> Team2_ID),

    CHECK (
        Winner_team IS NULL 
        OR Winner_team = Team1_ID 
        OR Winner_team = Team2_ID
    )
);''')

print(*cursor.execute('''PRAGMA TABLE_INFO(MATCHES)''').fetchall(), sep="\n")

conn.commit()
conn.close()