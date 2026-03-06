export type StoreResource = {
  id: string;
  slug: string;
  name: string;
  address: string;
  phone: string;
  openHours: string;
  breakTime: string;
  lastOrder: string;
  seats: string;
  parking: string;
  signatureMenus: string[];
  menuPdfFile?: string;
  menuPdfPath?: string;
};

export const storeResources: StoreResource[] = [
  {
    id: "s01",
    slug: "seoul-junggu-01",
    name: "A매장",
    address: "서울 중구 세종대로 10",
    phone: "02-3789-8088",
    openHours: "11:00~21:30",
    breakTime: "15:00~17:00",
    lastOrder: "20:30",
    seats: "142석",
    parking: "2시간 무료",
    signatureMenus: ["북경오리", "가지덮밥", "마늘볶음"],
    menuPdfFile: "A매장_menu.pdf",
    menuPdfPath: "D:/hnryu/proposal/AgentGo Biz/resource/menu/A매장_menu.pdf",
  },
  {
    id: "s02",
    slug: "seoul-jongro-02",
    name: "B매장",
    address: "서울 종로구 종로 1",
    phone: "02-720-0133",
    openHours: "11:00~21:30",
    breakTime: "15:00~17:00",
    lastOrder: "20:30",
    seats: "106석",
    parking: "주차 3시간 무료",
    signatureMenus: ["북경오리", "딴딴면", "샤오롱바오"],
    menuPdfFile: "B매장_menu.pdf",
    menuPdfPath: "D:/hnryu/proposal/AgentGo Biz/resource/menu/B매장_menu.pdf",
  },
  {
    id: "s03",
    slug: "seoul-seocho-03",
    name: "C매장",
    address: "서울 서초구 반포대로 33",
    phone: "02-532-8429",
    openHours: "11:30~22:00",
    breakTime: "15:00~17:00",
    lastOrder: "21:00",
    seats: "144석",
    parking: "3시간 무료",
    signatureMenus: ["마파두부", "고추볶음", "딴딴면"],
  },
  {
    id: "s04",
    slug: "seoul-gangnam-04",
    name: "D매장",
    address: "서울 강남구 강남대로 30",
    phone: "02-529-0717",
    openHours: "11:30~22:00",
    breakTime: "15:00~17:00",
    lastOrder: "21:00",
    seats: "124석",
    parking: "지하 주차 2시간 무료",
    signatureMenus: ["북경오리", "고추볶음", "마파두부"],
  },
  {
    id: "s05",
    slug: "seoul-gangnam-05",
    name: "E매장",
    address: "서울 강남구 도산대로 165",
    phone: "02-3449-5864",
    openHours: "11:00~22:00",
    breakTime: "15:00~16:00",
    lastOrder: "21:00",
    seats: "50석",
    parking: "백화점 주차 정책 적용",
    signatureMenus: ["샤오롱바오", "북경오리", "딴딴면"],
  },
];

export const storeNames = storeResources.map((store) => store.name);
export const allSignatureMenus = Array.from(new Set(storeResources.flatMap((store) => store.signatureMenus)));
export const menuPdfStores = storeResources.filter((store) => Boolean(store.menuPdfFile));
