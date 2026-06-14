-- Trigger 1: Elo update on match complete
CREATE OR REPLACE FUNCTION update_elo_on_match_complete()
RETURNS TRIGGER AS $$
DECLARE
  winner_rating INT;
  loser_rating  INT;
  loser_id      TEXT;
  expected_w    FLOAT;
  expected_l    FLOAT;
  new_winner    INT;
  new_loser     INT;
BEGIN
  IF NEW.status = 'completed' 
     AND OLD.status != 'completed' 
     AND NEW."winnerId" IS NOT NULL THEN
    loser_id := CASE 
      WHEN NEW."winnerId" = NEW."player1Id" 
      THEN NEW."player2Id" 
      ELSE NEW."player1Id" 
    END;
    SELECT rating INTO winner_rating FROM "User" WHERE id = NEW."winnerId";
    SELECT rating INTO loser_rating  FROM "User" WHERE id = loser_id;
    expected_w := 1.0 / (1.0 + POWER(10, (loser_rating - winner_rating) / 400.0));
    expected_l := 1.0 - expected_w;
    new_winner := winner_rating + ROUND(32 * (1 - expected_w));
    new_loser  := GREATEST(100, loser_rating + ROUND(32 * (0 - expected_l)));
    UPDATE "User" 
      SET rating = new_winner, "matchesWon" = "matchesWon" + 1 
      WHERE id = NEW."winnerId";
    UPDATE "User" 
      SET rating = new_loser, "matchesLost" = "matchesLost" + 1 
      WHERE id = loser_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_elo_update ON "Match";
CREATE TRIGGER trg_elo_update
AFTER UPDATE ON "Match"
FOR EACH ROW EXECUTE FUNCTION update_elo_on_match_complete();

-- Trigger 2: Auto set endTime
CREATE OR REPLACE FUNCTION set_match_endtime()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW."endTime" := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_match_endtime ON "Match";
CREATE TRIGGER trg_match_endtime
BEFORE UPDATE ON "Match"
FOR EACH ROW EXECUTE FUNCTION set_match_endtime();

-- Trigger 3: Prevent late submissions
CREATE OR REPLACE FUNCTION prevent_late_submission()
RETURNS TRIGGER AS $$
DECLARE
  match_status TEXT;
BEGIN
  SELECT status INTO match_status FROM "Match" WHERE id = NEW."matchId";
  IF match_status = 'completed' THEN
    RAISE EXCEPTION 'Cannot submit to a completed match';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_no_late_submission ON "Submission";
CREATE TRIGGER trg_no_late_submission
BEFORE INSERT ON "Submission"
FOR EACH ROW EXECUTE FUNCTION prevent_late_submission();
