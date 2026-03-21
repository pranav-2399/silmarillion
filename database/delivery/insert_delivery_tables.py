import json, sqlite3

SRC_DIR = r'../../ipl_json/'

with open(r'../matches.json', 'r') as f:
  matches = json.load(f)

conn = sqlite3.connect(r'../cricket.db')
cur = conn.cursor()

players = dict(cur.execute('''SELECT Player_name, Player_ID FROM PLAYERS;''').fetchall())

for match in matches:
  match_id = match['id']
  print(int(match_id))
  if int(match_id) in range (335982, 336041):

    with open(SRC_DIR + match_id + '.json', 'r') as f: data = json.load(f)
    
    innings = data['innings']
    for i in range(len(innings)):
      innings_no = i + 1
      overs = innings[i]['overs']
      for over in overs:
        over_no = over['over']
        deliveries = over['deliveries']
        ball_no = 0
        for j in range(len(deliveries)):
          delivery_no = j + 1
          delivery = deliveries[j]

          if 'extras' in delivery:
            extras = delivery['extras']
            extras_type = list(extras.keys())[0]
            extras_runs = extras[extras_type]
            if not('wides' in extras or 'noballs' in extras): ball_no += 1
          else: ball_no += 1

          bowler_id = players[delivery['bowler']]
          batter_id = players[delivery['batter']]
          non_striker_id = players[delivery['non_striker']]
          runs_scored = delivery['runs']['batter']
          boundary = 1 if runs_scored in (4, 6) else 0

          if 'wickets' in delivery:
            wicket = delivery['wickets'][0]
            wicket_type = wicket['kind']
            out_batter = players[wicket['player_out']]
            fielder_id = players[wicket['fielders'][0]['name']] if 'fielders' in wicket else None
          

          print((match_id, innings_no, over_no, delivery_no, ball_no, bowler_id, batter_id, non_striker_id))
          cur.execute('INSERT INTO DELIVERY VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
                      (
                        match_id, innings_no, over_no, delivery_no,
                        ball_no,
                        bowler_id, batter_id, non_striker_id
                      )
                     )

          if 'wickets' in delivery:
            cur.execute('INSERT INTO DELIVERY_OUTCOME_WICKETS VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                        (
                          match_id,
                          innings_no,
                          over_no,
                          delivery_no,
                          ball_no,
                          wicket_type,
                          runs_scored,
                          out_batter,
                          fielder_id
                        )
                      )
          if 'extras' in delivery:
            for extras_type in extras:
              extras_runs = extras[extras_type]
              cur.execute('INSERT INTO DELIVERY_OUTCOME_EXTRAS VALUES (?, ?, ?, ?, ?, ?, ?)', 
                        (
                          match_id,
                          innings_no,
                          over_no,
                          delivery_no,
                          ball_no,
                          extras_type,
                          extras_runs
                        )
                      )
          if 'runs' in delivery:
            cur.execute('INSERT INTO DELIVERY_OUTCOME_RUNS VALUES (?, ?, ?, ?, ?, ?, ?)', 
                        (
                          match_id,
                          innings_no,
                          over_no,
                          delivery_no,
                          ball_no,
                          runs_scored,
                          boundary
                        )
                      )
      conn.commit()


conn.commit()
conn.close()