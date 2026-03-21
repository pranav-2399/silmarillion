import sqlite3, json, os
from pprint import pprint

SRC_DIR = r'../../ipl_json'
MATCHES_DIR = r'../matches.json'

with open(MATCHES_DIR) as f: match_data = json.load(f)

conn = sqlite3.connect(r'../cricket.db')
cur = conn.cursor()
res = conn.execute('''SELECT Team_name, Team_ID FROM TEAM_NAME_HISTORY;''').fetchall()

teams = {}
for team in res: teams[team[0]] = team[1]

for match in match_data:
  match_id =  match['id']
  match_date = match['date']
  if int(match_id) in range (335982, 336041):
    #print(match_id)
  
    with open(SRC_DIR + '/' + match_id + '.json', 'r') as f:
      data = json.load(f)
    
    team1_name = data['info']['teams'][0]
    team2_name = data['info']['teams'][1]

    #print(' vs '.join([team1_name, team2_name]))
    tournament_id = 'rJnR'
    team1_id = teams[team1_name]
    team2_id = teams[team2_name]
    toss_win_id = teams[data['info']['toss']['winner']]
    elected_to = data['info']['toss']['decision']

    res = cur.execute('''INSERT INTO 
                       MATCHES (Match_ID, Match_name, Date, Tournament_ID, Team1_ID, Team2_ID, Toss_win, Elected_to) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)''', 
                       (match_id, ' vs '.join([team1_name, team2_name]), match_date, tournament_id, team1_id, team2_id, toss_win_id, elected_to))
    conn.commit()

    outcome = data['info']['outcome']
    if 'result' in outcome:
      print('result')
      result_type = outcome['result']
      super_over = False
      winner_team_id = None
      if 'eliminator' in outcome:
        result_type = 'Win'
        super_over = True
        winner_team_id = outcome['eliminator']
      res = cur.execute('''UPDATE MATCHES SET 
                         Result_type = ?, Super_over = ?, Winner_team = ? 
                         WHERE Match_ID = ?;''',
                         (result_type, super_over, winner_team_id, match_id))
      conn.commit()
    elif 'winner' in outcome:
      winner_team_id = teams[outcome['winner']]
      result_type = 'Win'
      super_over = False
      dls_flag = False
      if 'method' in outcome: dls_flag = True
      win_margin_type = list(outcome['by'].keys())[0]
      win_margin = outcome['by'][win_margin_type]
      print(result_type, super_over, winner_team_id, dls_flag, win_margin_type, win_margin, match_id)
      res = cur.execute('''UPDATE MATCHES SET 
                         Result_type = ?, Super_over = ?, Winner_team = ?, DLS = ?, Win_margin_type = ?, Win_margin = ?
                         WHERE Match_ID = ?;''',
                         (result_type, super_over, winner_team_id, dls_flag, win_margin_type, win_margin, match_id))
      conn.commit()

conn.commit()
conn.close()