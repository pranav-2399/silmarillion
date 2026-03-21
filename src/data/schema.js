// ─── Field Types ───────────────────────────────────────────────────────────────
export const FIELD_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  DATE: 'date',
  ENUM: 'enum',
};

// ─── Filter Operators ──────────────────────────────────────────────────────────
export const FILTER_OPS_BY_TYPE = {
  string:  ['=', '!=', 'LIKE'],
  number:  ['=', '!=', '>', '<', '>=', '<=', 'BETWEEN'],
  boolean: ['='],
  date:    ['=', '>', '<', '>=', '<=', 'BETWEEN'],
  enum:    ['=', '!='],
};

// ─── Enum Values ───────────────────────────────────────────────────────────────
export const WICKET_TYPES = [
  'bowled', 'caught', 'lbw', 'run out', 'stumped',
  'hit wicket', 'obstructing the field', 'timed out',
  'handled the ball', 'hit the ball twice',
];
export const EXTRAS_TYPES    = ['wide', 'no-ball', 'bye', 'leg-bye', 'penalty'];
export const ELECTED_OPTIONS  = ['bat', 'bowl'];
export const RESULT_OPTIONS   = ['Win', 'Tie', 'Abandoned', 'No-result'];
export const MARGIN_TYPES     = ['runs', 'wickets', 'dls'];
export const PLAYER_TYPES     = ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'];

