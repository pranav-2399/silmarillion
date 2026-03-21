from get_seasons import get_seasons
from pprint import pprint
import base64, os, sqlite3

SRC_DIR = r'../../ipl_json'

def generate_id():
    return base64.urlsafe_b64encode(os.urandom(10)).decode().replace('_', '').replace('-', '').replace('=', '').replace(' ', '')[:4]

tournaments = get_seasons(SRC_DIR)

conn = sqlite3.connect(r'../cricket.db')
cur = conn.cursor()

for tournament in tournaments:
  tournament_id = generate_id()
  tournament_name = 'Indian Premier League ' + tournament

  res = cur.execute('''INSERT INTO TOURNAMENTS VALUES (?, ?, ?, ?, ?, ?, ?)''', 
                    (
                       tournament_id,
                       tournament_name,
                       0,
                       'ZX6PFXH',
                       'sf2CBBM',
                       '3c6ffae8',
                       '4329fbb5'
                    )
                   )
  
  conn.commit()

conn.commit()
conn.close()