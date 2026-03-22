from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import sqlite3
import os
import time
import traceback

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "database", "cricket.db")

# ─── Mappings ───────────────────────────────────────────────────────────
TABLE_MAP = {
    'Player':      'PLAYERS',
    'Team':        'TEAMS',
    'Matches':     'MATCHES',
    'Tournament':  'TOURNAMENTS',
}

# Calculated SQL expressions for Situational Analytics
METRIC_EXPRESSIONS = {
    'Innings_batted':      "COUNT(DISTINCT CASE WHEN PLAYERS.Player_ID = DELIVERY.Striker THEN DELIVERY.Match_ID || '-' || DELIVERY.Innings_no END)",
    'Runs_scored':         "SUM(CASE WHEN PLAYERS.Player_ID = DELIVERY.Striker THEN DELIVERY_OUTCOME_RUNS.Runs_scored ELSE 0 END)",
    'Balls_faced':         "COUNT(CASE WHEN PLAYERS.Player_ID = DELIVERY.Striker THEN DELIVERY.Ball_no END)",
    'Fours':               "SUM(CASE WHEN PLAYERS.Player_ID = DELIVERY.Striker AND DELIVERY_OUTCOME_RUNS.Runs_scored = 4 THEN 1 ELSE 0 END)",
    'Sixes':               "SUM(CASE WHEN PLAYERS.Player_ID = DELIVERY.Striker AND DELIVERY_OUTCOME_RUNS.Runs_scored = 6 THEN 1 ELSE 0 END)",
    'Batting_average':     "CAST(SUM(CASE WHEN PLAYERS.Player_ID = DELIVERY.Striker THEN DELIVERY_OUTCOME_RUNS.Runs_scored ELSE 0 END) AS REAL) / NULLIF(COUNT(CASE WHEN PLAYERS.Player_ID = DELIVERY.Striker AND DELIVERY_OUTCOME_WICKETS.Match_ID IS NOT NULL THEN 1 END), 0)",
    'Batting_strike_rate': "100.0 * SUM(CASE WHEN PLAYERS.Player_ID = DELIVERY.Striker THEN DELIVERY_OUTCOME_RUNS.Runs_scored ELSE 0 END) / NULLIF(COUNT(CASE WHEN PLAYERS.Player_ID = DELIVERY.Striker THEN DELIVERY.Ball_no END), 0)",
    'Wickets_taken':       "COUNT(DISTINCT CASE WHEN PLAYERS.Player_ID = DELIVERY.Bowler AND DELIVERY_OUTCOME_WICKETS.Out_batter IS NOT NULL THEN DELIVERY.Match_ID || '-' || DELIVERY.Innings_no || '-' || DELIVERY.Over_no || '-' || DELIVERY.Delivery_no END)",
    'Balls_bowled':        "COUNT(CASE WHEN PLAYERS.Player_ID = DELIVERY.Bowler THEN DELIVERY.Ball_no END)",
    'Runs_given':          "SUM(CASE WHEN PLAYERS.Player_ID = DELIVERY.Bowler THEN DELIVERY_OUTCOME_RUNS.Runs_scored + COALESCE(DELIVERY_OUTCOME_EXTRAS.Runs_scored, 0) ELSE 0 END)",
    'Economy':             "6.0 * SUM(CASE WHEN PLAYERS.Player_ID = DELIVERY.Bowler THEN DELIVERY_OUTCOME_RUNS.Runs_scored + COALESCE(DELIVERY_OUTCOME_EXTRAS.Runs_scored, 0) ELSE 0 END) / NULLIF(COUNT(CASE WHEN PLAYERS.Player_ID = DELIVERY.Bowler THEN DELIVERY.Ball_no END), 0)",
    'Bowling_average':     "CAST(SUM(CASE WHEN PLAYERS.Player_ID = DELIVERY.Bowler THEN DELIVERY_OUTCOME_RUNS.Runs_scored + COALESCE(DELIVERY_OUTCOME_EXTRAS.Runs_scored, 0) ELSE 0 END) AS REAL) / NULLIF(COUNT(DISTINCT CASE WHEN PLAYERS.Player_ID = DELIVERY.Bowler AND DELIVERY_OUTCOME_WICKETS.Out_batter IS NOT NULL THEN DELIVERY.Match_ID || '-' || DELIVERY.Innings_no || '-' || DELIVERY.Over_no || '-' || DELIVERY.Delivery_no END), 0)",
    'Bowling_strike_rate': "CAST(COUNT(CASE WHEN PLAYERS.Player_ID = DELIVERY.Bowler THEN DELIVERY.Ball_no END) AS REAL) / NULLIF(COUNT(DISTINCT CASE WHEN PLAYERS.Player_ID = DELIVERY.Bowler AND DELIVERY_OUTCOME_WICKETS.Out_batter IS NOT NULL THEN DELIVERY.Match_ID || '-' || DELIVERY.Innings_no || '-' || DELIVERY.Over_no || '-' || DELIVERY.Delivery_no END), 0)",
    'Hundreds':            "COUNT(DISTINCT CASE WHEN (SELECT SUM(R.Runs_scored) FROM DELIVERY_OUTCOME_RUNS R JOIN DELIVERY D2 ON (R.Match_ID=D2.Match_ID AND R.Innings_no=D2.Innings_no AND R.Over_no=D2.Over_no AND R.Delivery_no=D2.Delivery_no) WHERE D2.Match_ID=DELIVERY.Match_ID AND D2.Striker=PLAYERS.Player_ID) >= 100 THEN DELIVERY.Match_ID END)",
    'Fifties':             "COUNT(DISTINCT CASE WHEN (SELECT SUM(R.Runs_scored) FROM DELIVERY_OUTCOME_RUNS R JOIN DELIVERY D2 ON (R.Match_ID=D2.Match_ID AND R.Innings_no=D2.Innings_no AND R.Over_no=D2.Over_no AND R.Delivery_no=D2.Delivery_no) WHERE D2.Match_ID=DELIVERY.Match_ID AND D2.Striker=PLAYERS.Player_ID) BETWEEN 50 AND 99 THEN DELIVERY.Match_ID END)",
    'Five_wicket_hauls':   "COUNT(DISTINCT CASE WHEN (SELECT COUNT(*) FROM DELIVERY_OUTCOME_WICKETS W JOIN DELIVERY D3 ON (W.Match_ID=D3.Match_ID AND W.Innings_no=D3.Innings_no AND W.Over_no=D3.Over_no AND W.Delivery_no=D3.Delivery_no) WHERE D3.Match_ID=DELIVERY.Match_ID AND D3.Bowler=PLAYERS.Player_ID AND W.Out_batter IS NOT NULL) >= 5 THEN DELIVERY.Match_ID END)"
}

