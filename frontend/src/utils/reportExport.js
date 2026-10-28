import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { zipSync, unzipSync, strToU8, strFromU8 } from "fflate";

import { calcAge } from "./period";
import { buildFindings } from "./reportMetrics";

// =====================================================
// SHARED
// =====================================================

const NAVY = [32, 40, 96];
const RED = [224, 24, 56];
const LIGHT = [244, 245, 250];
const GREY = [100, 106, 130];

const OFFICE = "PESO MENDEZ, CAVITE";
const OFFICE_SUB = "Public Employment Service Office";

const dash = (v) =>
  v === null || v === undefined || String(v).trim() === "" ? "-" : String(v);

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

const parseAny = (raw) => {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
};

const fmtDate = (raw) => {
  const d = parseAny(raw);
  return d
    ? d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "-";
};

const fmtMonth = (key) => {
  if (/^\d{4}-\d{2}$/.test(String(key))) {
    return new Date(`${key}-01T00:00:00`).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  }
  return dash(key);
};

const excelSerial = (raw) => {
  const d = parseAny(raw);
  if (!d) return "";
  return Math.round(
    (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(1899, 11, 30)) /
      86400000
  );
};

export const fileSafe = (text) =>
  String(text).replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "");

// Column definitions are written once and used by both PDF and Excel.
// type: text | center | int | date | pct     width: mm (PDF)   chars: Excel
export function getSections(report) {
  const ageText = (a) => {
    const age = calcAge(a.birthdate);
    return age === null ? "-" : String(age);
  };

  return [
    {
      key: "applicants",
      title: "Applicants",
      rows: report.applicantData,
      columns: [
        { h: "ID", w: 12, c: 8, t: "center", v: (r) => r.applicant_id },
        { h: "Full Name", w: 38, c: 26, t: "text", v: (r) => r.full_name },
        { h: "Gender", w: 16, c: 10, t: "center", v: (r) => r.gender },
        { h: "Age", w: 11, c: 6, t: "center", v: (r) => ageText(r) },
        { h: "Contact No.", w: 26, c: 16, t: "center", v: (r) => r.contact_number },
        { h: "Address", w: 46, c: 32, t: "text", v: (r) => r.address },
        { h: "Classification", w: 28, c: 18, t: "text", v: (r) => r.classification },
        { h: "Education", w: 34, c: 22, t: "text", v: (r) => r.education },
        { h: "Skills", w: 40, c: 30, t: "text", v: (r) => r.skills },
        { h: "Date Added", w: 22, c: 14, t: "date", v: (r) => r.date_added },
      ],
    },
    {
      key: "employers",
      title: "Employers",
      rows: report.employerData,
      columns: [
        { h: "ID", w: 12, c: 8, t: "center", v: (r) => r.employer_id },
        { h: "Company", w: 46, c: 28, t: "text", v: (r) => r.company_name },
        { h: "Address", w: 56, c: 34, t: "text", v: (r) => r.address },
        { h: "Contact Person", w: 36, c: 22, t: "text", v: (r) => r.contact_person },
        { h: "Contact No.", w: 28, c: 16, t: "center", v: (r) => r.contact_number },
        { h: "Email", w: 48, c: 30, t: "text", v: (r) => r.email },
        { h: "Reapply Cooldown (days)", w: 22, c: 14, t: "int", v: (r) => r.reapply_cooldown_days },
        { h: "Date Added", w: 25, c: 14, t: "date", v: (r) => r.date_added },
      ],
    },
    {
      key: "vacancies",
      title: "Job Vacancies",
      rows: report.vacancyData,
      columns: [
        { h: "ID", w: 12, c: 8, t: "center", v: (r) => r.vacancy_id },
        { h: "Position", w: 46, c: 28, t: "text", v: (r) => r.position_title },
        { h: "Employer", w: 44, c: 28, t: "text", v: (r) => r.company_name },
        { h: "Salary", w: 28, c: 16, t: "text", v: (r) => r.salary },
        { h: "Location", w: 36, c: 22, t: "text", v: (r) => r.location },
        { h: "Type", w: 28, c: 14, t: "center", v: (r) => r.employment_type },
        { h: "Openings", w: 18, c: 10, t: "int", v: (r) => r.openings },
        { h: "Deadline", w: 28, c: 14, t: "date", v: (r) => r.deadline },
        { h: "Status", w: 33, c: 12, t: "center", v: (r) => r.status },
      ],
    },
    {
      key: "referrals",
      title: "Referrals",
      rows: report.referralData,
      columns: [
        { h: "ID", w: 12, c: 8, t: "center", v: (r) => r.referral_id },
        { h: "Applicant", w: 40, c: 26, t: "text", v: (r) => r.full_name },
        { h: "Employer", w: 42, c: 28, t: "text", v: (r) => r.company_name },
        { h: "Position", w: 40, c: 26, t: "text", v: (r) => r.position_title },
        { h: "Date Referred", w: 26, c: 14, t: "date", v: (r) => r.date_referred },
        { h: "Interview Date", w: 26, c: 14, t: "date", v: (r) => r.interview_date },
        { h: "Status", w: 28, c: 16, t: "center", v: (r) => r.status },
        { h: "Result", w: 31, c: 18, t: "text", v: (r) => r.result },
        { h: "Reapply Eligible", w: 28, c: 14, t: "date", v: (r) => r.reapply_eligible_date },
      ],
    },
  ];
}

