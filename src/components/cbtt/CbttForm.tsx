import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { CalendarIcon, FileCheck2, FilePlus2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  CbttReport,
  NEWS_TYPES_BY_PERIOD,
  PERIOD_LABEL,
  Period,
  ReportSectionKey,
  SECTION_LABEL,
  createReport,
  updateReport,
} from "@/lib/cbtt-store";
import { ReportSectionDialog } from "./ReportSectionDialog";
import { BalanceSheetDialog } from "./BalanceSheetDialog";

type FormState = {
  period: Period | "";
  newsType: string;
  title: string;
  fiscalYear: number | "";
  quarter: 1 | 2 | 3 | 4 | "";
  issuedAt: Date | undefined;
  note: string;
  sections: Partial<Record<ReportSectionKey, { content: string }>>;
};

function toFormState(r?: CbttReport): FormState {
  if (!r) {
    return {
      period: "",
      newsType: "",
      title: "",
      fiscalYear: new Date().getFullYear(),
      quarter: "",
      issuedAt: undefined,
      note: "",
      sections: {},
    };
  }
  return {
    period: r.period,
    newsType: r.newsType,
    title: r.title,
    fiscalYear: r.fiscalYear,
    quarter: r.quarter ?? "",
    issuedAt: new Date(r.issuedAt),
    note: r.note ?? "",
    sections: r.sections ?? {},
  };
}

