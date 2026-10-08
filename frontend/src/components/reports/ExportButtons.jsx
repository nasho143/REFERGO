import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  FaFilePdf,
  FaFileExcel,
} from "react-icons/fa";

import Button from "../common/Button";
import logo from "../../assets/peso-logo.png";

import { createActivityLog } from "../../services/activityLogApi";

// =====================================================
// FORMAT HELPERS
// =====================================================

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(date);
  }

  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatMonth = (month) => {
  if (!month) return "-";

  const value = String(month);

  // Expected format from backend: YYYY-MM
  if (/^\d{4}-\d{2}$/.test(value)) {
    const parsedDate = new Date(`${value}-01T00:00:00`);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
    }
  }

  return value;
};

const formatNumber = (value) => {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return "0";
  }

  return number.toLocaleString();
};

const safeValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "-";
  }

  return String(value);
};

// =====================================================
// REPORT ACTIVITY LOG
// =====================================================

const logReportExport = async (activity) => {
  try {
    let user = null;

    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        user = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error(
        "FAILED TO READ STORED USER:",
        error
      );
    }

    await createActivityLog({
      user_id:
        user?.id ||
        user?.user_id ||
        null,

      username:
        user?.username ||
        null,

      module: "Reports",

      activity,

      ip_address: null,
    });
  } catch (error) {
    /*
     * Activity logging must never prevent
     * the report from being exported.
     */
    console.error(
      "REPORT ACTIVITY LOG ERROR:",
      error
    );
  }
};

// =====================================================
// PDF HEADER
// =====================================================

const addReportHeader = (doc, title) => {
  const pageWidth =
    doc.internal.pageSize.getWidth();

  try {
    doc.addImage(
      logo,
      "PNG",
      18,
      10,
      22,
      22
    );
  } catch (error) {
    console.error(
      "FAILED TO ADD PESO LOGO:",
      error
    );
  }

  // Organization name
  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(15);

  doc.text(
    "PESO MENDEZ, CAVITE",
    45,
    18
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8.5);

  doc.text(
    "Public Employment Service Office",
    45,
    25
  );

  // Generated date
  doc.setFontSize(8);

  doc.text(
    `Generated: ${formatDate(
      new Date()
    )}`,
    pageWidth - 18,
    18,
    {
      align: "right",
    }
  );

  // Report title
  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(13);

  doc.text(
    title,
    pageWidth / 2,
    40,
    {
      align: "center",
    }
  );

  doc.setDrawColor(
    200,
    200,
    200
  );

  doc.setLineWidth(0.3);

  doc.line(
    18,
    46,
    pageWidth - 18,
    46
  );
};

// =====================================================
// PDF FOOTER
// =====================================================

const addFooter = (doc) => {
  const pageCount =
    doc.internal.getNumberOfPages();

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  for (
    let page = 1;
    page <= pageCount;
    page++
  ) {
    doc.setPage(page);

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(7.5);

    doc.setTextColor(
      100,
      100,
      100
    );

    doc.text(
      "REFERGO - PESO Mendez, Cavite",
      18,
      pageHeight - 10
    );

    doc.text(
      `Page ${page} of ${pageCount}`,
      pageWidth - 18,
      pageHeight - 10,
      {
        align: "right",
      }
    );
  }

  doc.setTextColor(
    0,
    0,
    0
  );
};

// =====================================================
// GENERAL TABLE STYLES
// =====================================================

const getTableStyles = ({
  fontSize = 7.5,
  cellPadding = 2.5,
} = {}) => {
  return {
    theme: "grid",

    styles: {
      font: "helvetica",
      fontSize,
      cellPadding,
      overflow: "linebreak",
      valign: "middle",
      lineWidth: 0.2,
      lineColor: [
        210,
        214,
        220,
      ],
      textColor: [
        40,
        40,
        40,
      ],
    },

    headStyles: {
      font: "helvetica",
      fontStyle: "bold",
      fontSize,
      halign: "center",
      valign: "middle",
      cellPadding,
      lineWidth: 0.25,
    },

    bodyStyles: {
      font: "helvetica",
      fontSize,
      valign: "middle",
      cellPadding,
    },

    alternateRowStyles: {},

    margin: {
      left: 18,
      right: 18,
    },

    tableWidth: "auto",
  };
};

