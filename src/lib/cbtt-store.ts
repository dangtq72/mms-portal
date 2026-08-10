// LocalStorage-backed store for "CBTT định kỳ" reports (mock backend).

export type Period = "QUY" | "BAN_NIEN" | "NAM";
export type Status =
  | "Nháp"
  | "Chờ kiểm tra"
  | "Chờ VNX duyệt"
  | "Chuyên viên từ chối"
  | "VNX từ chối"
  | "Đã công bố";

export const ALL_STATUSES: Status[] = [
  "Nháp",
  "Chờ kiểm tra",
  "Chờ VNX duyệt",
  "Chuyên viên từ chối",
  "VNX từ chối",
  "Đã công bố",
];

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

const KEY = "cbtt-dinh-ky-v2";

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

type SeedRow = {
  period: Period;
  newsType: string;
  title: string;
  fiscalYear: number;
  quarter?: 1 | 2 | 3 | 4;
  status: Status;
  createdBy: string;
  note?: string;
  createdAt: [number, number, number, number, number];
};

const SEED_ROWS: SeedRow[] = [
  { period: "QUY", newsType: "Báo cáo tài chính", title: "Báo cáo tài chính Quý 1 năm 2026", fiscalYear: 2026, quarter: 1, status: "Chờ kiểm tra", createdBy: "Nguyễn Văn A", note: "Chờ chuyên viên kiểm tra", createdAt: [2026, 3, 5, 9, 15] },
  { period: "QUY", newsType: "Báo cáo tài chính", title: "Báo cáo tài chính Quý 2 năm 2026", fiscalYear: 2026, quarter: 2, status: "Chờ kiểm tra", createdBy: "Nguyễn Văn A", createdAt: [2026, 6, 8, 10, 40] },
  { period: "BAN_NIEN", newsType: "Báo cáo tài chính bán niên", title: "Báo cáo tài chính bán niên năm 2026", fiscalYear: 2026, status: "Nháp", createdBy: "Lê Thị Hoa", createdAt: [2026, 7, 12, 14, 5] },
  { period: "QUY", newsType: "Báo cáo tài chính", title: "Báo cáo tài chính Quý 3 năm 2025", fiscalYear: 2025, quarter: 3, status: "Chờ VNX duyệt", createdBy: "Trần Thị B", note: "Đã qua kiểm tra", createdAt: [2025, 9, 18, 8, 30] },
  { period: "NAM", newsType: "Báo cáo tỷ lệ an toàn tài chính tại ngày 31/12", title: "Báo cáo tỷ lệ an toàn tài chính tại ngày 31/12 năm 2025", fiscalYear: 2025, status: "Chờ VNX duyệt", createdBy: "Trần Thị B", createdAt: [2026, 1, 20, 11, 0] },
  { period: "BAN_NIEN", newsType: "Báo cáo tình hình quản trị công ty bán niên", title: "Báo cáo tình hình quản trị công ty bán niên năm 2025", fiscalYear: 2025, status: "Chờ VNX duyệt", createdBy: "Phạm Minh", createdAt: [2025, 7, 25, 16, 20] },
  { period: "QUY", newsType: "Báo cáo tài chính", title: "Báo cáo tài chính Quý 4 năm 2025", fiscalYear: 2025, quarter: 4, status: "Chuyên viên từ chối", createdBy: "Nguyễn Văn A", note: "Thiếu thuyết minh BCTC", createdAt: [2026, 0, 15, 9, 45] },
  { period: "QUY", newsType: "Báo cáo tài chính", title: "Báo cáo tài chính Quý 2 năm 2025", fiscalYear: 2025, quarter: 2, status: "Chuyên viên từ chối", createdBy: "Lê Thị Hoa", note: "Sai số liệu lợi nhuận", createdAt: [2025, 6, 22, 13, 10] },
  { period: "BAN_NIEN", newsType: "Báo cáo tỷ lệ an toàn tài chính tại ngày 30/6", title: "Báo cáo tỷ lệ an toàn tài chính tại ngày 30/6 năm 2025", fiscalYear: 2025, status: "Chuyên viên từ chối", createdBy: "Phạm Minh", note: "Thiếu chữ ký số", createdAt: [2025, 7, 2, 15, 35] },
  { period: "NAM", newsType: "Báo cáo thường niên", title: "Báo cáo thường niên năm 2024", fiscalYear: 2024, status: "VNX từ chối", createdBy: "Trần Thị B", note: "Nội dung chưa đầy đủ theo mẫu", createdAt: [2025, 2, 28, 10, 5] },
  { period: "NAM", newsType: "Báo cáo tình hình quản trị công ty năm", title: "Báo cáo tình hình quản trị công ty năm 2024", fiscalYear: 2024, status: "VNX từ chối", createdBy: "Nguyễn Văn A", note: "Đề nghị giải trình bổ sung", createdAt: [2025, 1, 14, 9, 25] },
  { period: "QUY", newsType: "Báo cáo tài chính", title: "Báo cáo tài chính Quý 1 năm 2025", fiscalYear: 2025, quarter: 1, status: "Đã công bố", createdBy: "Nguyễn Văn A", createdAt: [2025, 3, 18, 8, 50] },
  { period: "BAN_NIEN", newsType: "Báo cáo tài chính bán niên", title: "Báo cáo tài chính bán niên năm 2025", fiscalYear: 2025, status: "Đã công bố", createdBy: "Lê Thị Hoa", createdAt: [2025, 7, 14, 11, 30] },
  { period: "NAM", newsType: "Báo cáo tài chính", title: "Báo cáo tài chính năm 2024", fiscalYear: 2024, status: "Đã công bố", createdBy: "Trần Thị B", note: "Đã ký số", createdAt: [2025, 2, 20, 14, 45] },
  { period: "NAM", newsType: "Báo cáo thường niên", title: "Báo cáo thường niên năm 2025", fiscalYear: 2025, status: "Đã công bố", createdBy: "Phạm Minh", createdAt: [2026, 2, 31, 17, 0] },
];

function seed(): CbttReport[] {
  const sample: CbttReport[] = SEED_ROWS.map((r) => {
    const [y, m, d, hh, mm] = r.createdAt;
    return {
      id: crypto.randomUUID(),
      period: r.period,
      newsType: r.newsType,
      title: r.title,
      fiscalYear: r.fiscalYear,
      quarter: r.quarter,
      issuedAt: new Date(y, m, d).toISOString(),
      note: r.note ?? "",
      sections: {},
      status: r.status,
      createdAt: new Date(y, m, d, hh, mm).toISOString(),
      createdBy: r.createdBy,
    };
  });
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