// Small analytic tables (summary page in PDF, one sheet each in Excel).
export function getAnalytics(report) {
  const total = report.referrals;
  return [
    {
      key: "status",
      title: "Referral Status",
      columns: [
        { h: "Status", c: 28, t: "text" },
        { h: "Total", c: 10, t: "int" },
        { h: "Share of Referrals (%)", c: 22, t: "pct" },
      ],
      rows: report.status.map((s) => [
        dash(s.status),
        num(s.total),
        total > 0 ? Number(((num(s.total) / total) * 100).toFixed(2)) : 0,
      ]),
    },
    {
      key: "monthly",
      title: "Monthly Referrals",
      columns: [
        { h: "Month", c: 20, t: "text" },
        { h: "Referred", c: 11, t: "int" },
        { h: "Interviewed", c: 12, t: "int" },
        { h: "Hired", c: 9, t: "int" },
        { h: "Rejected", c: 10, t: "int" },
        { h: "Pending", c: 10, t: "int" },
      ],
      rows: report.monthlyData.map((m) => [
        fmtMonth(m.month),
        num(m.total_referred),
        num(m.interviewed),
        num(m.hired),
        num(m.rejected),
        num(m.pending),
      ]),
    },
    {
      key: "positions",
      title: "Top Positions",
      columns: [
        { h: "Rank", c: 7, t: "center" },
        { h: "Position", c: 34, t: "text" },
        { h: "Referrals", c: 11, t: "int" },
        { h: "Hired", c: 9, t: "int" },
      ],
      rows: report.topPositions.map((p, i) => [
        i + 1,
        dash(p.position_title),
        num(p.total_referrals),
        num(p.hired),
      ]),
    },
    {
      key: "employers",
      title: "Top Employers",
      columns: [
        { h: "Rank", c: 7, t: "center" },
        { h: "Employer", c: 34, t: "text" },
        { h: "Referrals", c: 11, t: "int" },
        { h: "Hired", c: 9, t: "int" },
      ],
      rows: report.topEmployers.map((p, i) => [
        i + 1,
        dash(p.company_name),
        num(p.total_referrals),
        num(p.hired),
      ]),
    },
    {
      key: "gender",
      title: "Applicants by Gender",
      columns: [
        { h: "Gender", c: 20, t: "text" },
        { h: "Applicants", c: 12, t: "int" },
      ],
      rows: report.gender.map((g) => [g.name, g.value]),
    },
    {
      key: "age",
      title: "Applicants by Age Group",
      columns: [
        { h: "Age Group", c: 20, t: "text" },
        { h: "Applicants", c: 12, t: "int" },
      ],
      rows: report.ageGroups.map((g) => [g.name, g.value]),
    },
  ];
}

