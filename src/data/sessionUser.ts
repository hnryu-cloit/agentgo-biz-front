export interface SessionUser {
  id: string;
  name: string;
  role: "store_owner" | "supervisor" | "hq_admin" | "marketer";
  roleLabel: string;
  email: string;
  initials: string;
  avatarUrl?: string;
}

export const sessionUser: SessionUser = {
  id: "U-1001",
  name: "클로잇",
  role: "store_owner",
  roleLabel: "점주",
  email: "cloit.genai@itcen.com",
  initials: "클",
  avatarUrl:
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%25' stop-color='%23257bf4'/><stop offset='100%25' stop-color='%231c398e'/></linearGradient></defs><rect width='80' height='80' rx='40' fill='url(%23g)'/><circle cx='40' cy='30' r='14' fill='white' fill-opacity='0.95'/><path d='M16 66c4-11 14-18 24-18s20 7 24 18' fill='white' fill-opacity='0.95'/></svg>",
};