import { Card, CardContent } from "@/components/ui/card";

function MenuCard({
  className = "",
  callback = () => {},
  title = "",
  icon,
  disabled = false,
}: {
  className?: string;
  callback?: () => void;
  title?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <Card
      className={`cursor-pointer transition-colors ${
        !disabled ? "hover:bg-gray-100" : "opacity-50 cursor-not-allowed"
      } ${className}`}
      onClick={!disabled ? callback : undefined}
    >
      <CardContent className="flex flex-col items-center justify-center p-6">
        {icon && icon}
        <span className="text-sm font-medium text-center">{title}</span>
      </CardContent>
    </Card>
  );
}

export default MenuCard;
