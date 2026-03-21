import sqlite3
from pprint import pprint


conn = sqlite3.connect(r'../cricket.db')
cur = conn.cursor()

res = cur.execute('''SELECT * FROM TEAMS''').fetchall()
pprint(res)

for team in res:
  res = cur.execute('''INSERT INTO TEAM_NAME_HISTORY (Team_ID, Team_name, Start_date) VALUES (?, ?, ?);''', 
                    (team[0], team[1], team[2]))


conn.commit()
conn.close()