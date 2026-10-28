import { useState } from "react";
import { saveAs } from "file-saver";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";

import Button from "../common/Button";
import logo from "../../assets/peso-logo.png";
import { createActivityLog } from "../../services/activityLogApi";
import {
  buildPdf,
  buildWorkbookBytes,
  fileSafe,
} from "../../utils/reportExport";

function readUser() {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// The PDF needs the logo as image data.
async function loadLogo() {
  try {
    const response = await fetch(logo);
    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function logExport(user, activity) {
  try {
    await createActivityLog({
      user_id: user?.id || user?.user_id || null,
      username: user?.username || null,
      module: "Reports",
      activity,
      ip_address: null,
    });
  } catch (error) {
    // Logging must never stop an export.
    console.error("REPORT ACTIVITY LOG ERROR:", error);
  }
}

export default function ExportButtons({ report, periodLabel = "All dates" }) {
  const [busy, setBusy] = useState("");

  const run = async (kind) => {
    setBusy(kind);
    const user = readUser();
    const meta = {
      periodLabel,
      generatedAt: new Date(),
      generatedBy: user?.full_name || user?.username || "",
    };
    const name = `REFERGO_Report_${fileSafe(periodLabel)}`;

    try {
      if (kind === "pdf") {
        const doc = buildPdf(report, meta, await loadLogo());
        doc.save(`${name}.pdf`);
        await logExport(user, `Exported report as PDF (${periodLabel}).`);
      } else {
        const bytes = buildWorkbookBytes(report, meta);
        saveAs(
          new Blob([bytes], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
          `${name}.xlsx`
        );
        await logExport(user, `Exported report as Excel (${periodLabel}).`);
      }
    } catch (error) {
      console.error("EXPORT ERROR:", error);
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="danger"
        icon={<FaFilePdf />}
        disabled={Boolean(busy)}
        onClick={() => run("pdf")}
      >
        {busy === "pdf" ? "Preparing..." : "Export PDF"}
      </Button>
      <Button
        variant="success"
        icon={<FaFileExcel />}
        disabled={Boolean(busy)}
        onClick={() => run("excel")}
      >
        {busy === "excel" ? "Preparing..." : "Export Excel"}
      </Button>
    </div>
  );
}
