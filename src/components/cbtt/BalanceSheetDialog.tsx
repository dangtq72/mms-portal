import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * Bảng tình hình tài chính (Bảng cân đối kế toán) — Mẫu số B01-CTCK
 * Ban hành theo Thông tư số 334/2016/TT-BTC ngày 27/12/2016 của Bộ Tài chính
 * sửa đổi, bổ sung Thông tư 210/2014/TT-BTC — áp dụng cho công ty chứng khoán.
 *
 * Cấu trúc 2 phần: TÀI SẢN và NGUỒN VỐN; mỗi dòng có Mã số, Chỉ tiêu,
 * Số cuối kỳ và Số đầu năm. Các dòng tổng (isTotal) tự cộng từ parents.
 */

type Row = {
  code: string;
  label: string;
  level: 0 | 1 | 2 | 3; // 0 = nhóm A/B/C/D, 1 = La Mã, 2 = mục, 3 = tiểu mục
  current?: number | "";
  prior?: number | "";
  note?: string;
  isTotal?: boolean;
  parents?: string[];
};

const ASSET_TEMPLATE: Row[] = [
  { code: "100", label: "A. TÀI SẢN NGẮN HẠN", level: 0, isTotal: true, parents: ["110", "130"] },
  { code: "110", label: "I. Tài sản tài chính ngắn hạn", level: 1 },
  { code: "111", label: "1. Tiền và các khoản tương đương tiền", level: 2 },
  { code: "111.1", label: "1.1. Tiền", level: 3 },
  { code: "111.2", label: "1.2. Các khoản tương đương tiền", level: 3 },
  { code: "112", label: "2. Các tài sản tài chính ghi nhận thông qua lãi/lỗ (FVTPL)", level: 2 },
  { code: "113", label: "3. Các khoản đầu tư nắm giữ đến ngày đáo hạn (HTM)", level: 2 },
  { code: "114", label: "4. Các khoản cho vay", level: 2 },
  { code: "115", label: "5. Tài sản tài chính sẵn sàng để bán (AFS)", level: 2 },
  { code: "116", label: "6. Dự phòng suy giảm giá trị các tài sản tài chính và tài sản thế chấp", level: 2 },
  { code: "117", label: "7. Các khoản phải thu", level: 2 },
  { code: "118", label: "8. Trả trước cho người bán", level: 2 },
  { code: "119", label: "9. Phải thu các dịch vụ CTCK cung cấp", level: 2 },
  { code: "120", label: "10. Phải thu nội bộ", level: 2 },
  { code: "121", label: "11. Phải thu về lỗi giao dịch chứng khoán", level: 2 },
  { code: "122", label: "12. Các khoản phải thu khác", level: 2 },
  { code: "129", label: "13. Dự phòng suy giảm giá trị các khoản phải thu (*)", level: 2 },
  { code: "130", label: "II. Tài sản ngắn hạn khác", level: 1 },
  { code: "131", label: "1. Tạm ứng", level: 2 },
  { code: "132", label: "2. Vật tư văn phòng, công cụ, dụng cụ", level: 2 },
  { code: "133", label: "3. Chi phí trả trước ngắn hạn", level: 2 },
  { code: "134", label: "4. Cầm cố, thế chấp, ký quỹ, ký cược ngắn hạn", level: 2 },
  { code: "135", label: "5. Thuế giá trị gia tăng được khấu trừ", level: 2 },
  { code: "136", label: "6. Thuế và các khoản phải thu Nhà nước", level: 2 },
  { code: "139", label: "7. Tài sản ngắn hạn khác", level: 2 },

  { code: "200", label: "B. TÀI SẢN DÀI HẠN", level: 0, isTotal: true, parents: ["210", "220", "230", "240", "250", "260"] },
  { code: "210", label: "I. Các khoản phải thu dài hạn", level: 1 },
  { code: "211", label: "1. Phải thu dài hạn", level: 2 },
  { code: "212", label: "2. Vốn kinh doanh ở đơn vị trực thuộc", level: 2 },
  { code: "213", label: "3. Đầu tư dài hạn", level: 2 },
  { code: "214", label: "4. Dự phòng suy giảm giá trị các khoản phải thu dài hạn (*)", level: 2 },
  { code: "220", label: "II. Tài sản cố định", level: 1 },
  { code: "221", label: "1. Tài sản cố định hữu hình", level: 2 },
  { code: "222", label: "- Nguyên giá", level: 3 },
  { code: "223a", label: "- Giá trị hao mòn lũy kế (*)", level: 3 },
  { code: "223b", label: "- Đánh giá TSCĐHH theo giá trị hợp lý", level: 3 },
  { code: "224", label: "2. Tài sản cố định thuê tài chính", level: 2 },
  { code: "227", label: "3. Tài sản cố định vô hình", level: 2 },
  { code: "230", label: "III. Bất động sản đầu tư", level: 1 },
  { code: "240", label: "IV. Chi phí xây dựng cơ bản dở dang", level: 1 },
  { code: "250", label: "V. Tài sản dài hạn khác", level: 1 },
  { code: "251", label: "1. Cầm cố, thế chấp, ký quỹ, ký cược dài hạn", level: 2 },
  { code: "252", label: "2. Chi phí trả trước dài hạn", level: 2 },
  { code: "253", label: "3. Tài sản thuế thu nhập hoãn lại", level: 2 },
  { code: "254", label: "4. Tiền nộp Quỹ Hỗ trợ thanh toán", level: 2 },
  { code: "255", label: "5. Tài sản dài hạn khác", level: 2 },
  { code: "256", label: "6. Lợi thế thương mại", level: 2 },
  { code: "260", label: "VI. Dự phòng suy giảm giá trị tài sản dài hạn (*)", level: 1 },

  { code: "270", label: "TỔNG CỘNG TÀI SẢN", level: 0, isTotal: true, parents: ["100", "200"] },
];

