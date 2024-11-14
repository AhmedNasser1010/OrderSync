type Props = {
  name: string;
  status: string;
};

export default function DriverCardInfo({ name, status }: Props) {
  return (
    <div className="flex-1 space-y-1">
      <p className="text-sm font-medium leading-none">{name}</p>
      <p className="text-sm text-muted-foreground">{status}</p>
    </div>
  );
}
