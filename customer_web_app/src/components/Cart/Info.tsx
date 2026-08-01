"use client";

const Info = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) => {
  return (
    <div className="info flex justify-between items-center text-gray-500 font-ProximaNovaSemiBold">
      <span className="label">{label}</span>
      <span className="value">{children}</span>
    </div>
  );
};

export default Info;
