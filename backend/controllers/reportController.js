const db = require("../config/db");

// ======================================================
// GET REPORTS
// ======================================================

exports.getReports = (req, res) => {
  const report = {
    // ====================================================
    // MAIN COUNTS
    // ====================================================

    applicants: 0,
    employers: 0,
    vacancies: 0,
    activeVacancies: 0,
    referrals: 0,

    // ====================================================
    // EMPLOYMENT OUTCOMES
    // ====================================================

    interviewed: 0,
    hired: 0,
    rejected: 0,
    pending: 0,
    placementRate: 0,

    // ====================================================
    // ANALYTICS
    // ====================================================

    status: [],
    topPositions: [],
    topEmployers: [],
    monthlyData: [],

    // ====================================================
    // RAW REPORT DATA
    // ====================================================

    applicantData: [],
    employerData: [],
    vacancyData: [],
    referralData: [],
  };

  // ======================================================
  // 1. APPLICANTS
  // ======================================================

  db.query(
    `
    SELECT
      applicant_id,
      full_name,
      contact_number,
      education,
      skills,
      address,
      classification,

      resume_uploaded,
      valid_id_uploaded,
      diploma_tor_uploaded,

      profile_completion_score,
      job_readiness_score,

      DATE_FORMAT(
        created_at,
        '%Y-%m-%d'
      ) AS date_added

    FROM applicants

    ORDER BY applicant_id DESC
    `,
    (err, applicants) => {
      if (err) {
        console.error(
          "APPLICANTS REPORT ERROR:",
          err
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to load applicants report.",
          error: err.message,
        });
      }

      report.applicantData =
        Array.isArray(applicants)
          ? applicants
          : [];

      report.applicants =
        report.applicantData.length;

      // ==================================================
      // 2. EMPLOYERS
      // ==================================================

      db.query(
        `
        SELECT
          employer_id,
          company_name,
          address,
          contact_person,
          contact_number,
          email,
          reapply_cooldown_days,

          DATE_FORMAT(
            created_at,
            '%Y-%m-%d'
          ) AS date_added

        FROM employers

        ORDER BY employer_id DESC
        `,
        (err, employers) => {
          if (err) {
            console.error(
              "EMPLOYERS REPORT ERROR:",
              err
            );

            return res.status(500).json({
              success: false,
              message:
                "Failed to load employers report.",
              error: err.message,
            });
          }

          report.employerData =
            Array.isArray(employers)
              ? employers
              : [];

          /*
           * The employers table does not currently
           * contain an employer status field.
           *
           * Therefore, employers represents the
           * total registered employers.
           */
          report.employers =
            report.employerData.length;

          // ==================================================
          // 3. JOB VACANCIES
          // ==================================================

          db.query(
            `
            SELECT
              v.vacancy_id,
              v.employer_id,

              e.company_name,

              v.position_title,
              v.qualifications,
              v.requirements,
              v.salary,
              v.location,
              v.employment_type,
              v.deadline,
              v.openings,
              v.status,

              DATE_FORMAT(
                v.created_at,
                '%Y-%m-%d'
              ) AS date_added

            FROM job_vacancies v

            LEFT JOIN employers e
              ON v.employer_id =
                 e.employer_id

            ORDER BY v.vacancy_id DESC
            `,
            (err, vacancies) => {
              if (err) {
                console.error(
                  "VACANCIES REPORT ERROR:",
                  err
                );

                return res.status(500).json({
                  success: false,
                  message:
                    "Failed to load vacancies report.",
                  error: err.message,
                });
              }

              report.vacancyData =
                Array.isArray(vacancies)
                  ? vacancies
                  : [];

              report.vacancies =
                report.vacancyData.length;

              // ------------------------------------------
              // ACTIVE VACANCIES
              // ------------------------------------------

              report.activeVacancies =
                report.vacancyData.filter(
                  (vacancy) =>
                    String(
                      vacancy.status
                    ).toLowerCase() ===
                    "active"
                ).length;

              // ==================================================
              // 4. REFERRALS
              // ==================================================

              db.query(
                `
                SELECT
                  r.referral_id,
                  r.applicant_id,
                  r.vacancy_id,

                  a.full_name,
                  a.contact_number,
                  a.classification,

                  e.employer_id,
                  e.company_name,

                  v.position_title,
                  v.salary,
                  v.location,
                  v.employment_type,

                  r.date_referred,
                  r.interview_date,
                  r.status,
                  r.result,
                  r.rejection_reason,

                  r.date_contacted,
                  r.contacted_person,
                  r.contact_method,
                  r.follow_up_result,
                  r.next_follow_up,

                  r.reapply_eligible_date

                FROM referrals r

                LEFT JOIN applicants a
                  ON r.applicant_id =
                     a.applicant_id

                LEFT JOIN job_vacancies v
                  ON r.vacancy_id =
                     v.vacancy_id

                LEFT JOIN employers e
                  ON v.employer_id =
                     e.employer_id

                ORDER BY r.referral_id DESC
                `,
                (err, referrals) => {
                  if (err) {
                    console.error(
                      "REFERRALS REPORT ERROR:",
                      err
                    );

                    return res.status(500).json({
                      success: false,
                      message:
                        "Failed to load referrals report.",
                      error: err.message,
                    });
                  }

                  report.referralData =
                    Array.isArray(referrals)
                      ? referrals
                      : [];

                  report.referrals =
                    report.referralData.length;

                  // ==================================================
                  // 5. REFERRAL STATUS COUNTS
                  // ==================================================

                  db.query(
                    `
                    SELECT
                      status,
                      COUNT(*) AS total

                    FROM referrals

                    GROUP BY status

                    ORDER BY
                      total DESC,
                      status ASC
                    `,
                    (err, status) => {
                      if (err) {
                        console.error(
                          "REFERRAL STATUS REPORT ERROR:",
                          err
                        );

                        return res.status(500).json({
                          success: false,
                          message:
                            "Failed to load referral status report.",
                          error: err.message,
                        });
                      }

                      report.status =
                        Array.isArray(status)
                          ? status
                          : [];

                      // ==================================================
                      // 6. INTERVIEWED
                      // ==================================================
                      //
                      // IMPORTANT:
                      // An applicant is considered interviewed only
                      // when an actual interview date is recorded.
                      //
                      // We do NOT count:
                      // - For Interview
                      // - Interview Scheduled
                      // - Hired
                      // - Rejected
                      // - Failed
                      //
                      // unless interview_date is actually present.
                      //
                      // ==================================================

                      db.query(
                        `
                        SELECT
                          COUNT(*) AS total

                        FROM referrals

                        WHERE interview_date
                              IS NOT NULL
                        `,
                        (err, interviewedResult) => {
                          if (err) {
                            console.error(
                              "INTERVIEWED REPORT ERROR:",
                              err
                            );

                            return res.status(500).json({
                              success: false,
                              message:
                                "Failed to load interviewed report.",
                              error: err.message,
                            });
                          }

                          report.interviewed =
                            Number(
                              interviewedResult[0]?.total
                            ) || 0;

                          // ==================================================
                          // 7. HIRED
                          // ==================================================

                          db.query(
                            `
                            SELECT
                              COUNT(*) AS total

                            FROM referrals

                            WHERE status = 'Hired'
                            `,
                            (err, hiredResult) => {
                              if (err) {
                                console.error(
                                  "HIRED REPORT ERROR:",
                                  err
                                );

                                return res.status(500).json({
                                  success: false,
                                  message:
                                    "Failed to load hired report.",
                                  error: err.message,
                                });
                              }

                              report.hired =
                                Number(
                                  hiredResult[0]?.total
                                ) || 0;

                              // ==================================================
                              // 8. REJECTED
                              // ==================================================

                              db.query(
                                `
                                SELECT
                                  COUNT(*) AS total

                                FROM referrals

                                WHERE status = 'Rejected'
                                `,
                                (err, rejectedResult) => {
                                  if (err) {
                                    console.error(
                                      "REJECTED REPORT ERROR:",
                                      err
                                    );

                                    return res.status(500).json({
                                      success: false,
                                      message:
                                        "Failed to load rejected report.",
                                      error: err.message,
                                    });
                                  }

                                  report.rejected =
                                    Number(
                                      rejectedResult[0]?.total
                                    ) || 0;

                                  // ==================================================
                                  // 9. PENDING
                                  // ==================================================

                                  db.query(
                                    `
                                    SELECT
                                      COUNT(*) AS total

                                    FROM referrals

                                    WHERE status = 'Pending'
                                    `,
                                    (err, pendingResult) => {
                                      if (err) {
                                        console.error(
                                          "PENDING REPORT ERROR:",
                                          err
                                        );

                                        return res.status(500).json({
                                          success: false,
                                          message:
                                            "Failed to load pending report.",
                                          error: err.message,
                                        });
                                      }

                                      report.pending =
                                        Number(
                                          pendingResult[0]?.total
                                        ) || 0;

                                      // ==================================================
                                      // 10. PLACEMENT RATE
                                      // ==================================================
                                      //
                                      // Placement Rate =
                                      // Hired / Total Referrals * 100
                                      //
                                      // ==================================================

                                      if (
                                        report.referrals >
                                        0
                                      ) {
                                        report.placementRate =
                                          Number(
                                            (
                                              (
                                                report.hired /
                                                report.referrals
                                              ) *
                                              100
                                            ).toFixed(2)
                                          );
                                      } else {
                                        report.placementRate = 0;
                                      }

                                      // ==================================================
                                      // 11. TOP POSITIONS
                                      // ==================================================

                                      db.query(
                                        `
                                        SELECT
                                          v.position_title,

                                          COUNT(
                                            r.referral_id
                                          ) AS total_referrals,

                                          SUM(
                                            CASE
                                              WHEN r.status =
                                                   'Hired'
                                              THEN 1
                                              ELSE 0
                                            END
                                          ) AS hired

                                        FROM referrals r

                                        LEFT JOIN job_vacancies v
                                          ON r.vacancy_id =
                                             v.vacancy_id

                                        WHERE
                                          v.position_title
                                          IS NOT NULL

                                        GROUP BY
                                          v.position_title

                                        ORDER BY
                                          total_referrals DESC,
                                          v.position_title ASC

                                        LIMIT 10
                                        `,
                                        (
                                          err,
                                          topPositions
                                        ) => {
                                          if (err) {
                                            console.error(
                                              "TOP POSITIONS REPORT ERROR:",
                                              err
                                            );

                                            return res.status(500).json({
                                              success: false,
                                              message:
                                                "Failed to load top positions report.",
                                              error: err.message,
                                            });
                                          }

                                          report.topPositions =
                                            Array.isArray(
                                              topPositions
                                            )
                                              ? topPositions
                                              : [];

                                          // ==================================================
                                          // 12. TOP EMPLOYERS
                                          // ==================================================

                                          db.query(
                                            `
                                            SELECT
                                              e.company_name,

                                              COUNT(
                                                r.referral_id
                                              ) AS total_referrals,

                                              SUM(
                                                CASE
                                                  WHEN r.status =
                                                       'Hired'
                                                  THEN 1
                                                  ELSE 0
                                                END
                                              ) AS hired

                                            FROM referrals r

                                            LEFT JOIN job_vacancies v
                                              ON r.vacancy_id =
                                                 v.vacancy_id

                                            LEFT JOIN employers e
                                              ON v.employer_id =
                                                 e.employer_id

                                            WHERE
                                              e.company_name
                                              IS NOT NULL

                                            GROUP BY
                                              e.company_name

                                            ORDER BY
                                              total_referrals DESC,
                                              e.company_name ASC

                                            LIMIT 10
                                            `,
                                            (
                                              err,
                                              topEmployers
                                            ) => {
                                              if (err) {
                                                console.error(
                                                  "TOP EMPLOYERS REPORT ERROR:",
                                                  err
                                                );

                                                return res.status(500).json({
                                                  success: false,
                                                  message:
                                                    "Failed to load top employers report.",
                                                  error: err.message,
                                                });
                                              }

                                              report.topEmployers =
                                                Array.isArray(
                                                  topEmployers
                                                )
                                                  ? topEmployers
                                                  : [];

                                              // ==================================================
                                              // 13. MONTHLY REPORT
                                              // ==================================================
                                              //
                                              // IMPORTANT:
                                              //
                                              // Monthly interviewed is based on
                                              // interview_date, NOT referral status.
                                              //
                                              // This means a referral scheduled
                                              // for interview but without an
                                              // actual interview date is not
                                              // counted as interviewed.
                                              //
                                              // ==================================================

                                              db.query(
                                                `
                                                SELECT

                                                  DATE_FORMAT(
                                                    date_referred,
                                                    '%Y-%m'
                                                  ) AS month,

                                                  COUNT(
                                                    *
                                                  ) AS total_referred,

                                                  SUM(
                                                    CASE
                                                      WHEN status =
                                                           'Hired'
                                                      THEN 1
                                                      ELSE 0
                                                    END
                                                  ) AS hired,

                                                  SUM(
                                                    CASE
                                                      WHEN interview_date
                                                           IS NOT NULL
                                                      THEN 1
                                                      ELSE 0
                                                    END
                                                  ) AS interviewed,

                                                  SUM(
                                                    CASE
                                                      WHEN status =
                                                           'Rejected'
                                                      THEN 1
                                                      ELSE 0
                                                    END
                                                  ) AS rejected,

                                                  SUM(
                                                    CASE
                                                      WHEN status =
                                                           'Pending'
                                                      THEN 1
                                                      ELSE 0
                                                    END
                                                  ) AS pending

                                                FROM referrals

                                                WHERE
                                                  date_referred
                                                  IS NOT NULL

                                                GROUP BY
                                                  DATE_FORMAT(
                                                    date_referred,
                                                    '%Y-%m'
                                                  )

                                                ORDER BY
                                                  month ASC
                                                `,
                                                (
                                                  err,
                                                  monthlyData
                                                ) => {
                                                  if (err) {
                                                    console.error(
                                                      "MONTHLY REPORT ERROR:",
                                                      err
                                                    );

                                                    return res.status(500).json({
                                                      success: false,
                                                      message:
                                                        "Failed to load monthly report.",
                                                      error: err.message,
                                                    });
                                                  }

                                                  report.monthlyData =
                                                    Array.isArray(
                                                      monthlyData
                                                    )
                                                      ? monthlyData
                                                      : [];

                                                  // ==================================================
                                                  // FINAL RESPONSE
                                                  // ==================================================

                                                  console.log(
                                                    "================================="
                                                  );

                                                  console.log(
                                                    "REPORT DATA"
                                                  );

                                                  console.log(
                                                    "================================="
                                                  );

                                                  console.log(
                                                    JSON.stringify(
                                                      report,
                                                      null,
                                                      2
                                                    )
                                                  );

                                                  console.log(
                                                    "================================="
                                                  );

                                                  res.json({
                                                    success: true,
                                                    ...report,
                                                  });
                                                }
                                              );
                                            }
                                          );
                                        }
                                      );
                                    }
                                  );
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};