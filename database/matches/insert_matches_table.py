import sqlite3, json, os
from pprint import pprint

SRC_DIR = r'../../ipl_json'
MATCHES_DIR = r'../matches.json'

with open(MATCHES_DIR) as f: match_data = json.load(f)

conn = sqlite3.connect(r'../cricket.db')
cur = conn.cursor()
res = cur.execute('''SELECT Team_name, Team_ID FROM TEAM_NAME_HISTORY;''').fetchall()
players = dict(cur.execute('''SELECT Player_name, Player_ID FROM PLAYERS''').fetchall())

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
    venue = data['info']['venue']

    #print(' vs '.join([team1_name, team2_name]))
    tournament_id = 'rJnR'
    team1_id = teams[team1_name]
    team2_id = teams[team2_name]

    team1_players_id = []
    team2_players_id = []

    for team1_player in data['info']['players'][team1_name]: team1_players_id += [players[team1_player]]
    for team2_player in data['info']['players'][team2_name]: team2_players_id += [players[team2_player]]


    toss_win_id = teams[data['info']['toss']['winner']]
    elected_to = data['info']['toss']['decision']

    res = cur.execute('''INSERT INTO 
                       MATCHES (Match_ID, Match_name, Date, Venue, Tournament_ID, Team1_ID, Team2_ID, Toss_win, Elected_to, 
                       Team1_Player1, Team1_Player2, Team1_Player3, Team1_Player4, Team1_Player5, Team1_Player6, Team1_Player7, Team1_Player8, Team1_Player9, Team1_Player10, Team1_Player11, 
                       Team2_Player1, Team2_Player2, Team2_Player3, Team2_Player4, Team2_Player5, Team2_Player6, Team2_Player7, Team2_Player8, Team2_Player9, Team2_Player10, Team2_Player11) 

                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', 
                       (match_id, ' vs '.join([team1_name, team2_name]), match_date, venue, tournament_id, team1_id, team2_id, toss_win_id, elected_to, team1_players_id[0], team1_players_id[1], team1_players_id[2], team1_players_id[3], team1_players_id[4], team1_players_id[5], team1_players_id[6], team1_players_id[7], team1_players_id[8], team1_players_id[9], team1_players_id[10], team2_players_id[0], team2_players_id[1], team2_players_id[2], team2_players_id[3], team2_players_id[4], team2_players_id[5], team2_players_id[6], team2_players_id[7], team2_players_id[8], team2_players_id[9], team2_players_id[10]))
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