import type React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const GlobalFilterBar: React.FC = () => {
  return (
    <div className="fixed left-0 right-0 top-[68px] z-20 border-b border-border/70 bg-white/85 backdrop-blur-sm lg:left-64">
      <div className="flex h-[52px] items-center gap-3 px-5 md:px-8">
        <Select defaultValue="s001">
          <SelectTrigger className="h-9 w-[190px] bg-card">
            <SelectValue placeholder="매장 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="s001">A매장 (S001)</SelectItem>
            <SelectItem value="s002">B매장 (S002)</SelectItem>
            <SelectItem value="all">전체 매장</SelectItem>
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