const EQUITY_TEMPLATE: Row[] = [
  { code: "300", label: "C. NỢ PHẢI TRẢ", level: 0, isTotal: true, parents: ["310", "340"] },
  { code: "310", label: "I. Nợ phải trả ngắn hạn", level: 1 },
  { code: "311", label: "1. Vay và nợ thuê tài sản tài chính ngắn hạn", level: 2 },
  { code: "312", label: "2. Vay tài sản tài chính ngắn hạn", level: 2 },
  { code: "313", label: "3. Trái phiếu chuyển đổi ngắn hạn - Cấu phần nợ", level: 2 },
  { code: "314", label: "4. Trái phiếu phát hành ngắn hạn", level: 2 },
  { code: "315", label: "5. Vay Quỹ Hỗ trợ thanh toán", level: 2 },
  { code: "316", label: "6. Phải trả hoạt động giao dịch chứng khoán", level: 2 },
  { code: "318", label: "7. Phải trả về chứng khoán", level: 2 },
  { code: "319", label: "8. Phải trả về lỗi giao dịch các tài sản tài chính", level: 2 },
  { code: "320", label: "9. Phải trả người bán ngắn hạn", level: 2 },
  { code: "321", label: "10. Người mua trả tiền trước ngắn hạn", level: 2 },
  { code: "322", label: "11. Thuế và các khoản phải nộp Nhà nước", level: 2 },
  { code: "323", label: "12. Phải trả người lao động", level: 2 },
  { code: "324", label: "13. Các khoản trích nộp phúc lợi nhân viên", level: 2 },
  { code: "325", label: "14. Chi phí phải trả ngắn hạn", level: 2 },
  { code: "326", label: "15. Phải trả nội bộ ngắn hạn", level: 2 },
  { code: "327", label: "16. Doanh thu chưa thực hiện ngắn hạn", level: 2 },
  { code: "328", label: "17. Nhận ký quỹ, ký cược ngắn hạn", level: 2 },
  { code: "329", label: "18. Các khoản phải trả, phải nộp khác ngắn hạn", level: 2 },
  { code: "330", label: "19. Dự phòng phải trả ngắn hạn", level: 2 },
  { code: "331", label: "20. Quỹ khen thưởng, phúc lợi", level: 2 },
  { code: "332", label: "21. Giao dịch mua bán lại trái phiếu Chính phủ", level: 2 },

  { code: "340", label: "II. Nợ phải trả dài hạn", level: 1 },
  { code: "341", label: "1. Vay và nợ thuê tài sản tài chính dài hạn", level: 2 },
  { code: "344", label: "2. Vay tài sản tài chính dài hạn", level: 2 },
  { code: "345", label: "3. Trái phiếu chuyển đổi dài hạn - Cấu phần nợ", level: 2 },
  { code: "346", label: "4. Trái phiếu phát hành dài hạn", level: 2 },
  { code: "347", label: "5. Phải trả người bán dài hạn", level: 2 },
  { code: "348", label: "6. Người mua trả tiền trước dài hạn", level: 2 },
  { code: "349", label: "7. Chi phí phải trả dài hạn", level: 2 },
  { code: "350", label: "8. Phải trả nội bộ dài hạn", level: 2 },
  { code: "351", label: "9. Doanh thu chưa thực hiện dài hạn", level: 2 },
  { code: "352", label: "10. Nhận ký quỹ, ký cược dài hạn", level: 2 },
  { code: "353", label: "11. Các khoản phải trả, phải nộp khác dài hạn", level: 2 },
  { code: "354", label: "12. Dự phòng phải trả dài hạn", level: 2 },
  { code: "355", label: "13. Quỹ bảo vệ Nhà đầu tư", level: 2 },
  { code: "356", label: "14. Thuế thu nhập hoãn lại phải trả", level: 2 },
  { code: "357", label: "15. Quỹ phát triển khoa học và công nghệ", level: 2 },

  { code: "400", label: "D. VỐN CHỦ SỞ HỮU", level: 0, isTotal: true, parents: ["410", "420"] },
  { code: "410", label: "I. Vốn chủ sở hữu", level: 1 },
  { code: "411", label: "1. Vốn đầu tư của chủ sở hữu", level: 2 },
  { code: "411.1", label: "1.1. Vốn góp của chủ sở hữu", level: 3 },
  { code: "411.2", label: "1.2. Thặng dư vốn cổ phần", level: 3 },
  { code: "411.3", label: "1.3. Quyền chọn chuyển đổi trái phiếu - Cấu phần vốn", level: 3 },
  { code: "411.4", label: "1.4. Vốn khác của chủ sở hữu", level: 3 },
  { code: "412", label: "2. Cổ phiếu quỹ (*)", level: 2 },
  { code: "413", label: "3. Chênh lệch đánh giá tài sản theo giá trị hợp lý", level: 2 },
  { code: "414", label: "4. Chênh lệch tỷ giá hối đoái", level: 2 },
  { code: "415", label: "5. Quỹ dự trữ bổ sung vốn điều lệ", level: 2 },
  { code: "416", label: "6. Quỹ dự phòng tài chính và rủi ro nghiệp vụ", level: 2 },
  { code: "417", label: "7. Các Quỹ khác thuộc vốn chủ sở hữu", level: 2 },
  { code: "418", label: "8. Lợi nhuận chưa phân phối", level: 2 },
  { code: "418.1", label: "8.1. Lợi nhuận đã thực hiện", level: 3 },
  { code: "418.2", label: "8.2. Lợi nhuận chưa thực hiện", level: 3 },
  { code: "419", label: "9. Lợi ích cổ đông không kiểm soát", level: 2 },
  { code: "420", label: "II. Nguồn kinh phí và quỹ khác", level: 1 },

  { code: "440", label: "TỔNG CỘNG NGUỒN VỐN", level: 0, isTotal: true, parents: ["300", "400"] },
];

