// LocalStorage-backed store for "CBTT định kỳ" reports (mock backend).

export type Period = "QUY" | "BAN_NIEN" | "NAM";
export type Status = "Nháp" | "Chờ duyệt" | "Đã công bố";

export const PERIOD_LABEL: Record<Period, string> = {
  QUY: "Theo quý",
  BAN_NIEN: "6 tháng đầu năm",
  NAM: "Theo năm",
};

export const NEWS_TYPES_BY_PERIOD: Record<Period, string[]> = {
  QUY: ["Báo cáo tài chính"],
  BAN_NIEN: [
    "Báo cáo tài chính bán niên",
    "Báo cáo tỷ lệ an toàn tài chính tại ngày 30/6",
    "Báo cáo tình hình quản trị công ty bán niên",
  ],
  NAM: [
    "Báo cáo tài chính",
    "Báo cáo tỷ lệ an toàn tài chính tại ngày 31/12",
    "Báo cáo tình hình quản trị công ty năm",
    "Báo cáo thường niên",
  ],
};

export type ReportSectionKey =
  | "balanceSheet"
  | "incomeStatement"
  | "cashFlow"
  | "profitExplanation";

export const SECTION_LABEL: Record<ReportSectionKey, string> = {
  balanceSheet: "Bảng cân đối kế toán",
  incomeStatement: "Báo cáo kết quả hoạt động kinh doanh",
  cashFlow: "Báo cáo lưu chuyển tiền tệ",
  profitExplanation: "Giải trình lợi nhuận sau thuế",
};

export type ReportSection = { content: string };

export type CbttReport = {
  id: string;
  period: Period;
  newsType: string;
  title: string;
  fiscalYear: number;
  quarter?: 1 | 2 | 3 | 4;
  issuedAt: string; // ISO date
  note?: string;
  sections: Partial<Record<ReportSectionKey, ReportSection>>;
  status: Status;
  createdAt: string; // ISO datetime
  createdBy: string;
};

const KEY = "cbtt-dinh-ky";

function read(): CbttReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    return JSON.parse(raw) as CbttReport[];
  } catch {
    return [];
  }
}

function write(list: CbttReport[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

function seed(): CbttReport[] {
  const sample: CbttReport[] = [
    {
      id: crypto.randomUUID(),
      period: "QUY",
      newsType: "Báo cáo tài chính quý",
      title: "Báo cáo tài chính Q1/2026",
      fiscalYear: 2026,
      quarter: 1,
      issuedAt: new Date(2026, 3, 20).toISOString(),
      note: "Đã ký số",
      sections: {},
      status: "Nháp",
      createdAt: new Date(2026, 4, 8, 9, 30).toISOString(),
      createdBy: "Nguyễn Văn A",
    },
    {
      id: crypto.randomUUID(),
      period: "NAM",
      newsType: "Báo cáo thường niên",
      title: "Báo cáo thường niên 2025",
      fiscalYear: 2025,
      issuedAt: new Date(2026, 2, 31).toISOString(),
      note: "",
      sections: {},
      status: "Đã công bố",
      createdAt: new Date(2026, 3, 2, 14, 5).toISOString(),
      createdBy: "Trần Thị B",
    },
  ];
  write(sample);
  return sample;
}

export function listReports(): CbttReport[] {
  return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getReport(id: string): CbttReport | undefined {
  return read().find((r) => r.id === id);
}

export function createReport(
  data: Omit<CbttReport, "id" | "createdAt" | "createdBy">,
): CbttReport {
  const list = read();
  const item: CbttReport = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    createdBy: "Người dùng hiện tại",
  };
  list.push(item);
  write(list);
  return item;
}

export function updateReport(id: string, patch: Partial<CbttReport>): CbttReport | undefined {
  const list = read();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  list[idx] = { ...list[idx], ...patch, id };
  write(list);
  return list[idx];
}

export function deleteReport(id: string) {
  write(read().filter((r) => r.id !== id));
}
