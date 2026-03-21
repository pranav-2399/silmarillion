/* DELETE FROM TEAMS WHERE Team_name='Royal Challengers Bangalore';
DELETE FROM TEAMS WHERE Team_name='Kings XI Punjab';
DELETE FROM TEAMS WHERE Team_name='Delhi Daredevils';
DELETE FROM TEAMS WHERE Team_name='Rising Pune Supergiants'; */


/* UPDATE TEAM_NAME_HISTORY SET Team_ID='afyjezq' WHERE Team_ID='gaexlZ4'; */       /*RCB*/
/* UPDATE TEAM_NAME_HISTORY SET Team_ID='Ql9BoDF' WHERE Team_ID='R7TX38T';  */      /* PBKS */
/* UPDATE TEAM_NAME_HISTORY SET Team_ID='SoIbFfA' WHERE Team_ID='i4oWcNm';  */      /* DC */
/* UPDATE TEAM_NAME_HISTORY SET Team_ID='SuO50ai' WHERE Team_ID='ULTihfd';  */      /* RPS */



UPDATE TEAM_NAME_HISTORY as t1 
SET End_date=(
  SELECT Start_date-1 
  FROM TEAM_NAME_HISTORY as t2 
  WHERE (
    t1.Team_ID=t2.Team_ID AND 
    t1.Team_name!=t2.Team_name AND
    t2.Start_date > t1.Start_date
  )
);

/* UPDATE TEAM_NAME_HISTORY SET End_date='2025' WHERE Team_ID IN ('', 'Ql9BoDF', 'Ql9BoDF', '5aihWEA', 'FDIfKnO', 'fVvn9Ed', 'uDFyFcp', 'sf2CBBM', 'SoIbFfA', 'ZX6PFXH'); */