type BalanceSheetData = {
  unit: string;
  currentLabel: string;
  priorLabel: string;
  assets: Row[];
  equity: Row[];
  note: string;
};

function defaultData(): BalanceSheetData {
  return {
    unit: "VND",
    currentLabel: "Số cuối kỳ",
    priorLabel: "Số đầu năm",
    assets: ASSET_TEMPLATE.map((r) => ({ ...r })),
    equity: EQUITY_TEMPLATE.map((r) => ({ ...r })),
    note: "",
  };
}

function tryParse(content?: string): BalanceSheetData {
  if (!content) return defaultData();
  try {
    const parsed = JSON.parse(content);
    if (parsed && Array.isArray(parsed.assets) && Array.isArray(parsed.equity)) {
      return {
        ...defaultData(),
        ...parsed,
        assets: mergeRows(ASSET_TEMPLATE, parsed.assets),
        equity: mergeRows(EQUITY_TEMPLATE, parsed.equity),
      };
    }
  } catch {
    /* ignore */
  }
  return defaultData();
}

function mergeRows(template: Row[], saved: Row[]): Row[] {
  const map = new Map(saved.map((r) => [r.code, r]));
  return template.map((t) => {
    const s = map.get(t.code);
    return s ? { ...t, current: s.current ?? "", prior: s.prior ?? "", note: s.note ?? "" } : { ...t };
  });
}

