"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function Navigation() {
  const router = useRouter()
  const path = usePathname();
  return path !== "/" ? (
    <div className="absolute top-0 p-4">
      <Button variant="ghost" onClick={()=>router.push("/")}>
        <ArrowLeft />
      </Button>
    </div>
  ) : null;
}