// ─── Table Definitions ─────────────────────────────────────────────────────────
export const TABLES = {
  Tournament: {
    label:   'Tournament',
    dbTable: 'Tournament',
    color:   '#f59e0b',
    icon:    '🏆',
    fields: {
      Tournament_ID:   { label: 'Tournament ID',       type: 'number', pk: true },
      Tournament_Name: { label: 'Tournament Name',     type: 'string' },
      shared:          { label: 'Shared',              type: 'boolean' },
      Winner_team_id:  { label: 'Winner Team ID',      type: 'number', fk: { table: 'Team',   field: 'Team_ID'   } },
      Runner_team_id:  { label: 'Runner-up Team ID',   type: 'number', fk: { table: 'Team',   field: 'Team_ID'   } },
      POTF:            { label: 'Player of the Final', type: 'number', fk: { table: 'Player', field: 'Player_ID' } },
      POTM:            { label: 'Player of the Series',type: 'number', fk: { table: 'Player', field: 'Player_ID' } },
    },
  },

  Team: {
    label:   'Team',
    dbTable: 'Team',
    color:   '#10b981',
    icon:    '🛡️',
    fields: {
      Team_ID:      { label: 'Team ID',      type: 'number', pk: true },
      Team_name:    { label: 'Team Name',    type: 'string' },
      Founded_year: { label: 'Founded Year', type: 'number' },
    },
  },

  Player: {
    label:   'Player',
    dbTable: 'Player',
    color:   '#6366f1',
    icon:    '🏏',
    fields: {
      Player_ID:           { label: 'Player ID',           type: 'number', pk: true },
      Player_name:         { label: 'Player Name',         type: 'string' },
      Nationality:         { label: 'Nationality',         type: 'string' },
      DOB:                 { label: 'Date of Birth',       type: 'date',   optional: true },
      Player_type:         { label: 'Player Type',         type: 'enum',   values: PLAYER_TYPES },
      Matches_played:      { label: 'Matches Played',      type: 'number', numeric: true },
      Innings_played:      { label: 'Innings Played',      type: 'number', numeric: true },
      Runs_scored:         { label: 'Runs Scored',         type: 'number', numeric: true },
      Balls_faced:         { label: 'Balls Faced',         type: 'number', numeric: true },
      Strike_rate:         { label: 'Strike Rate',         type: 'number', numeric: true },
      Batting_average:     { label: 'Batting Average',     type: 'number', numeric: true },
      Not_outs:            { label: 'Not Outs',            type: 'number', numeric: true },
      Fours:               { label: '4s',                  type: 'number', numeric: true },
      Sixes:               { label: '6s',                  type: 'number', numeric: true },
      Hundreds:            { label: '100s',                type: 'number', numeric: true },
      Fifties:             { label: '50s',                 type: 'number', numeric: true },
      Wickets_taken:       { label: 'Wickets Taken',       type: 'number', numeric: true },
      Balls_bowled:        { label: 'Balls Bowled',        type: 'number', numeric: true },
      Runs_given:          { label: 'Runs Given',          type: 'number', numeric: true },
      Economy:             { label: 'Economy',             type: 'number', numeric: true },
      Bowling_average:     { label: 'Bowling Average',     type: 'number', numeric: true },
      Bowling_strike_rate: { label: 'Bowling Strike Rate', type: 'number', numeric: true },
      Four_wicket_hauls:   { label: '4 Wicket Hauls',      type: 'number', numeric: true },
      Five_wicket_hauls:   { label: '5 Wicket Hauls',      type: 'number', numeric: true },
    },
  },

  Matches: {
    label:   'Matches',
    dbTable: 'Matches',
    color:   '#ef4444',
    icon:    '⚡',
    fields: {
      Match_id:        { label: 'Match ID',        type: 'number', pk: true },
      Match_name:      { label: 'Match Name',      type: 'string' },
      Tournament_id:   { label: 'Tournament ID',   type: 'number', fk: { table: 'Tournament', field: 'Tournament_ID' } },
      Team1_ID:        { label: 'Team 1 ID',       type: 'number', fk: { table: 'Team', field: 'Team_ID' } },
      Team2_ID:        { label: 'Team 2 ID',       type: 'number', fk: { table: 'Team', field: 'Team_ID' } },
      Toss_win:        { label: 'Toss Winner',     type: 'number', fk: { table: 'Team', field: 'Team_ID' } },
      Elected_to:      { label: 'Elected To',      type: 'enum',   values: ELECTED_OPTIONS },
      Result:          { label: 'Result',          type: 'enum',   values: RESULT_OPTIONS },
      Super_over:      { label: 'Super Over',      type: 'boolean' },
      Winner_team:     { label: 'Winner Team',     type: 'number', fk: { table: 'Team', field: 'Team_ID' } },
      Win_margin_type: { label: 'Win Margin Type', type: 'enum',   values: MARGIN_TYPES },
      Win_margin:      { label: 'Win Margin',      type: 'number', numeric: true },
      DLS:             { label: 'DLS Applied',     type: 'boolean' },
    },
  },

  Delivery: {
    label:   'Delivery',
    dbTable: 'Delivery',
    color:   '#8b5cf6',
    icon:    '🎯',
    fields: {
      Match_Id:    { label: 'Match ID',     type: 'number', pk: true, fk: { table: 'Matches', field: 'Match_id' } },
      Innings_no:  { label: 'Innings No',   type: 'number', pk: true },
      Over_no:     { label: 'Over No',      type: 'number', pk: true },
      Delivery_no: { label: 'Delivery No',  type: 'number', pk: true },
      Ball_no:     { label: 'Ball No',      type: 'number' },
      Bowler:      { label: 'Bowler',       type: 'number', fk: { table: 'Player', field: 'Player_ID' } },
      Striker:     { label: 'Striker',      type: 'number', fk: { table: 'Player', field: 'Player_ID' } },
      Non_Striker: { label: 'Non-Striker',  type: 'number', fk: { table: 'Player', field: 'Player_ID' } },
    },
  },

  Runs: {
    label:   'Runs',
    dbTable: 'Runs',
    color:   '#f97316',
    icon:    '🏃',
    fields: {
      Match_ID:    { label: 'Match ID',    type: 'number', pk: true, fk: { table: 'Delivery', field: 'Match_Id' } },
      Innings_No:  { label: 'Innings No',  type: 'number', pk: true },
      Over_No:     { label: 'Over No',     type: 'number', pk: true },
      Delivery_No: { label: 'Delivery No', type: 'number', pk: true },
      Ball_no:     { label: 'Ball No',     type: 'number' },
      Runs_scored: { label: 'Runs Scored', type: 'number', numeric: true },
      Boundary:    { label: 'Boundary',    type: 'boolean' },
    },
  },

  Wickets: {
    label:   'Wickets',
    dbTable: 'Wickets',
    color:   '#dc2626',
    icon:    '🎳',
    fields: {
      Match_ID:    { label: 'Match ID',     type: 'number', pk: true, fk: { table: 'Delivery', field: 'Match_Id' } },
      Innings_No:  { label: 'Innings No',   type: 'number', pk: true },
      Over_No:     { label: 'Over No',      type: 'number', pk: true },
      Delivery_No: { label: 'Delivery No',  type: 'number', pk: true },
      Ball_no:     { label: 'Ball No',      type: 'number' },
      Wicket_type: { label: 'Wicket Type',  type: 'enum',   values: WICKET_TYPES },
      Out_batter:  { label: 'Out Batter',   type: 'number', fk: { table: 'Player', field: 'Player_ID' } },
      Fielder:     { label: 'Fielder',      type: 'number', fk: { table: 'Player', field: 'Player_ID' } },
    },
  },

  Extras: {
    label:   'Extras',
    dbTable: 'Extras',
    color:   '#0ea5e9',
    icon:    '➕',
    fields: {
      Match_ID:    { label: 'Match ID',    type: 'number', pk: true, fk: { table: 'Delivery', field: 'Match_Id' } },
      Innings_No:  { label: 'Innings No',  type: 'number', pk: true },
      Over_No:     { label: 'Over No',     type: 'number', pk: true },
      Delivery_No: { label: 'Delivery No', type: 'number', pk: true },
      Ball_no:     { label: 'Ball No',     type: 'number' },
      Extras_type: { label: 'Extras Type', type: 'enum',   values: EXTRAS_TYPES },
      Runs_scored: { label: 'Runs Scored', type: 'number', numeric: true },
    },
  },
};

