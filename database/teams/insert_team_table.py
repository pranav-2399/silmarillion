import json, sqlite3, base64, os
from pprint import pprint

MATCHES_DIR = r'../matches.json'

def generate_id():
    return base64.urlsafe_b64encode(os.urandom(10)).decode().replace('_', '').replace('-', '').replace('=', '').replace(' ', '')[:7]


def get_teams(MATCHES_DIR):
  teams = {}
  with open(MATCHES_DIR, 'r') as f:
    data = json.load(f)
    for match in data:
      team1 = match['team1']
      team2 = match['team2']
      team_yr = match['date'].split('-')[0]

      if team1 not in teams: teams[team1] = team_yr
      else:
        if teams[team1] > team_yr: teams[team1] = team_yr

      if team2 not in teams: teams[team2] = team_yr
      else:
        if teams[team2] > team_yr: teams[team2] = team_yr
  return teams

teams = get_teams(MATCHES_DIR)


conn = sqlite3.connect(r'../cricket.db')
cur = conn.cursor()

for team in teams:
  team_id = generate_id()

  res = cur.execute('''INSERT INTO TEAMS VALUES (?, ?, ?)''', 
                    (team_id, 
                     team, 
                     teams[team])
  )
  #print(teams[team])
  conn.commit()

conn.close()