"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { AddMemberSheet } from "@/components/features/staff/AddMemberSheet";
import { Header } from "@/components/features/staff/Header";
import { StaffCard } from "@/components/features/staff/StaffCard";
import useStaff from "@/hooks/useStaff";
import { StaffListSkeleton } from "@/components/shimmer/staff/StaffListSkeleton";

export default function StaffPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { drivers } = useStaff();
  const showSkeleton =
    drivers.isLoading || (drivers.isFetching && !drivers.data);

  const filteredStaff = drivers.data.filter(
    (member) =>
      member.userInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.userInfo.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.userInfo.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full">
      {showSkeleton ? (
        <StaffListSkeleton />
      ) : (
        <>
          <Header
            staff={drivers.data}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <main className="flex-1 overflow-auto px-4 py-4">
            <div className="space-y-3">
              {filteredStaff.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "No staff members found"
                      : "No staff members yet"}
                  </p>
                </div>
              ) : (
                filteredStaff.map((member) => (
                  <StaffCard key={member.uid} member={member} />
                ))
              )}
            </div>
          </main>

          <footer className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-4">
            <AddMemberSheet />
          </footer>
        </>
      )}
    </div>
  );
}
