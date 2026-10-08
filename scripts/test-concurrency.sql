-- ============================================================================
-- GoTurf Concurrency & Exclusion Constraint Verification Test
-- Verifies that PostgreSQL physically rejects overlapping active bookings
-- ============================================================================

DO $$
DECLARE
  v_court_id UUID := '40000000-0000-0000-0000-000000000001'; -- Bandra Box Cricket
  v_player_id UUID := '20000000-0000-0000-0000-000000000005';
  v_booking1_id UUID;
  v_booking2_id UUID;
  v_overlap_failed BOOLEAN := false;
BEGIN
  RAISE NOTICE '>>> TEST 1: Inserting initial confirmed booking (18:00 to 19:00 UTC)...';
  
  INSERT INTO bookings (
    court_id, player_id, booking_type, time_range, status, price_paise
  ) VALUES (
    v_court_id,
    v_player_id,
    'player',
    tstzrange('2026-10-15 18:00:00+00', '2026-10-15 19:00:00+00', '[)'),
    'confirmed',
    180000
  ) RETURNING id INTO v_booking1_id;

  RAISE NOTICE '>>> Booking 1 created successfully: %', v_booking1_id;

  RAISE NOTICE '>>> TEST 2: Attempting to insert overlapping held booking (18:30 to 19:30 UTC)...';
  BEGIN
    INSERT INTO bookings (
      court_id, player_id, booking_type, time_range, status, price_paise
    ) VALUES (
      v_court_id,
      v_player_id,
      'player',
      tstzrange('2026-10-15 18:30:00+00', '2026-10-15 19:30:00+00', '[)'),
      'held',
      180000
    ) RETURNING id INTO v_booking2_id;
  EXCEPTION
    WHEN exclusion_violation THEN
      v_overlap_failed := true;
      RAISE NOTICE '>>> [PASS] PostgreSQL correctly rejected overlapping booking with exclusion_violation!';
  END;

  IF NOT v_overlap_failed THEN
    RAISE EXCEPTION '>>> [FAIL] Concurrency violation: overlapping booking was incorrectly permitted!';
  END IF;

  RAISE NOTICE '>>> TEST 3: Verifying that cancelled bookings allow re-booking...';
  UPDATE bookings SET status = 'cancelled' WHERE id = v_booking1_id;

  INSERT INTO bookings (
    court_id, player_id, booking_type, time_range, status, price_paise
  ) VALUES (
    v_court_id,
    v_player_id,
    'player',
    tstzrange('2026-10-15 18:00:00+00', '2026-10-15 19:00:00+00', '[)'),
    'confirmed',
    180000
  );
  RAISE NOTICE '>>> [PASS] Cancelled slot was successfully re-booked!';

  RAISE NOTICE '>>> TEST 4: Verifying owner offline blocks participate in exclusion constraint...';
  -- Insert owner block for 20:00 to 21:00
  INSERT INTO bookings (
    court_id, player_id, booking_type, time_range, status, price_paise, notes
  ) VALUES (
    v_court_id,
    NULL,
    'owner_block',
    tstzrange('2026-10-15 20:00:00+00', '2026-10-15 21:00:00+00', '[)'),
    'confirmed',
    0,
    'Maintenance: Floodlight bulb replacement'
  );

  -- Attempt player booking over owner block
  v_overlap_failed := false;
  BEGIN
    INSERT INTO bookings (
      court_id, player_id, booking_type, time_range, status, price_paise
    ) VALUES (
      v_court_id,
      v_player_id,
      'player',
      tstzrange('2026-10-15 20:15:00+00', '2026-10-15 21:15:00+00', '[)'),
      'held',
      180000
    );
  EXCEPTION
    WHEN exclusion_violation THEN
      v_overlap_failed := true;
      RAISE NOTICE '>>> [PASS] Owner block successfully blocked overlapping player booking!';
  END;

  IF NOT v_overlap_failed THEN
    RAISE EXCEPTION '>>> [FAIL] Owner block did not protect court time!';
  END IF;

  -- Cleanup test records
  DELETE FROM bookings WHERE court_id = v_court_id AND lower(time_range) >= '2026-10-15 00:00:00+00';
  RAISE NOTICE '>>> ALL PHASE 1 DATABASE CONCURRENCY TESTS PASSED! <<<';
END $$;
