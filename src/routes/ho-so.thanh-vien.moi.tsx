import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MEMBER_TYPE_LABEL, MemberType, createProfile } from "@/lib/member-store";

export const Route = createFileRoute("/ho-so/thanh-vien/moi")({
  head: () => ({
    meta: [{ title: "Khởi tạo hồ sơ thành viên — Cổng VNX" }],
  }),
  component: NewMemberPage,
});

function NewMemberPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [type, setType] = useState<MemberType>("TVGD");
  const [taxCode, setTaxCode] = useState("");
  const [representative, setRepresentative] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [handler, setHandler] = useState("HSX");
  const [note, setNote] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      toast.error("Vui lòng nhập Mã và Tên thành viên");
      return;
    }
    createProfile({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      shortName: shortName.trim() || undefined,
      type,
      handler: handler.trim() || "HSX",
      taxCode: taxCode.trim() || undefined,
      representative: representative.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      note: note.trim() || undefined,
    });
    toast.success("Đã khởi tạo hồ sơ và chuyển HSX/HNX cập nhật");
    navigate({ to: "/ho-so/thanh-vien" });
  };

  return (
    <AppShell activeKey="ho-so">
      <main className="mx-auto max-w-4xl space-y-5 px-6 py-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/ho-so/thanh-vien" })}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Quay lại
          </Button>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Quản lý hồ sơ
            </p>
            <h1 className="text-xl font-semibold">Khởi tạo hồ sơ thành viên</h1>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-6 rounded-xl border border-border bg-[var(--color-surface)] p-6 shadow-sm"
        >
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground">Thông tin cơ bản</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Mã Thành viên *">
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="VD: TV0005" />
              </Field>
              <Field label="Loại thành viên *">
                <Select value={type} onValueChange={(v) => setType(v as MemberType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(MEMBER_TYPE_LABEL) as MemberType[]).map((k) => (
                      <SelectItem key={k} value={k}>
                        {MEMBER_TYPE_LABEL[k]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Tên Thành viên *" className="md:col-span-2">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên đầy đủ" />
              </Field>
              <Field label="Tên rút gọn">
                <Input
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="VD: CKA"
                />
              </Field>
              <Field label="Mã số thuế">
                <Input value={taxCode} onChange={(e) => setTaxCode(e.target.value)} />
              </Field>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground">Liên hệ</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Người đại diện">
                <Input
                  value={representative}
                  onChange={(e) => setRepresentative(e.target.value)}
                />
              </Field>
              <Field label="Điện thoại">
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>
              <Field label="Email">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field label="Người QLHS tiếp nhận">
                <Select value={handler} onValueChange={setHandler}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HSX">HSX</SelectItem>
                    <SelectItem value="HNX">HNX</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Địa chỉ" className="md:col-span-2">
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </Field>
            </div>
          </section>

          <section className="space-y-2">
            <Label className="text-xs">Ghi chú</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </section>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/ho-so/thanh-vien" })}
            >
              Hủy
            </Button>
            <Button type="submit">Khởi tạo & chuyển HSX/HNX</Button>
          </div>
        </form>
      </main>
    </AppShell>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