export function getKpis(report) {
  return [
    ["Applicants", report.applicants],
    ["Employers", report.employers],
    ["Job Vacancies", `${report.vacancies}  (${report.activeVacancies} active)`],
    ["Referrals", report.referrals],
    ["Hired", report.hired],
    ["Placement Rate", `${Number(report.placementRate || 0).toFixed(2)}%`],
  ];
}

// =====================================================
// PDF
// =====================================================

export function buildPdf(report, meta, logoDataUrl) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const sectionStarts = [];
  const startSection = (title) =>
    sectionStarts.push({ page: doc.getNumberOfPages(), title });

  const tableLook = {
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: 2.2,
      overflow: "linebreak",
      valign: "middle",
      lineWidth: 0.15,
      lineColor: [210, 214, 220],
      textColor: [40, 40, 40],
    },
    headStyles: {
      fillColor: NAVY,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      valign: "middle",
    },
    alternateRowStyles: { fillColor: LIGHT },
    rowPageBreak: "avoid",
    // Header text lines up with its column.
    didParseCell: (data) => {
      if (data.section === "head") {
        const align = data.table.settings.columnStyles?.[data.column.index]?.halign;
        data.cell.styles.halign = align || "left";
      }
    },
  };

  // ---------- Page 1: summary ----------
  startSection("Recruitment Report");
  const margin = 15;
  const pageW = 210;
  const inner = pageW - margin * 2;

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", margin, 12, 20, 20);
    } catch (e) {
      console.error("LOGO ERROR:", e);
    }
  }
  doc.setFont("helvetica", "bold").setFontSize(15).setTextColor(...NAVY);
  doc.text(OFFICE, margin + 25, 20);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...GREY);
  doc.text(OFFICE_SUB, margin + 25, 26);
  doc.text("REFERGO Employment Referral Management System", margin + 25, 31);

  doc.setDrawColor(...RED).setLineWidth(0.8).line(margin, 36, pageW - margin, 36);

  doc.setFillColor(...NAVY).rect(margin, 40, inner, 10, "F");
  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(255, 255, 255);
  doc.text("RECRUITMENT & REFERRAL REPORT", margin + 4, 46.5);
  doc.setFont("helvetica", "normal").setFontSize(9);
  doc.text(`Period: ${meta.periodLabel}`, pageW - margin - 4, 46.5, { align: "right" });

  doc.setFontSize(8).setTextColor(...GREY);
  doc.text(
    `Generated ${fmtDate(meta.generatedAt)}${meta.generatedBy ? ` by ${meta.generatedBy}` : ""}`,
    pageW - margin,
    55,
    { align: "right" }
  );

  // KPI tiles
  const kpis = getKpis(report);
  const tileW = (inner - 6) / 3;
  kpis.forEach(([label, value], i) => {
    const x = margin + (i % 3) * (tileW + 3);
    const y = 60 + Math.floor(i / 3) * 22;
    doc.setDrawColor(210, 214, 220).setLineWidth(0.3).setFillColor(255, 255, 255);
    doc.rect(x, y, tileW, 19, "FD");
    doc.setFillColor(...(i % 3 === 2 ? RED : NAVY)).rect(x, y, 1.6, 19, "F");
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...GREY);
    doc.text(label, x + 5, y + 6.5);
    doc.setFont("helvetica", "bold").setFontSize(String(value).length > 9 ? 11 : 16).setTextColor(...NAVY);
    doc.text(String(value), x + 5, y + 15);
  });

  // Key findings
  let y = 108;
  doc.setFont("helvetica", "bold").setFontSize(10.5).setTextColor(...NAVY);
  doc.text("Key findings", margin, y);
  doc.setDrawColor(...NAVY).setLineWidth(0.3).line(margin, y + 1.5, pageW - margin, y + 1.5);
  y += 7;
  doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(40, 40, 40);
  buildFindings(report, meta.periodLabel).forEach((line) => {
    const wrapped = doc.splitTextToSize(line, inner - 6);
    doc.setFillColor(...RED).rect(margin, y - 2.4, 1.8, 1.8, "F");
    doc.text(wrapped, margin + 5, y);
    y += wrapped.length * 4.2 + 1.6;
  });
  y += 3;

  // Analytic tables, two per row where short
  const tableTitle = (text, yy) => {
    doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(...NAVY);
    doc.text(text, margin, yy);
  };

  const analytics = getAnalytics(report);

  analytics.forEach((tbl) => {
    if (y > 297 - 55) {
      doc.addPage("a4", "portrait");
      y = 28;
    }
    tableTitle(tbl.title, y);

    const right = ["int", "pct", "center"];
    autoTable(doc, {
      ...tableLook,
      startY: y + 2.5,
      margin: { left: margin, right: margin, top: 26, bottom: 16 },
      tableWidth: tbl.columns.length <= 3 ? 110 : inner,
      head: [tbl.columns.map((c) => c.h)],
      body: tbl.rows.length
        ? tbl.rows.map((r) =>
            r.map((cell, i) =>
              tbl.columns[i].t === "pct" ? `${Number(cell).toFixed(2)}%` : cell
            )
          )
        : [[{ content: "No data for this selection.", colSpan: tbl.columns.length, styles: { halign: "center", textColor: GREY } }]],
      columnStyles: Object.fromEntries(
        tbl.columns.map((c, i) => [i, { halign: right.includes(c.t) ? "center" : "left" }])
      ),
    });
    y = doc.lastAutoTable.finalY + 9;
  });

  // ---------- Data sections (landscape) ----------
  getSections(report).forEach((section) => {
    doc.addPage("a4", "landscape");
    startSection(section.title);

    doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(...NAVY);
    doc.text(section.title, 12, 28);
    doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(...GREY);
    doc.text(
      `${section.rows.length} record${section.rows.length === 1 ? "" : "s"}  |  ${meta.periodLabel}`,
      285,
      28,
      { align: "right" }
    );

    const center = ["center", "int", "date"];
    autoTable(doc, {
      ...tableLook,
      startY: 31,
      margin: { left: 12, right: 12, top: 26, bottom: 16 },
      tableWidth: 273,
      head: [section.columns.map((c) => c.h)],
      body: section.rows.length
        ? section.rows.map((row) =>
            section.columns.map((c) => {
              const value = c.v(row);
              return c.t === "date" ? fmtDate(value) : dash(value);
            })
          )
        : [[{ content: "No records found for this selection.", colSpan: section.columns.length, styles: { halign: "center", textColor: GREY } }]],
      columnStyles: Object.fromEntries(
        section.columns.map((c, i) => [
          i,
          { cellWidth: c.w, halign: center.includes(c.t) ? "center" : "left" },
        ])
      ),
    });
  });

  // ---------- Running header and footer on every page ----------
  const total = doc.getNumberOfPages();

  for (let page = 1; page <= total; page++) {
    doc.setPage(page);
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    const m = page === 1 || w < 220 ? 15 : 12;
    const owner = [...sectionStarts].reverse().find((s) => s.page <= page);

    if (page > 1) {
      if (logoDataUrl) {
        try {
          doc.addImage(logoDataUrl, "PNG", m, 7, 10, 10);
        } catch {
          // logo is optional
        }
      }
      doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...NAVY);
      doc.text(OFFICE, m + 13, 11.5);
      doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(...GREY);
      doc.text("REFERGO Report", m + 13, 15.5);
      doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...NAVY);
      doc.text(owner ? owner.title : "", w - m, 12, { align: "right" });
      doc.setDrawColor(...RED).setLineWidth(0.6).line(m, 19.5, w - m, 19.5);
    }

    doc.setDrawColor(210, 214, 220).setLineWidth(0.2).line(m, h - 12, w - m, h - 12);
    doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(...GREY);
    doc.text("REFERGO - PESO Mendez, Cavite", m, h - 7.5);
    doc.text(meta.periodLabel, w / 2, h - 7.5, { align: "center" });
    doc.text(`Page ${page} of ${total}`, w - m, h - 7.5, { align: "right" });
  }

  doc.setTextColor(0, 0, 0);
  return doc;
}

