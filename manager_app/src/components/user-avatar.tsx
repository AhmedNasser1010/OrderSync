import useUser from "@/hooks/useUser";

export function UserAvatar() {
  const { name } = useUser();
  return (
    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
      <span className="text-sm font-semibold text-card-foreground">
        {name?.charAt(0).toUpperCase() || "?"}
      </span>
    </div>
  );
}