function num(v: number | "" | undefined): number {
  return typeof v === "number" && !isNaN(v) ? v : 0;
}

function computeTotals(rows: Row[]): Row[] {
  const map = new Map(rows.map((r) => [r.code, r]));
  return rows.map((r) => {
    if (!r.isTotal || !r.parents) return r;
    const cur = r.parents.reduce((s, p) => s + num(map.get(p)?.current), 0);
    const pri = r.parents.reduce((s, p) => s + num(map.get(p)?.prior), 0);
    return { ...r, current: cur, prior: pri };
  });
}

function formatVN(v: number | "" | undefined): string {
  if (v === "" || v === undefined || v === null) return "";
  if (typeof v !== "number" || isNaN(v)) return "";
  return v.toLocaleString("vi-VN");
}

function parseInput(s: string): number | "" {
  const cleaned = s.replace(/[^\d-]/g, "");
  if (!cleaned || cleaned === "-") return "";
  const n = Number(cleaned);
  return isNaN(n) ? "" : n;
}

export function BalanceSheetDialog({
  open,
  onOpenChange,
  initialContent,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialContent?: string;
  onSave: (content: string) => void;
}) {
  const [data, setData] = useState<BalanceSheetData>(() => tryParse(initialContent));

  useEffect(() => {
    if (open) setData(tryParse(initialContent));
  }, [open, initialContent]);

  const assetsCalc = useMemo(() => computeTotals(data.assets), [data.assets]);
  const equityCalc = useMemo(() => computeTotals(data.equity), [data.equity]);

  const totalAssets = assetsCalc.find((r) => r.code === "270");
  const totalEquity = equityCalc.find((r) => r.code === "440");
  const balanced =
    num(totalAssets?.current) === num(totalEquity?.current) &&
    num(totalAssets?.prior) === num(totalEquity?.prior);

  const updateRow = (
    section: "assets" | "equity",
    code: string,
    field: "current" | "prior" | "note",
    value: string,
  ) => {
    setData((d) => ({
      ...d,
      [section]: d[section].map((r) => {
        if (r.code !== code) return r;
        if (field === "note") return { ...r, note: value };
        if (r.isTotal) return r;
        return { ...r, [field]: parseInput(value) };
      }),
    }));
  };

  const handleSave = () => {
    const payload: BalanceSheetData = {
      ...data,
      assets: assetsCalc,
      equity: equityCalc,
    };
    onSave(JSON.stringify(payload));
    onOpenChange(false);
  };

  const renderTable = (rows: Row[], section: "assets" | "equity") => (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/60">
          <tr className="text-left">
            <th className="w-[80px] px-3 py-2 font-medium">Mã số</th>
            <th className="px-3 py-2 font-medium">Chỉ tiêu</th>
            <th className="w-[220px] px-3 py-2 font-medium">Thuyết minh</th>
            <th className="w-[180px] px-3 py-2 text-right font-medium">{data.currentLabel}</th>
            <th className="w-[180px] px-3 py-2 text-right font-medium">{data.priorLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isGroup = r.level === 0;
            const isSub = r.level === 1;
            return (
              <tr
                key={r.code}
                className={cn(
                  "border-t border-border",
                  isGroup && "bg-muted/40 font-semibold",
                  isSub && "font-medium",
                )}
              >
                <td className="px-3 py-2 tabular-nums text-muted-foreground">{r.code}</td>
                <td
                  className={cn(
                    "px-3 py-2",
                    r.level === 2 && "pl-8",
                    r.level === 3 && "pl-12 text-muted-foreground text-[#0b1118]",
                    isSub && "pl-5",
                  )}
                >
                  {r.label}
                </td>
                <td className="px-2 py-1">
                  <Input
                    className="h-8"
                    value={r.note ?? ""}
                    onChange={(e) => updateRow(section, r.code, "note", e.target.value)}
                    placeholder="—"
                  />
                </td>
                <td className="px-2 py-1 text-right">
                  {r.isTotal ? (
                    <span className="block px-2 tabular-nums">{formatVN(r.current)}</span>
                  ) : (
                    <Input
                      inputMode="numeric"
                      className="h-8 text-right tabular-nums"
                      value={formatVN(r.current)}
                      onChange={(e) => updateRow(section, r.code, "current", e.target.value)}
                      placeholder="0"
                    />
                  )}
                </td>
                <td className="px-2 py-1 text-right">
                  {r.isTotal ? (
                    <span className="block px-2 tabular-nums">{formatVN(r.prior)}</span>
                  ) : (
                    <Input
                      inputMode="numeric"
                      className="h-8 text-right tabular-nums"
                      value={formatVN(r.prior)}
                      onChange={(e) => updateRow(section, r.code, "prior", e.target.value)}
                      placeholder="0"
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[96vw] max-w-[1400px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[1400px]">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
          <DialogTitle>Nhập bảng cân đối kế toán</DialogTitle>
          <DialogDescription>
            Theo mẫu B01-CTCK — Thông tư 334/2016/TT-BTC (sửa đổi, bổ sung Thông tư 210/2014/TT-BTC) áp dụng đối với công ty chứng khoán. Tổng cộng tự động tính theo các nhóm.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="bs-unit">Đơn vị tiền tệ</Label>
            <Input
              id="bs-unit"
              value={data.unit}
              onChange={(e) => setData((d) => ({ ...d, unit: e.target.value }))}
              placeholder="VND"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bs-cur">Cột số liệu kỳ này</Label>
            <Input
              id="bs-cur"
              value={data.currentLabel}
              onChange={(e) => setData((d) => ({ ...d, currentLabel: e.target.value }))}
              placeholder="Số cuối kỳ"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bs-pri">Cột số liệu so sánh</Label>
            <Input
              id="bs-pri"
              value={data.priorLabel}
              onChange={(e) => setData((d) => ({ ...d, priorLabel: e.target.value }))}
              placeholder="Số đầu năm"
            />
          </div>
        </div>

        <Tabs defaultValue="assets" className="mt-2">
          <TabsList>
            <TabsTrigger value="assets">TÀI SẢN</TabsTrigger>
            <TabsTrigger value="equity">NGUỒN VỐN</TabsTrigger>
          </TabsList>
          <TabsContent value="assets" className="mt-3">
            {renderTable(assetsCalc, "assets")}
          </TabsContent>
          <TabsContent value="equity" className="mt-3">
            {renderTable(equityCalc, "equity")}
          </TabsContent>
        </Tabs>

        <div
          className={cn(
            "mt-2 flex items-start gap-2 rounded-lg border p-3 text-sm",
            balanced
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
          )}
        >
          {balanced ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <div className="space-y-0.5">
            <p className="font-medium">
              {balanced
                ? "Cân đối: TỔNG TÀI SẢN = TỔNG NGUỒN VỐN"
                : "Chưa cân đối: TỔNG TÀI SẢN ≠ TỔNG NGUỒN VỐN"}
            </p>
            <p className="text-xs opacity-90">
              Kỳ này: {formatVN(totalAssets?.current) || 0} {data.unit} —{" "}
              {formatVN(totalEquity?.current) || 0} {data.unit}. Kỳ trước:{" "}
              {formatVN(totalAssets?.prior) || 0} {data.unit} —{" "}
              {formatVN(totalEquity?.prior) || 0} {data.unit}.
            </p>
          </div>
        </div>


        </div>

        <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button className="text-white hover:opacity-90" style={{ background: "var(--color-cta-gradient)" }} onClick={handleSave}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