// =====================================================
// PAGE HELPERS
// =====================================================

const addLandscapePage = (doc) => {
  doc.addPage(
    "a4",
    "landscape"
  );
};

const addPortraitPage = (doc) => {
  doc.addPage(
    "a4",
    "portrait"
  );
};

// =====================================================
// EXPORT PDF
// =====================================================

const exportPDF = async (
  reportData = {}
) => {
  try {
    /*
     * IMPORTANT:
     * These names exactly match reportController.js.
     */
    const {
      applicants = 0,
      employers = 0,
      vacancies = 0,
      activeVacancies = 0,
      referrals = 0,

      interviewed = 0,
      hired = 0,
      rejected = 0,
      pending = 0,
      placementRate = 0,

      status = [],
      topPositions = [],
      topEmployers = [],
      monthlyData = [],

      applicantData = [],
      employerData = [],
      vacancyData = [],
      referralData = [],
    } = reportData;

    const doc =
      new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

    // =================================================
    // PAGE 1
    // RECRUITMENT SUMMARY
    // =================================================

    addReportHeader(
      doc,
      "Recruitment Summary"
    );

    autoTable(doc, {
      startY: 55,

      head: [
        [
          "Metric",
          "Total",
        ],
      ],

      body: [
        [
          "Total Applicants",
          formatNumber(
            applicants
          ),
        ],
        [
          "Total Employers",
          formatNumber(
            employers
          ),
        ],
        [
          "Total Job Vacancies",
          formatNumber(
            vacancies
          ),
        ],
        [
          "Active Job Vacancies",
          formatNumber(
            activeVacancies
          ),
        ],
        [
          "Total Referrals",
          formatNumber(
            referrals
          ),
        ],
        [
          "Applicants Interviewed",
          formatNumber(
            interviewed
          ),
        ],
        [
          "Applicants Hired",
          formatNumber(
            hired
          ),
        ],
        [
          "Applicants Rejected",
          formatNumber(
            rejected
          ),
        ],
        [
          "Pending Referrals",
          formatNumber(
            pending
          ),
        ],
        [
          "Placement Rate",
          `${Number(
            placementRate || 0
          ).toFixed(2)}%`,
        ],
      ],

      columnStyles: {
        0: {
          cellWidth: 105,
          halign: "left",
        },

        1: {
          cellWidth: 55,
          halign: "center",
        },
      },

      ...getTableStyles({
        fontSize: 9,
        cellPadding: 4,
      }),
    });

    // =================================================
    // PAGE 2
    // MONTHLY EMPLOYMENT REPORT
    // =================================================

    addPortraitPage(doc);

    addReportHeader(
      doc,
      "Monthly Employment Report"
    );

    autoTable(doc, {
      startY: 55,

      head: [
        [
          "Month",
          "Total Referred",
          "Interviewed",
          "Hired",
          "Rejected",
          "Pending",
        ],
      ],

      body:
        monthlyData.length > 0
          ? monthlyData.map(
              (item) => [
                formatMonth(
                  item.month
                ),

                formatNumber(
                  item.total_referred
                ),

                formatNumber(
                  item.interviewed
                ),

                formatNumber(
                  item.hired
                ),

                formatNumber(
                  item.rejected
                ),

                formatNumber(
                  item.pending
                ),
              ]
            )
          : [
              [
                "No data available",
                "0",
                "0",
                "0",
                "0",
                "0",
              ],
            ],

      columnStyles: {
        0: {
          cellWidth: 55,
          halign: "left",
        },

        1: {
          cellWidth: 25,
          halign: "center",
        },

        2: {
          cellWidth: 25,
          halign: "center",
        },

        3: {
          cellWidth: 25,
          halign: "center",
        },

        4: {
          cellWidth: 25,
          halign: "center",
        },

        5: {
          cellWidth: 25,
          halign: "center",
        },
      },

      ...getTableStyles({
        fontSize: 8,
        cellPadding: 3,
      }),
    });

    // =================================================
    // PAGE 3
    // APPLICANTS REPORT
    // =================================================

    addLandscapePage(doc);

    addReportHeader(
      doc,
      "Applicants Report"
    );

    autoTable(doc, {
      startY: 55,

      head: [
        [
          "ID",
          "Full Name",
          "Address",
          "Contact Number",
          "Classification",
          "Education",
          "Skills",
          "Date Added",
        ],
      ],

      body:
        applicantData.length > 0
          ? applicantData.map(
              (applicant) => [
                safeValue(
                  applicant.applicant_id
                ),

                safeValue(
                  applicant.full_name
                ),

                safeValue(
                  applicant.address
                ),

                safeValue(
                  applicant.contact_number
                ),

                safeValue(
                  applicant.classification
                ),

                safeValue(
                  applicant.education
                ),

                safeValue(
                  applicant.skills
                ),

                formatDate(
                  applicant.date_added
                ),
              ]
            )
          : [
              [
                "-",
                "No applicants found",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
              ],
            ],

      columnStyles: {
        0: {
          cellWidth: 15,
          halign: "center",
        },

        1: {
          cellWidth: 42,
          halign: "left",
        },

        2: {
          cellWidth: 45,
          halign: "left",
        },

        3: {
          cellWidth: 30,
          halign: "center",
        },

        4: {
          cellWidth: 32,
          halign: "left",
        },

        5: {
          cellWidth: 40,
          halign: "left",
        },

        6: {
          cellWidth: 45,
          halign: "left",
        },

        7: {
          cellWidth: 30,
          halign: "center",
        },
      },

      ...getTableStyles({
        fontSize: 7,
        cellPadding: 2.5,
      }),
    });

    // =================================================
    // PAGE 4
    // EMPLOYERS REPORT
    // =================================================

    addLandscapePage(doc);

    addReportHeader(
      doc,
      "Employers Report"
    );

    autoTable(doc, {
      startY: 55,

      head: [
        [
          "ID",
          "Company Name",
          "Address",
          "Contact Person",
          "Contact Number",
          "Email",
          "Cooldown Days",
          "Date Added",
        ],
      ],

      body:
        employerData.length > 0
          ? employerData.map(
              (employer) => [
                safeValue(
                  employer.employer_id
                ),

                safeValue(
                  employer.company_name
                ),

                safeValue(
                  employer.address
                ),

                safeValue(
                  employer.contact_person
                ),

                safeValue(
                  employer.contact_number
                ),

                safeValue(
                  employer.email
                ),

                formatNumber(
                  employer.reapply_cooldown_days
                ),

                formatDate(
                  employer.date_added
                ),
              ]
            )
          : [
              [
                "-",
                "No employers found",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
              ],
            ],

      columnStyles: {
        0: {
          cellWidth: 15,
          halign: "center",
        },

        1: {
          cellWidth: 42,
          halign: "left",
        },

        2: {
          cellWidth: 45,
          halign: "left",
        },

        3: {
          cellWidth: 35,
          halign: "left",
        },

        4: {
          cellWidth: 30,
          halign: "center",
        },

        5: {
          cellWidth: 50,
          halign: "left",
        },

        6: {
          cellWidth: 25,
          halign: "center",
        },

        7: {
          cellWidth: 30,
          halign: "center",
        },
      },

      ...getTableStyles({
        fontSize: 7,
        cellPadding: 2.5,
      }),
    });

    // =================================================
    // PAGE 5
    // JOB VACANCIES REPORT
    // =================================================

    addLandscapePage(doc);

    addReportHeader(
      doc,
      "Job Vacancies Report"
    );

    autoTable(doc, {
      startY: 55,

      head: [
        [
          "ID",
          "Position",
          "Employer",
          "Salary",
          "Location",
          "Employment Type",
          "Openings",
          "Deadline",
          "Status",
        ],
      ],

      body:
        vacancyData.length > 0
          ? vacancyData.map(
              (vacancy) => [
                safeValue(
                  vacancy.vacancy_id
                ),

                safeValue(
                  vacancy.position_title
                ),

                safeValue(
                  vacancy.company_name
                ),

                safeValue(
                  vacancy.salary
                ),

                safeValue(
                  vacancy.location
                ),

                safeValue(
                  vacancy.employment_type
                ),

                formatNumber(
                  vacancy.openings
                ),

                formatDate(
                  vacancy.deadline
                ),

                safeValue(
                  vacancy.status
                ),
              ]
            )
          : [
              [
                "-",
                "No job vacancies found",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
              ],
            ],

      columnStyles: {
        0: {
          cellWidth: 14,
          halign: "center",
        },

        1: {
          cellWidth: 45,
          halign: "left",
        },

        2: {
          cellWidth: 43,
          halign: "left",
        },

        3: {
          cellWidth: 35,
          halign: "left",
        },

        4: {
          cellWidth: 35,
          halign: "left",
        },

        5: {
          cellWidth: 32,
          halign: "center",
        },

        6: {
          cellWidth: 20,
          halign: "center",
        },

        7: {
          cellWidth: 30,
          halign: "center",
        },

        8: {
          cellWidth: 25,
          halign: "center",
        },
      },

      ...getTableStyles({
        fontSize: 7,
        cellPadding: 2.5,
      }),
    });

    // =================================================
    // PAGE 6
    // REFERRALS REPORT
    // =================================================

    addLandscapePage(doc);

    addReportHeader(
      doc,
      "Referrals Report"
    );

    autoTable(doc, {
      startY: 55,

      head: [
        [
          "ID",
          "Applicant",
          "Employer",
          "Position",
          "Date Referred",
          "Interview Date",
          "Status",
          "Result",
          "Reapply Eligible",
        ],
      ],

      body:
        referralData.length > 0
          ? referralData.map(
              (referral) => [
                safeValue(
                  referral.referral_id
                ),

                safeValue(
                  referral.full_name
                ),

                safeValue(
                  referral.company_name
                ),

                safeValue(
                  referral.position_title
                ),

                formatDate(
                  referral.date_referred
                ),

                formatDate(
                  referral.interview_date
                ),

                safeValue(
                  referral.status
                ),

                safeValue(
                  referral.result
                ),

                formatDate(
                  referral.reapply_eligible_date
                ),
              ]
            )
          : [
              [
                "-",
                "No referrals found",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
              ],
            ],

      columnStyles: {
        0: {
          cellWidth: 14,
          halign: "center",
        },

        1: {
          cellWidth: 43,
          halign: "left",
        },

        2: {
          cellWidth: 43,
          halign: "left",
        },

        3: {
          cellWidth: 42,
          halign: "left",
        },

        4: {
          cellWidth: 30,
          halign: "center",
        },

        5: {
          cellWidth: 30,
          halign: "center",
        },

        6: {
          cellWidth: 25,
          halign: "center",
        },

        7: {
          cellWidth: 30,
          halign: "left",
        },

        8: {
          cellWidth: 35,
          halign: "center",
        },
      },

      ...getTableStyles({
        fontSize: 7,
        cellPadding: 2.5,
      }),
    });

    // =================================================
    // PAGE 7
    // TOP POSITIONS
    // =================================================

    addLandscapePage(doc);

    addReportHeader(
      doc,
      "Top Positions and Employers"
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(11);

    doc.text(
      "Top Positions",
      18,
      55
    );

    autoTable(doc, {
      startY: 61,

      head: [
        [
          "Rank",
          "Position",
          "Total Referrals",
          "Hired",
        ],
      ],

      body:
        topPositions.length > 0
          ? topPositions.map(
              (item, index) => [
                index + 1,

                safeValue(
                  item.position_title
                ),

                formatNumber(
                  item.total_referrals
                ),

                formatNumber(
                  item.hired
                ),
              ]
            )
          : [
              [
                "-",
                "No data available",
                "0",
                "0",
              ],
            ],

      columnStyles: {
        0: {
          cellWidth: 18,
          halign: "center",
        },

        1: {
          cellWidth: 100,
          halign: "left",
        },

        2: {
          cellWidth: 45,
          halign: "center",
        },

        3: {
          cellWidth: 35,
          halign: "center",
        },
      },

      ...getTableStyles({
        fontSize: 8,
        cellPadding: 3,
      }),
    });

    const employerStartY =
      doc.lastAutoTable.finalY + 15;

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(11);

    doc.text(
      "Top Employers",
      18,
      employerStartY
    );

    autoTable(doc, {
      startY:
        employerStartY + 6,

      head: [
        [
          "Rank",
          "Employer",
          "Total Referrals",
          "Hired",
        ],
      ],

      body:
        topEmployers.length > 0
          ? topEmployers.map(
              (item, index) => [
                index + 1,

                safeValue(
                  item.company_name
                ),

                formatNumber(
                  item.total_referrals
                ),

                formatNumber(
                  item.hired
                ),
              ]
            )
          : [
              [
                "-",
                "No data available",
                "0",
                "0",
              ],
            ],

      columnStyles: {
        0: {
          cellWidth: 18,
          halign: "center",
        },

        1: {
          cellWidth: 100,
          halign: "left",
        },

        2: {
          cellWidth: 45,
          halign: "center",
        },

        3: {
          cellWidth: 35,
          halign: "center",
        },
      },

      ...getTableStyles({
        fontSize: 8,
        cellPadding: 3,
      }),
    });

    // =================================================
    // PAGE 8
    // REFERRAL STATUS
    // =================================================

    addPortraitPage(doc);

    addReportHeader(
      doc,
      "Referral Status"
    );

    autoTable(doc, {
      startY: 55,

      head: [
        [
          "Status",
          "Count",
          "Percentage",
        ],
      ],

      body:
        status.length > 0
          ? status.map(
              (item) => {
                const total =
                  Number(
                    item.total
                  ) || 0;

                const percentage =
                  referrals > 0
                    ? (
                        (total /
                          Number(
                            referrals
                          )) *
                        100
                      ).toFixed(2)
                    : "0.00";

                return [
                  safeValue(
                    item.status
                  ),

                  formatNumber(
                    total
                  ),

                  `${percentage}%`,
                ];
              }
            )
          : [
              [
                "No data available",
                "0",
                "0.00%",
              ],
            ],

      columnStyles: {
        0: {
          cellWidth: 70,
          halign: "left",
        },

        1: {
          cellWidth: 40,
          halign: "center",
        },

        2: {
          cellWidth: 40,
          halign: "center",
        },
      },

      ...getTableStyles({
        fontSize: 9,
        cellPadding: 4,
      }),
    });

    // =================================================
    // FOOTERS
    // =================================================

    addFooter(doc);

    // =================================================
    // SAVE PDF
    // =================================================

    doc.save(
      "REFERGO_Complete_Report.pdf"
    );

    // =================================================
    // ACTIVITY LOG
    // =================================================

    await logReportExport(
      "Exported report as PDF: Complete Report."
    );
  } catch (error) {
    console.error(
      "EXPORT PDF ERROR:",
      error
    );
  }
};

// =====================================================
// EXCEL COLUMN WIDTH HELPER
// =====================================================

const setExcelColumnWidths = (
  sheet,
  widths
) => {
  sheet["!cols"] =
    widths.map((width) => ({
      wch: width,
    }));
};

// =====================================================
// EXPORT EXCEL
// =====================================================

const exportExcel = async (
  reportData = {}
) => {
  try {
    /*
     * EXACT fields from reportController.js
     */
    const {
      applicants = 0,
      employers = 0,
      vacancies = 0,
      activeVacancies = 0,
      referrals = 0,

      interviewed = 0,
      hired = 0,
      rejected = 0,
      pending = 0,
      placementRate = 0,

      status = [],
      topPositions = [],
      topEmployers = [],
      monthlyData = [],

      applicantData = [],
      employerData = [],
      vacancyData = [],
      referralData = [],
    } = reportData;

    const workbook =
      XLSX.utils.book_new();

    // =================================================
    // SHEET 1 - SUMMARY
    // =================================================

    const summaryData = [
      [
        "REFERGO - PESO MENDEZ, CAVITE",
        "",
      ],

      [
        "Recruitment Summary",
        "",
      ],

      [],

      [
        "Metric",
        "Total",
      ],

      [
        "Total Applicants",
        applicants,
      ],

      [
        "Total Employers",
        employers,
      ],

      [
        "Total Job Vacancies",
        vacancies,
      ],

      [
        "Active Job Vacancies",
        activeVacancies,
      ],

      [
        "Total Referrals",
        referrals,
      ],

      [
        "Applicants Interviewed",
        interviewed,
      ],

      [
        "Applicants Hired",
        hired,
      ],

      [
        "Applicants Rejected",
        rejected,
      ],

      [
        "Pending Referrals",
        pending,
      ],

      [
        "Placement Rate",
        `${Number(
          placementRate || 0
        ).toFixed(2)}%`,
      ],

      [],

      [
        "Report Generated",
        formatDate(
          new Date()
        ),
      ],
    ];

    const summarySheet =
      XLSX.utils.aoa_to_sheet(
        summaryData
      );

    setExcelColumnWidths(
      summarySheet,
      [
        32,
        22,
      ]
    );

    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      "Summary"
    );

    // =================================================
    // SHEET 2 - MONTHLY REPORT
    // =================================================

    const monthlyRows =
      monthlyData.length > 0
        ? monthlyData.map(
            (item) => ({
              Month:
                formatMonth(
                  item.month
                ),

              "Total Referred":
                Number(
                  item.total_referred
                ) || 0,

              Interviewed:
                Number(
                  item.interviewed
                ) || 0,

              Hired:
                Number(
                  item.hired
                ) || 0,

              Rejected:
                Number(
                  item.rejected
                ) || 0,

              Pending:
                Number(
                  item.pending
                ) || 0,
            })
          )
        : [
            {
              Month:
                "No data available",

              "Total Referred": 0,

              Interviewed: 0,

              Hired: 0,

              Rejected: 0,

              Pending: 0,
            },
          ];

    const monthlySheet =
      XLSX.utils.json_to_sheet(
        monthlyRows
      );

    setExcelColumnWidths(
      monthlySheet,
      [
        20,
        18,
        15,
        12,
        12,
        12,
      ]
    );

    XLSX.utils.book_append_sheet(
      workbook,
      monthlySheet,
      "Monthly Report"
    );

    // =================================================
    // SHEET 3 - APPLICANTS
    // =================================================

    const applicantRows =
      applicantData.map(
        (applicant) => ({
          ID:
            applicant.applicant_id,

          "Full Name":
            applicant.full_name,

          "Contact Number":
            applicant.contact_number,

          Education:
            applicant.education,

          Skills:
            applicant.skills,

          Address:
            applicant.address,

          Classification:
            applicant.classification,

          "Resume Uploaded":
            applicant.resume_uploaded
              ? "Yes"
              : "No",

          "Valid ID Uploaded":
            applicant.valid_id_uploaded
              ? "Yes"
              : "No",

          "Diploma/TOR Uploaded":
            applicant.diploma_tor_uploaded
              ? "Yes"
              : "No",

          "Profile Completion Score":
            applicant.profile_completion_score,

          "Job Readiness Score":
            applicant.job_readiness_score,

          "Date Added":
            formatDate(
              applicant.date_added
            ),
        })
      );

    const applicantSheet =
      XLSX.utils.json_to_sheet(
        applicantRows
      );

    setExcelColumnWidths(
      applicantSheet,
      [
        10,
        30,
        18,
        28,
        35,
        40,
        20,
        18,
        18,
        20,
        24,
        22,
        18,
      ]
    );

    XLSX.utils.book_append_sheet(
      workbook,
      applicantSheet,
      "Applicants"
    );

    // =================================================
    // SHEET 4 - EMPLOYERS
    // =================================================

    const employerRows =
      employerData.map(
        (employer) => ({
          ID:
            employer.employer_id,

          "Company Name":
            employer.company_name,

          Address:
            employer.address,

          "Contact Person":
            employer.contact_person,

          "Contact Number":
            employer.contact_number,

          Email:
            employer.email,

          "Reapply Cooldown Days":
            employer.reapply_cooldown_days,

          "Date Added":
            formatDate(
              employer.date_added
            ),
        })
      );

    const employerSheet =
      XLSX.utils.json_to_sheet(
        employerRows
      );

    setExcelColumnWidths(
      employerSheet,
      [
        10,
        30,
        40,
        25,
        20,
        35,
        25,
        18,
      ]
    );

    XLSX.utils.book_append_sheet(
      workbook,
      employerSheet,
      "Employers"
    );

    // =================================================
    // SHEET 5 - JOB VACANCIES
    // =================================================

    const vacancyRows =
      vacancyData.map(
        (vacancy) => ({
          ID:
            vacancy.vacancy_id,

          "Employer ID":
            vacancy.employer_id,

          Employer:
            vacancy.company_name,

          Position:
            vacancy.position_title,

          Qualifications:
            vacancy.qualifications,

          Requirements:
            vacancy.requirements,

          Salary:
            vacancy.salary,

          Location:
            vacancy.location,

          "Employment Type":
            vacancy.employment_type,

          Deadline:
            formatDate(
              vacancy.deadline
            ),

          Openings:
            vacancy.openings,

          Status:
            vacancy.status,

          "Date Added":
            formatDate(
              vacancy.date_added
            ),
        })
      );

    const vacancySheet =
      XLSX.utils.json_to_sheet(
        vacancyRows
      );

    setExcelColumnWidths(
      vacancySheet,
      [
        10,
        12,
        30,
        30,
        40,
        40,
        25,
        25,
        20,
        18,
        12,
        15,
        18,
      ]
    );

    XLSX.utils.book_append_sheet(
      workbook,
      vacancySheet,
      "Job Vacancies"
    );

    // =================================================
    // SHEET 6 - REFERRALS
    // =================================================

    const referralRows =
      referralData.map(
        (referral) => ({
          ID:
            referral.referral_id,

          "Applicant ID":
            referral.applicant_id,

          Applicant:
            referral.full_name,

          "Applicant Contact":
            referral.contact_number,

          Classification:
            referral.classification,

          "Employer ID":
            referral.employer_id,

          Employer:
            referral.company_name,

          Position:
            referral.position_title,

          Salary:
            referral.salary,

          Location:
            referral.location,

          "Employment Type":
            referral.employment_type,

          "Date Referred":
            formatDate(
              referral.date_referred
            ),

          "Interview Date":
            formatDate(
              referral.interview_date
            ),

          Status:
            referral.status,

          Result:
            referral.result,

          "Rejection Reason":
            referral.rejection_reason,

          "Date Contacted":
            formatDate(
              referral.date_contacted
            ),

          "Contacted Person":
            referral.contacted_person,

          "Contact Method":
            referral.contact_method,

          "Follow-up Result":
            referral.follow_up_result,

          "Next Follow-up":
            formatDate(
              referral.next_follow_up
            ),

          "Reapply Eligible Date":
            formatDate(
              referral.reapply_eligible_date
            ),
        })
      );

    const referralSheet =
      XLSX.utils.json_to_sheet(
        referralRows
      );

    setExcelColumnWidths(
      referralSheet,
      [
        10,
        12,
        30,
        20,
        20,
        12,
        30,
        30,
        20,
        25,
        20,
        18,
        18,
        18,
        20,
        35,
        18,
        25,
        20,
        30,
        18,
        24,
      ]
    );

    XLSX.utils.book_append_sheet(
      workbook,
      referralSheet,
      "Referrals"
    );

    // =================================================
    // SHEET 7 - TOP POSITIONS
    // =================================================

    const topPositionRows =
      topPositions.map(
        (item, index) => ({
          Rank:
            index + 1,

          Position:
            item.position_title,

          "Total Referrals":
            Number(
              item.total_referrals
            ) || 0,

          Hired:
            Number(
              item.hired
            ) || 0,
        })
      );

    const topPositionSheet =
      XLSX.utils.json_to_sheet(
        topPositionRows
      );

    setExcelColumnWidths(
      topPositionSheet,
      [
        10,
        35,
        20,
        15,
      ]
    );

    XLSX.utils.book_append_sheet(
      workbook,
      topPositionSheet,
      "Top Positions"
    );

    // =================================================
    // SHEET 8 - TOP EMPLOYERS
    // =================================================

    const topEmployerRows =
      topEmployers.map(
        (item, index) => ({
          Rank:
            index + 1,

          Employer:
            item.company_name,

          "Total Referrals":
            Number(
              item.total_referrals
            ) || 0,

          Hired:
            Number(
              item.hired
            ) || 0,
        })
      );

    const topEmployerSheet =
      XLSX.utils.json_to_sheet(
        topEmployerRows
      );

    setExcelColumnWidths(
      topEmployerSheet,
      [
        10,
        40,
        20,
        15,
      ]
    );

    XLSX.utils.book_append_sheet(
      workbook,
      topEmployerSheet,
      "Top Employers"
    );

    // =================================================
    // SHEET 9 - REFERRAL STATUS
    // =================================================

    const statusRows =
      status.map(
        (item) => {
          const total =
            Number(
              item.total
            ) || 0;

          const percentage =
            referrals > 0
              ? (
                  (total /
                    Number(
                      referrals
                    )) *
                  100
                ).toFixed(2)
              : "0.00";

          return {
            Status:
              item.status,

            Count:
              total,

            Percentage:
              `${percentage}%`,
          };
        }
      );

    const statusSheet =
      XLSX.utils.json_to_sheet(
        statusRows
      );

    setExcelColumnWidths(
      statusSheet,
      [
        25,
        15,
        18,
      ]
    );

    XLSX.utils.book_append_sheet(
      workbook,
      statusSheet,
      "Referral Status"
    );

    // =================================================
    // SAVE EXCEL
    // =================================================

    const excelBuffer =
      XLSX.write(
        workbook,
        {
          bookType: "xlsx",
          type: "array",
        }
      );

    const file =
      new Blob(
        [excelBuffer],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      );

    saveAs(
      file,
      "REFERGO_Complete_Report.xlsx"
    );

    // =================================================
    // ACTIVITY LOG
    // =================================================

    await logReportExport(
      "Exported report as Excel: Complete Report."
    );
  } catch (error) {
    console.error(
      "EXPORT EXCEL ERROR:",
      error
    );
  }
};

// =====================================================
// EXPORT BUTTONS COMPONENT
// =====================================================

export default function ExportButtons({
  reportData = {},
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        variant="danger"
        icon={
          <FaFilePdf />
        }
        onClick={() =>
          exportPDF(reportData)
        }
      >
        Export PDF
      </Button>

      <Button
        variant="success"
        icon={
          <FaFileExcel />
        }
        onClick={() =>
          exportExcel(reportData)
        }
      >
        Export Excel
      </Button>
    </div>
  );
}