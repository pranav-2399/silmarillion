import os, json, sqlite3
from pprint import pprint
FILE_DIR = r'../../ipl_json/335983.json'
DB_NAME = r'../cricket.db'
SRC_DIR = r"../../ipl_json/"


match_players = []

l = os.listdir(SRC_DIR)
for i in l:
  if int(i.split('.')[0]) in range(335982, 336041):

    with open(SRC_DIR + i, 'r') as f:
      data = json.load(f)
      registry = data['info']['registry']['people']
      #pprint(players)

      raw_players = list(data['info']['players'].values())
      players = raw_players[0] + raw_players[1]

      players_values = {}
      for i in registry:
        if i in players: 
          players_values[i] = {
            'id': registry[i], 
            'batting': {
              'runs': 0, 
              'balls': 0, 
              'batted': False, 
              'NO': True, 
              '4s': 0, '6s': 0
            }, 
            'bowling': {
              'balls': 0,
              'runs': 0,
              'wickets': 0,
              'bowled': False,
            }
          }

      innings = data['innings']
      for inning in innings:
        overs = inning['overs']
        for over in overs:
          deliveries = over['deliveries']

          for delivery in deliveries:

            batter = delivery['batter']
            non_striker = delivery['non_striker']
            bowler = delivery['bowler']
            if not players_values[batter]['batting']['batted']: players_values[batter]['batting']['batted'] = True
            if not players_values[non_striker]['batting']['batted']: players_values[non_striker]['batting']['batted'] = True
            if not players_values[bowler]['bowling']['bowled']: players_values[bowler]['bowling']['bowled'] = True

            
            if 'extras' in delivery:
              
              if (('byes' in delivery['extras']) or ('legbyes' in delivery['extras'])):
                players_values[batter]['batting']['balls'] += 1
                players_values[bowler]['bowling']['balls'] += 1
                continue

              elif 'noballs' in delivery['extras']:
                players_values[bowler]['bowling']['runs'] += delivery['extras']['noballs']
                players_values[bowler]['bowling']['runs'] += delivery['runs']['batter']
                players_values[batter]['batting']['balls'] += 1
                players_values[batter]['batting']['runs'] += delivery['runs']['batter']
                if delivery['runs']['batter'] == 4: players_values[batter]['batting']['4s'] += 1
                if delivery['runs']['batter'] == 6: players_values[batter]['batting']['6s'] += 1

              elif 'wides' in delivery['extras']:
                players_values[bowler]['bowling']['runs'] += delivery['extras']['wides']
                continue

            elif 'runs' in delivery:
              players_values[batter]['batting']['runs'] += delivery['runs']['batter']
              players_values[batter]['batting']['balls'] += 1
              players_values[bowler]['bowling']['balls'] += 1
              players_values[bowler]['bowling']['runs'] += delivery['runs']['batter']

              if delivery['runs']['batter'] == 4: players_values[batter]['batting']['4s'] += 1
              if delivery['runs']['batter'] == 6: players_values[batter]['batting']['6s'] += 1

            if 'wickets' in delivery:
              out_batsman = delivery['wickets'][0]['player_out']
              players_values[out_batsman]['batting']['NO'] = False
              if delivery['wickets'][0]['kind'] in ['caught', 'bowled', 'caught and bowled', 'lbw', 'hit wicket']:
                players_values[bowler]['bowling']['wickets'] += 1
      
      for player in players_values:
        if players_values[player]['bowling']['bowled'] == True:
          print(player, players_values[player])


    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    res = cursor.execute('''SELECT Player_name FROM PLAYERS''').fetchall()

    for player in players_values:
      res = cursor.execute('''UPDATE PLAYERS 
                          SET Matches_played = Matches_played + 1,

                          Innings_batted = Innings_batted + (?),
                          Runs_scored = Runs_scored + (?),
                          Balls_faced = Balls_faced + (?),
                          Not_outs = Not_outs + (?),
                          Fours = Fours + (?),
                          Sixes = Sixes + (?),
                          Hundreds = Hundreds + (?),
                          Fifties = Fifties + (?), 

                          Innings_bowled = Innings_bowled + (?),
                          Wickets_taken = Wickets_taken + (?),
                          Balls_bowled = Balls_bowled + (?),
                          Runs_given = Runs_given + (?),
                          Four_wicket_hauls = Four_wicket_hauls + (?),
                          Five_wicket_hauls = Five_wicket_hauls + (?)

                          WHERE Player_ID = (?)
                          ''', 
                          (
                            int(players_values[player]['batting']['batted']), 

                            players_values[player]['batting']['runs'],
                            players_values[player]['batting']['balls'],
                            (int(players_values[player]['batting']['NO']) if players_values[player]['batting']['batted'] else 0),
                            players_values[player]['batting']['4s'],
                            players_values[player]['batting']['6s'],
                            (1 if players_values[player]['batting']['runs'] >= 100 else 0),
                            (1 if (players_values[player]['batting']['runs'] < 100 and players_values[player]['batting']['runs'] >= 50 ) else 0),

                            int(players_values[player]['bowling']['bowled']),
                            players_values[player]['bowling']['wickets'],
                            players_values[player]['bowling']['balls'],
                            players_values[player]['bowling']['runs'],
                            (1 if players_values[player]['bowling']['wickets'] > 4 else 0),
                            (1 if players_values[player]['bowling']['wickets'] > 5 else 0),

                            players_values[player]['id']
                          )
                          )
      cursor.execute('''UPDATE PLAYERS
                    SET Batting_strike_rate = ROUND(Runs_scored * 100.0 / Balls_faced, 2), 
                    Batting_average = ROUND((Runs_scored) * 1.0 / (Innings_batted - Not_outs), 2),
                    Economy = ROUND(Runs_given * 6.0 / Balls_bowled, 2),
                    Bowling_average = ROUND(Runs_given * 1.0 / Wickets_taken, 2),
                    Bowling_strike_rate = ROUND(Balls_bowled * 1.0 / Wickets_taken, 2)
                    ''')

    conn.commit()
    conn.close()
  