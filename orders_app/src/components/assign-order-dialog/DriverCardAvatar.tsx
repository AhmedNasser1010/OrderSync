import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  avatar: string;
  name: string;
};

export default function DriverCardAvatar({ avatar, name }: Props) {
  return (
    <Avatar>
      <AvatarImage src={avatar} alt={name} />
      <AvatarFallback>
        {name
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </AvatarFallback>
    </Avatar>
  );
}
