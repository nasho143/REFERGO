-- REFERGO migration: applicant gender and birthdate (age is computed from birthdate).
-- Run once against the refergo database.

ALTER TABLE applicants
  ADD COLUMN gender ENUM('Male','Female') NULL AFTER contact_number,
  ADD COLUMN birthdate DATE NULL AFTER gender;