// =====================================================
// EXCEL
// =====================================================
// The free SheetJS build cannot style cells, so after writing the workbook the
// styles and sheet settings are added directly to the .xlsx package.

const S = { DEFAULT: 0, HEADER: 1, OFFICE: 2, TITLE: 3, META: 4, TEXT: 5, CENTER: 6, INT: 7, DATE: 8, PCT: 9, TOTAL: 10 };

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="2"><numFmt numFmtId="164" formatCode="dd\\-mmm\\-yyyy"/><numFmt numFmtId="165" formatCode="0.00&quot;%&quot;"/></numFmts>
<fonts count="6">
<font><sz val="10"/><name val="Calibri"/></font>
<font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
<font><b/><sz val="15"/><color rgb="FF202860"/><name val="Calibri"/></font>
<font><b/><sz val="12"/><color rgb="FFE01838"/><name val="Calibri"/></font>
<font><i/><sz val="9"/><color rgb="FF646A82"/><name val="Calibri"/></font>
<font><b/><sz val="10"/><color rgb="FF202860"/><name val="Calibri"/></font>
</fonts>
<fills count="4">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF202860"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFF4F5FA"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="2">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border><left style="thin"><color rgb="FFD2D6DC"/></left><right style="thin"><color rgb="FFD2D6DC"/></right><top style="thin"><color rgb="FFD2D6DC"/></top><bottom style="thin"><color rgb="FFD2D6DC"/></bottom><diagonal/></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="11">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top" wrapText="1"/></xf>
<xf numFmtId="3" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf>
<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf>
<xf numFmtId="165" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf>
<xf numFmtId="0" fontId="5" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