// ─── FK Join Graph ─────────────────────────────────────────────────────────────
export const JOIN_PATHS = [
  { from: 'Tournament', fromField: 'Winner_team_id', to: 'Team',        toField: 'Team_ID'       },
  { from: 'Tournament', fromField: 'Runner_team_id', to: 'Team',        toField: 'Team_ID'       },
  { from: 'Tournament', fromField: 'POTF',           to: 'Player',      toField: 'Player_ID'     },
  { from: 'Tournament', fromField: 'POTM',           to: 'Player',      toField: 'Player_ID'     },
  { from: 'Matches',    fromField: 'Tournament_id',  to: 'Tournament',  toField: 'Tournament_ID' },
  { from: 'Matches',    fromField: 'Team1_ID',        to: 'Team',        toField: 'Team_ID'       },
  { from: 'Matches',    fromField: 'Team2_ID',        to: 'Team',        toField: 'Team_ID'       },
  { from: 'Matches',    fromField: 'Toss_win',        to: 'Team',        toField: 'Team_ID'       },
  { from: 'Matches',    fromField: 'Winner_team',     to: 'Team',        toField: 'Team_ID'       },
  { from: 'Delivery',   fromField: 'Match_Id',        to: 'Matches',     toField: 'Match_id'      },
  { from: 'Delivery',   fromField: 'Bowler',          to: 'Player',      toField: 'Player_ID'     },
  { from: 'Delivery',   fromField: 'Striker',         to: 'Player',      toField: 'Player_ID'     },
  { from: 'Delivery',   fromField: 'Non_Striker',     to: 'Player',      toField: 'Player_ID'     },
  { from: 'Runs',       fromField: 'Match_ID',        to: 'Delivery',    toField: 'Match_Id'      },
  { from: 'Wickets',    fromField: 'Match_ID',        to: 'Delivery',    toField: 'Match_Id'      },
  { from: 'Wickets',    fromField: 'Out_batter',      to: 'Player',      toField: 'Player_ID'     },
  { from: 'Wickets',    fromField: 'Fielder',         to: 'Player',      toField: 'Player_ID'     },
  { from: 'Extras',     fromField: 'Match_ID',        to: 'Delivery',    toField: 'Match_Id'      },
];

export const TABLE_LIST = Object.keys(TABLES);