export function CbttForm({ existing }: { existing?: CbttReport }) {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(() => toFormState(existing));
  const [openSection, setOpenSection] = useState<ReportSectionKey | null>(null);

  const newsTypeOptions = useMemo(
    () => (form.period ? NEWS_TYPES_BY_PERIOD[form.period] : []),
    [form.period],
  );

  const years = useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, i) => y - 5 + i);
  }, []);

  const lastAutoTitleRef = useRef<string>(existing?.title ?? "");

  useEffect(() => {
    if (!form.newsType || !form.fiscalYear) return;
    const parts = [form.newsType, `năm ${form.fiscalYear}`];
    if (form.period === "QUY" && form.quarter) {
      parts.splice(1, 0, `Quý ${form.quarter}`);
    }
    const auto = parts.join(" ");
    // Nếu người dùng đã chỉnh tay tiêu đề (khác lần auto gần nhất) thì dừng tự động cập nhật
    if (form.title && form.title !== lastAutoTitleRef.current) return;
    if (form.title === auto) return;
    lastAutoTitleRef.current = auto;
    setForm((s) => ({ ...s, title: auto }));
  }, [form.newsType, form.fiscalYear, form.quarter, form.period, form.title]);

  const onPeriodChange = (v: Period) => {
    setForm((s) => ({
      ...s,
      period: v,
      newsType: "",
      quarter: v === "QUY" ? s.quarter : "",
    }));
  };

  const validate = (full: boolean) => {
    if (!form.period) return "Vui lòng chọn Kỳ CBTT";
    if (!form.newsType) return "Vui lòng chọn Loại tin";
    if (!form.title.trim()) return "Vui lòng nhập Tiêu đề";
    if (!form.fiscalYear) return "Vui lòng chọn Năm tài chính";
    if (form.period === "QUY" && !form.quarter) return "Vui lòng chọn Quý";
    if (full && !form.issuedAt) return "Vui lòng chọn Ngày ban hành";
    return null;
  };

  const buildPayload = (status: "Nháp" | "Chờ duyệt") => ({
    period: form.period as Period,
    newsType: form.newsType,
    title: form.title.trim(),
    fiscalYear: Number(form.fiscalYear),
    quarter: form.period === "QUY" ? (form.quarter as 1 | 2 | 3 | 4) : undefined,
    issuedAt: (form.issuedAt ?? new Date()).toISOString(),
    note: form.note.trim() || undefined,
    sections: form.sections,
    status,
  });

  const submit = (status: "Nháp" | "Chờ duyệt") => {
    const err = validate(status === "Chờ duyệt");
    if (err) {
      toast.error(err);
      return;
    }
    const payload = buildPayload(status);
    if (existing) {
      updateReport(existing.id, payload);
      toast.success(status === "Nháp" ? "Đã lưu nháp" : "Đã gửi duyệt");
    } else {
      createReport(payload);
      toast.success(status === "Nháp" ? "Đã tạo bản nháp" : "Đã gửi duyệt");
    }
    navigate({ to: "/cbtt/dinh-ky" });
  };

  const sectionKeys: ReportSectionKey[] = [
    "balanceSheet",
    "incomeStatement",
    "cashFlow",
    "profitExplanation",
  ];

  const fieldClass =
    "bg-[var(--color-surface)] text-foreground shadow-sm " +
    "focus:border-brand focus-visible:border-brand " +
    "disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 disabled:cursor-not-allowed " +
    "data-[disabled]:bg-muted data-[disabled]:text-muted-foreground data-[disabled]:opacity-100 border border-slate-400";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Kỳ CBTT */}
        <div className="space-y-2">
          <Label>Kỳ CBTT <span className="text-destructive">*</span></Label>
          <Select value={form.period || undefined} onValueChange={(v) => onPeriodChange(v as Period)}>
            <SelectTrigger className={fieldClass}><SelectValue placeholder="Chọn kỳ CBTT" /></SelectTrigger>
            <SelectContent>
              {(Object.keys(PERIOD_LABEL) as Period[]).map((p) => (
                <SelectItem key={p} value={p}>{PERIOD_LABEL[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loại tin */}
        <div className="space-y-2">
          <Label>Loại tin <span className="text-destructive">*</span></Label>
          <Select
            value={form.newsType || undefined}
            onValueChange={(v) => setForm((s) => ({ ...s, newsType: v }))}
            disabled={!form.period}
          >
            <SelectTrigger className={fieldClass}>
              <SelectValue placeholder={form.period ? "Chọn loại tin" : "Chọn Kỳ CBTT trước"} />
            </SelectTrigger>
            <SelectContent>
              {newsTypeOptions.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Năm tài chính */}
        <div className="space-y-2">
          <Label>Năm tài chính <span className="text-destructive">*</span></Label>
          <Select
            value={form.fiscalYear ? String(form.fiscalYear) : undefined}
            onValueChange={(v) => setForm((s) => ({ ...s, fiscalYear: Number(v) }))}
          >
            <SelectTrigger className={fieldClass}><SelectValue placeholder="Chọn năm" /></SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quý */}
        <div className="space-y-2">
          <Label>Quý {form.period === "QUY" && <span className="text-destructive">*</span>}</Label>
          <Select
            value={form.quarter ? String(form.quarter) : undefined}
            onValueChange={(v) => setForm((s) => ({ ...s, quarter: Number(v) as 1 | 2 | 3 | 4 }))}
            disabled={form.period !== "QUY"}
          >
            <SelectTrigger className={fieldClass}>
              <SelectValue placeholder={form.period === "QUY" ? "Chọn quý" : "Chỉ áp dụng cho Kỳ Theo quý"} />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map((q) => (
                <SelectItem key={q} value={String(q)}>Quý {q}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ngày ban hành */}
        <div className="space-y-2">
          <Label>Ngày ban hành <span className="text-destructive">*</span></Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  fieldClass,
                  !form.issuedAt && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.issuedAt ? format(form.issuedAt, "dd/MM/yyyy") : "Chọn ngày"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={form.issuedAt}
                onSelect={(d) => setForm((s) => ({ ...s, issuedAt: d ?? undefined }))}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Tiêu đề */}
        <div className="space-y-2 md:col-span-3">
          <Label htmlFor="title">Tiêu đề <span className="text-destructive">*</span></Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            placeholder="Nhập tiêu đề tin công bố"
            className={fieldClass}
          />
        </div>

        {/* Ghi chú */}
        <div className="space-y-2 md:col-span-3">
          <Label htmlFor="note">Ghi chú</Label>
          <Textarea
            id="note"
            rows={1}
            value={form.note}
            onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))}
            placeholder="Ghi chú nội bộ (không bắt buộc)"
            className={cn("min-h-9 h-9 resize-none py-2", fieldClass)}
          />
        </div>
      </div>

      {/* Toàn văn báo cáo tài chính */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Toàn văn báo cáo tài chính</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {sectionKeys.map((k) => {
              const filled = !!form.sections[k]?.content?.trim();
              return (
                <div
                  key={k}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-[var(--color-surface)] p-3"
                >
                  <div className="flex items-center gap-2">
                    {filled ? (
                      <FileCheck2 className="h-4 w-4 text-[var(--color-success)]" />
                    ) : (
                      <FilePlus2 className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{SECTION_LABEL[k]}</p>
                      {filled && (
                        <Badge variant="secondary" className="mt-1 text-[10px]">Đã nhập</Badge>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setOpenSection(k)}>
                    {filled ? "Sửa" : "Nhập"}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {openSection === "balanceSheet" && (
        <BalanceSheetDialog
          open={openSection === "balanceSheet"}
          onOpenChange={(v) => !v && setOpenSection(null)}
          initialContent={form.sections.balanceSheet?.content}
          onSave={(content) =>
            setForm((s) => ({
              ...s,
              sections: { ...s.sections, balanceSheet: { content } },
            }))
          }
        />
      )}

      {openSection && openSection !== "balanceSheet" && (
        <ReportSectionDialog
          open={openSection !== null}
          onOpenChange={(v) => !v && setOpenSection(null)}
          title={`Nhập ${SECTION_LABEL[openSection].toLowerCase()}`}
          initialContent={form.sections[openSection]?.content}
          onSave={(content) =>
            setForm((s) => ({
              ...s,
              sections: { ...s.sections, [openSection]: { content } },
            }))
          }
        />
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
        <Button variant="outline" onClick={() => navigate({ to: "/cbtt/dinh-ky" })}>
          Hủy
        </Button>
        <Button variant="secondary" onClick={() => submit("Nháp")}>
          Lưu nháp
        </Button>
        <Button className="text-white hover:opacity-90" style={{ background: "var(--color-cta-gradient)" }} onClick={() => submit("Chờ duyệt")}>Gửi duyệt</Button>
      </div>
    </div>
  );
}