const colIndex = (letters) =>
  letters.split("").reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;

const TYPE_STYLE = { text: S.TEXT, center: S.CENTER, int: S.INT, date: S.DATE, pct: S.PCT };

const HEADER_ROW = 5;

function makeSheet({ title, columns, rows, noTotal }, meta) {
  const cols = columns.length;
  const aoa = [
    [OFFICE],
    [title],
    [`${OFFICE_SUB}   |   Period: ${meta.periodLabel}   |   Generated: ${fmtDate(meta.generatedAt)}${meta.generatedBy ? ` by ${meta.generatedBy}` : ""}`],
    [],
    columns.map((c) => c.h),
    ...rows,
  ];
  const lastData = HEADER_ROW + rows.length;
  const totalRow = lastData + 2;
  if (!noTotal) {
    aoa.push([]);
    aoa.push(["Total records", rows.length]);
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = columns.map((c) => ({ wch: c.c }));
  ws["!rows"] = [{ hpt: 22 }, { hpt: 20 }, { hpt: 15 }, { hpt: 8 }, { hpt: 28 }];
  if (cols > 1) {
    ws["!merges"] = [0, 1, 2].map((r) => ({ s: { r, c: 0 }, e: { r, c: cols - 1 } }));
  }
  if (rows.length) {
    ws["!autofilter"] = { ref: `A${HEADER_ROW}:${XLSX.utils.encode_col(cols - 1)}${lastData}` };
  }

  return { ws, info: { columns, lastData, totalRow } };
}

export function buildWorkbookBytes(report, meta) {
  const wb = XLSX.utils.book_new();
  const infos = [];

  const add = (name, def) => {
    const { ws, info } = makeSheet(def, meta);
    XLSX.utils.book_append_sheet(wb, ws, name);
    infos.push(info);
  };

  // Summary
  add("Summary", {
    title: "Recruitment & Referral Summary",
    noTotal: true,
    columns: [
      { h: "Metric", c: 34, t: "text" },
      { h: "Total", c: 16, t: "int" },
    ],
    rows: [
      ["Applicants", report.applicants],
      ["Employers", report.employers],
      ["Job Vacancies", report.vacancies],
      ["Active Job Vacancies", report.activeVacancies],
      ["Referrals", report.referrals],
      ["Interviewed", report.interviewed],
      ["Hired", report.hired],
      ["Rejected", report.rejected],
      ["Pending", report.pending],
      ["Placement Rate (%)", report.placementRate],
    ],
  });
  // Placement rate shown as a percentage
  infos[0].pctRows = [HEADER_ROW + 10];

  add("Key Findings", {
    title: "Key Findings",
    noTotal: true,
    columns: [{ h: "Finding", c: 120, t: "text" }],
    rows: buildFindings(report, meta.periodLabel).map((f) => [f]),
  });

  getAnalytics(report).forEach((a) => {
    add(a.title.replace("Applicants by ", "").replace("Referral Status", "Referral Status").slice(0, 31), a);
  });

  getSections(report).forEach((s) => {
    add(s.title, {
      title: `${s.title} Report`,
      columns: s.columns.map((c) => ({ h: c.h, c: c.c, t: c.t })),
      rows: s.rows.map((row) =>
        s.columns.map((c) => {
          const value = c.v(row);
          if (c.t === "date") return excelSerial(value);
          if (c.t === "int") return value === null || value === undefined || value === "" ? "" : num(value);
          return value === null || value === undefined ? "" : value;
        })
      ),
    });
  });

  const raw = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const files = unzipSync(new Uint8Array(raw));

  files["xl/styles.xml"] = strToU8(STYLES_XML);

  infos.forEach((info, i) => {
    const path = `xl/worksheets/sheet${i + 1}.xml`;
    let xml = strFromU8(files[path]);

    // Cell styles
    xml = xml.replace(/<c r="([A-Z]+)(\d+)"([^>]*?)(\/?)>/g, (match, letters, rowStr, attrs, selfClose) => {
      const row = Number(rowStr);
      const col = colIndex(letters);
      let style = S.DEFAULT;

      if (row === 1) style = S.OFFICE;
      else if (row === 2) style = S.TITLE;
      else if (row === 3) style = S.META;
      else if (row === HEADER_ROW) style = S.HEADER;
      else if (row > HEADER_ROW && row <= info.lastData) {
        const t = info.columns[col]?.t || "text";
        style = info.pctRows?.includes(row) && col === 1 ? S.PCT : TYPE_STYLE[t];
      } else if (row === info.totalRow) style = S.TOTAL;

      const cleaned = attrs.replace(/\ss="\d+"/, "");
      return `<c r="${letters}${rowStr}"${cleaned} s="${style}"${selfClose}>`;
    });

    // Hide gridlines, freeze the header, fit to one page wide, landscape.
    const view = `<sheetViews><sheetView showGridLines="0" workbookViewId="0"><pane ySplit="${HEADER_ROW}" topLeftCell="A${HEADER_ROW + 1}" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft"/></sheetView></sheetViews>`;
    if (/<sheetViews>[\s\S]*?<\/sheetViews>/.test(xml)) {
      xml = xml.replace(/<sheetViews>[\s\S]*?<\/sheetViews>/, view);
    } else {
      xml = xml.replace(/(<dimension[^>]*\/>)/, `$1${view}`);
    }

    xml = xml.replace(/<sheetPr[^>]*\/>|<sheetPr[^>]*>[\s\S]*?<\/sheetPr>/, "");
    xml = xml.replace(/(<worksheet[^>]*>)/, `$1<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>`);

    xml = xml.replace(/<pageSetup[^>]*\/>/, "");
    xml = xml.replace(
      /(<pageMargins[^>]*\/>)/,
      `$1<pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/><headerFooter><oddFooter>&amp;LREFERGO - PESO Mendez, Cavite&amp;RPage &amp;P of &amp;N</oddFooter></headerFooter>`
    );

    files[path] = strToU8(xml);
  });

  return zipSync(files);
}