class QueryPayload(BaseModel):
    tables: List[str]
    fields: List[Dict[str, str]]
    filters: List[Dict[str, Any]]
    sort: List[Dict[str, str]]
    pagination: Dict[str, int]
    aggregate: bool = False

def coerce_value(val: Any) -> Any:
    """Convert string numbers to Python int/float so SQLite uses numeric comparison."""
    if not isinstance(val, str):
        return val
    try:
        f = float(val)
        return int(f) if f == int(f) else f
    except (ValueError, TypeError):
        return val

@app.post("/api/query")
async def execute_query(payload: QueryPayload):
    start_time = time.time()
    try:
        select_clauses = []
        group_by_needed = payload.aggregate
        where_params = []   # params for WHERE clause (context filters)
        having_params = []  # params for HAVING clause (metric filters)
        where_parts = []
        having_parts = []
        
        if payload.aggregate:
            for f in payload.fields:
                field_key = f['field']
                if field_key in METRIC_EXPRESSIONS:
                    select_clauses.append(f"{METRIC_EXPRESSIONS[field_key]} AS {field_key}")
                else:
                    select_clauses.append(f"PLAYERS.{field_key}")
            
            joins = [
                "JOIN DELIVERY ON (PLAYERS.Player_ID = DELIVERY.Striker OR PLAYERS.Player_ID = DELIVERY.Bowler)",
                "LEFT JOIN DELIVERY_OUTCOME_RUNS ON (DELIVERY.Match_ID = DELIVERY_OUTCOME_RUNS.Match_ID AND DELIVERY.Innings_no = DELIVERY_OUTCOME_RUNS.Innings_no AND DELIVERY.Over_no = DELIVERY_OUTCOME_RUNS.Over_no AND DELIVERY.Delivery_no = DELIVERY_OUTCOME_RUNS.Delivery_no)",
                "LEFT JOIN DELIVERY_OUTCOME_WICKETS ON (DELIVERY.Match_ID = DELIVERY_OUTCOME_WICKETS.Match_ID AND DELIVERY.Innings_no = DELIVERY_OUTCOME_WICKETS.Innings_no AND DELIVERY.Over_no = DELIVERY_OUTCOME_WICKETS.Over_no AND DELIVERY.Delivery_no = DELIVERY_OUTCOME_WICKETS.Delivery_no)",
                "LEFT JOIN DELIVERY_OUTCOME_EXTRAS ON (DELIVERY.Match_ID = DELIVERY_OUTCOME_EXTRAS.Match_ID AND DELIVERY.Innings_no = DELIVERY_OUTCOME_EXTRAS.Innings_no AND DELIVERY.Over_no = DELIVERY_OUTCOME_EXTRAS.Over_no AND DELIVERY.Delivery_no = DELIVERY_OUTCOME_EXTRAS.Delivery_no)",
                "JOIN MATCHES ON DELIVERY.Match_ID = MATCHES.Match_ID",
            ]
            base_from = f"FROM PLAYERS {' '.join(joins)}"
            
            for f in payload.filters:
                tbl = TABLE_MAP.get(f['table'], f['table'])
                col = f['field']
                op = f['op']
                val = coerce_value(f['value'])
                
                if col in METRIC_EXPRESSIONS:
                    # Metric filter → goes in HAVING (applied after GROUP BY)
                    having_parts.append(f"{METRIC_EXPRESSIONS[col]} {op} ?")
                    having_params.append(val)
                elif tbl == 'MATCHES' and col == 'Winner_team':
                    where_parts.append(f"MATCHES.Winner_team_ID IN (SELECT Team_ID FROM TEAMS WHERE Team_name {op} ?)")
                    where_params.append(val)
                elif tbl == 'TEAMS' or (tbl == 'MATCHES' and 'Team' in col):
                    where_parts.append(f"(MATCHES.Team1_ID IN (SELECT Team_ID FROM TEAMS WHERE Team_name {op} ?) OR MATCHES.Team2_ID IN (SELECT Team_ID FROM TEAMS WHERE Team_name {op} ?))")
                    where_params.extend([val, val])
                else:
                    where_parts.append(f"{tbl}.{col} {op} ?")
                    where_params.append(val)
        else:
            for f in payload.fields:
                select_clauses.append(f"PLAYERS.{f['field']}")
            base_from = "FROM PLAYERS"
            for f in payload.filters:
                tbl = TABLE_MAP.get(f['table'], f['table'])
                col = f['field']
                op = f['op']
                val = f['value']
                
                if tbl == 'PLAYERS':
                    where_parts.append(f"PLAYERS.{col} {op} ?")
                    where_params.append(coerce_value(val))
                else:
                    match_where = f"TEAMS.Team_name {op} ?" if col == 'Winner_team' else f"{tbl}.{col} {op} ?"
                    subquery = f"""
                        PLAYERS.Player_ID IN (
                            SELECT DISTINCT Striker FROM DELIVERY 
                            JOIN MATCHES ON DELIVERY.Match_ID = MATCHES.Match_ID
                            LEFT JOIN TEAMS AS TEAMS ON MATCHES.Winner_team_ID = TEAMS.Team_ID
                            WHERE {match_where}
                            UNION
                            SELECT DISTINCT Bowler FROM DELIVERY 
                            JOIN MATCHES ON DELIVERY.Match_ID = MATCHES.Match_ID
                            LEFT JOIN TEAMS AS TEAMS ON MATCHES.Winner_team_ID = TEAMS.Team_ID
                            WHERE {match_where}
                        )
                    """
                    where_parts.append(subquery)
                    where_params.extend([coerce_value(val), coerce_value(val)])

        if not select_clauses: select_clauses = ["PLAYERS.Player_name"]
        
        query = f"SELECT {', '.join(select_clauses)} {base_from}"
        if where_parts: query += " WHERE " + " AND ".join(where_parts)
        if group_by_needed: query += " GROUP BY PLAYERS.Player_ID"
        if having_parts: query += " HAVING " + " AND ".join(having_parts)
        
        if payload.sort:
            sort_parts = [f"{s['field']} {s['dir']}" for s in payload.sort]
            query += " ORDER BY " + ", ".join(sort_parts)

        limit = payload.pagination.get('limit', 50)
        offset = (payload.pagination.get('page', 1) - 1) * limit
        
        total_query = f"SELECT COUNT(*) FROM ({query})"
        paged_query = f"{query} LIMIT {limit} OFFSET {offset}"

        # WHERE params must come first, then HAVING params (SQLite order requirement)
        params = where_params + having_params

        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        print(f"Executing Query [AGG={payload.aggregate}]: {paged_query}")
        print(f"  WHERE params: {where_params}")
        print(f"  HAVING params: {having_params}")
        cur.execute(paged_query, params)
        rows = [dict(r) for r in cur.fetchall()]
        cur.execute(total_query, params)
        total_row = cur.fetchone()
        total = total_row[0] if total_row else 0
        conn.close()
        
        return {
            "rows": rows, "total": total,
            "columns": list(rows[0].keys()) if rows else [],
            "query_time_ms": int((time.time() - start_time) * 1000)
        }
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/values")
async def get_distinct_values(payload: Dict[str, Any]):
    table_key = payload.get('table')
    field_key = payload.get('field')
    filters = payload.get('filters', [])
    
    db_table = TABLE_MAP.get(table_key, table_key)
    db_field = field_key
    
    is_winner_team = (table_key == 'Matches' and field_key == 'Winner_team')
    select_field = "TEAMS.Team_name" if is_winner_team else f"{db_field}"
    joins = ["JOIN TEAMS ON MATCHES.Winner_team_ID = TEAMS.Team_ID"] if is_winner_team else []
    
    query = f"SELECT DISTINCT {select_field} FROM {db_table} {' '.join(joins)}"
    where_parts = []
    params = []
    
    for f in filters:
        f_tbl = TABLE_MAP.get(f['table'], f['table'])
        f_col = f['field']
        if f_tbl != db_table or f_col in METRIC_EXPRESSIONS: continue
        where_parts.append(f"{f_col} {f['op']} ?")
        params.append(f['value'])

    if where_parts: query += " WHERE " + " AND ".join(where_parts)
    query += " ORDER BY 1 LIMIT 100"

    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute(query, params)
        values = [row[0] for row in cur.fetchall() if row[0] is not None]
        conn.close()
        return {"values": values}
    except Exception:
        return {"values": []}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
