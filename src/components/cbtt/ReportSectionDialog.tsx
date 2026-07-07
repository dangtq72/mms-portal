import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ReportSectionDialog({
  open,
  onOpenChange,
  title,
  initialContent,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  initialContent?: string;
  onSave: (content: string) => void;
}) {
  const [content, setContent] = useState(initialContent ?? "");
  return (
    <Dialog open={open} onOpenChange={(v) => { setContent(initialContent ?? ""); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Nhập nội dung chi tiết. Hỗ trợ văn bản dạng bảng, số liệu, ghi chú.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="section-content">Nội dung</Label>
          <Textarea
            id="section-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập nội dung..."
            className="min-h-[240px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button
            className="text-white hover:opacity-90"
            style={{ background: "var(--color-cta-gradient)" }}
            onClick={() => {
              onSave(content);
              onOpenChange(false);
            }}
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
