// LocalStorage-backed store for "Hồ sơ thành viên" (VNX role, mock backend).

export type MemberType = "TVGD" | "TVLK" | "TVGD_LK";
export const MEMBER_TYPE_LABEL: Record<MemberType, string> = {
  TVGD: "Thành viên GD",
  TVLK: "Thành viên LK",
  TVGD_LK: "Thành viên GD & LK",
};

export type ProfileStatus =
  | "Nháp"
  | "Chờ HSX/HNX cập nhật"
  | "Chờ Thành viên cập nhật"
  | "Chờ VNX phê duyệt"
  | "Đã phê duyệt"
  | "Trả bổ sung";

export const ALL_STATUSES: ProfileStatus[] = [
  "Nháp",
  "Chờ HSX/HNX cập nhật",
  "Chờ Thành viên cập nhật",
  "Chờ VNX phê duyệt",
  "Đã phê duyệt",
  "Trả bổ sung",
];

export type HistoryEntry = {
  at: string; // ISO datetime
  actor: string;
  action: string;
  note?: string;
};

export type MemberProfile = {
  id: string;
  code: string; // Mã thành viên
  name: string; // Tên thành viên
  shortName?: string;
  type: MemberType;
  status: ProfileStatus;
  handler: string; // Người QLHS (tên hoặc đơn vị: HSX/HNX/VNX/TVxxxx)
  address?: string;
  taxCode?: string;
  representative?: string;
  phone?: string;
  email?: string;
  note?: string;
  createdAt: string;
  history: HistoryEntry[];
};

const KEY = "ho-so-thanh-vien";

function read(): MemberProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    return JSON.parse(raw) as MemberProfile[];
  } catch {
    return [];
  }
}

function write(list: MemberProfile[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

function seed(): MemberProfile[] {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  const sample: MemberProfile[] = [
    {
      id: crypto.randomUUID(),
      code: "TV0001",
      name: "CTCP Chứng khoán A",
      shortName: "CKA",
      type: "TVGD",
      status: "Chờ HSX/HNX cập nhật",
      handler: "HSX",
      address: "Tầng 5, Toà nhà ABC, Q.1, TP.HCM",
      taxCode: "0301234567",
      representative: "Nguyễn Văn An",
      phone: "028 3822 1234",
      email: "contact@cka.vn",
      createdAt: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 12)),
      history: [
        {
          at: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 12, 9, 0)),
          actor: "VNX - Lê Quang",
          action: "Khởi tạo hồ sơ",
        },
        {
          at: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 12, 9, 5)),
          actor: "VNX - Lê Quang",
          action: "Chuyển HSX cập nhật",
          note: "Đề nghị bổ sung thông tin nghiệp vụ.",
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      code: "TV0002",
      name: "CTCP Chứng khoán B",
      shortName: "CKB",
      type: "TVGD",
      status: "Chờ Thành viên cập nhật",
      handler: "TV0002",
      taxCode: "0312345678",
      representative: "Trần Bình",
      phone: "024 3936 5566",
      email: "info@ckb.vn",
      createdAt: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 8)),
      history: [
        {
          at: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 8, 10, 0)),
          actor: "VNX - Lê Quang",
          action: "Khởi tạo hồ sơ",
        },
        {
          at: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 14, 30)),
          actor: "HSX - Phạm Hà",
          action: "Chuyển Thành viên cập nhật",
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      code: "TV0003",
      name: "Ngân hàng Lưu ký C",
      shortName: "NHC",
      type: "TVLK",
      status: "Chờ VNX phê duyệt",
      handler: "Nguyễn Văn A",
      taxCode: "0100123456",
      representative: "Đỗ Mai",
      phone: "024 3826 8888",
      email: "custody@nhc.vn",
      createdAt: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 20)),
      history: [
        {
          at: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 20, 8, 30)),
          actor: "VNX - Lê Quang",
          action: "Khởi tạo hồ sơ",
        },
        {
          at: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5, 16, 0)),
          actor: "Thành viên NHC",
          action: "Hoàn thiện hồ sơ, gửi VNX phê duyệt",
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      code: "TV0004",
      name: "CTCP Chứng khoán D",
      shortName: "CKD",
      type: "TVGD",
      status: "Đã phê duyệt",
      handler: "Trần Thị B",
      taxCode: "0303456789",
      representative: "Lý Hùng",
      phone: "028 3925 4567",
      email: "ir@ckd.vn",
      createdAt: iso(new Date(now.getFullYear(), now.getMonth() - 1, 10)),
      history: [
        {
          at: iso(new Date(now.getFullYear(), now.getMonth() - 1, 10, 9, 0)),
          actor: "VNX - Lê Quang",
          action: "Khởi tạo hồ sơ",
        },
        {
          at: iso(new Date(now.getFullYear(), now.getMonth() - 1, 25, 11, 0)),
          actor: "VNX - Trần Thị B",
          action: "Phê duyệt hồ sơ",
        },
      ],
    },
  ];
  write(sample);
  return sample;
}

export function listProfiles(): MemberProfile[] {
  return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getProfile(id: string): MemberProfile | undefined {
  return read().find((p) => p.id === id);
}

export function createProfile(
  data: Omit<MemberProfile, "id" | "createdAt" | "history" | "status"> & {
    status?: ProfileStatus;
  },
): MemberProfile {
  const list = read();
  const now = new Date().toISOString();
  const item: MemberProfile = {
    ...data,
    status: data.status ?? "Chờ HSX/HNX cập nhật",
    id: crypto.randomUUID(),
    createdAt: now,
    history: [
      {
        at: now,
        actor: "VNX - Người dùng hiện tại",
        action: "Khởi tạo hồ sơ",
      },
    ],
  };
  list.push(item);
  write(list);
  return item;
}

export function appendHistory(id: string, entry: Omit<HistoryEntry, "at">) {
  const list = read();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return;
  list[idx].history.push({ ...entry, at: new Date().toISOString() });
  write(list);
}

export function setStatus(id: string, status: ProfileStatus, actor: string, note?: string) {
  const list = read();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return;
  list[idx].status = status;
  list[idx].history.push({
    at: new Date().toISOString(),
    actor,
    action: `Cập nhật trạng thái: ${status}`,
    note,
  });
  write(list);
}
