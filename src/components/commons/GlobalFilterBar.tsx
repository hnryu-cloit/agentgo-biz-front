import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStores } from "@/services/settings";
import type { StoreResponse } from "@/types/api";

const fallbackStores: StoreResponse[] = [
  {
    id: "[CJ]광화문점",
    name: "[CJ]광화문점",
    region: "광화문",
    address: "",
    size: null,
    open_time: null,
    close_time: null,
    break_start: null,
    break_end: null,
    seats: null,
    service_type: null,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "[CJ]소공점",
    name: "[CJ]소공점",
    region: "소공",
    address: "",
    size: null,
    open_time: null,
    close_time: null,
    break_start: null,
    break_end: null,
    seats: null,
    service_type: null,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "[CJ]아이파크용산점",
    name: "[CJ]아이파크용산점",
    region: "용산",
    address: "",
    size: null,
    open_time: null,
    close_time: null,
    break_start: null,
    break_end: null,
    seats: null,
    service_type: null,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

export const GlobalFilterBar: React.FC = () => {
  const [stores, setStores] = useState<StoreResponse[]>(fallbackStores);
  const [selectedStore, setSelectedStore] = useState("__cj_all__");

  useEffect(() => {
    let alive = true;
    getStores()
      .then((rows) => {
        if (!alive || rows.length === 0) return;
        setStores(rows.filter((store) => store.is_active));
      })
      .catch(() => {
        if (!alive) return;
        setStores(fallbackStores);
      });

    return () => {
      alive = false;
    };
  }, []);

  const storeItems = useMemo(() => {
    const activeStores = stores.length > 0 ? stores : fallbackStores;
    return [
      { id: "__cj_all__", label: "크리스탈제이드 전체" },
      ...activeStores.map((store) => ({
        id: store.id,
        label: `${store.name}${store.region ? ` (${store.region})` : ""}`,
      })),
    ];
  }, [stores]);

  return (
    <div className="fixed left-0 right-0 top-[68px] z-20 border-b border-border/70 bg-white/92 backdrop-blur-sm lg:left-64">
      <div className="flex h-[52px] items-center gap-3 px-5 md:px-8">
        <Select value={selectedStore} onValueChange={setSelectedStore}>
          <SelectTrigger className="h-9 w-[190px] bg-card">
            <SelectValue placeholder="매장 선택" />
          </SelectTrigger>
          <SelectContent>
            {storeItems.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue="this-week">
          <SelectTrigger className="h-9 w-[170px] bg-card">
            <SelectValue placeholder="기간 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">오늘</SelectItem>
            <SelectItem value="this-week">이번 주</SelectItem>
            <SelectItem value="this-month">이번 달</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
