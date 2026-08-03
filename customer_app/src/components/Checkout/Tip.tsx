"use client";

const Tip = ({
  message,
  icon,
  status = "tip",
}: {
  message: string;
  icon?: React.ReactNode;
  status?: "tip" | "error";
}) => {
  return (
    <div
      className={`flex items-center p-[15px] rounded-[10px] select-none my-[10px] ${
        status === "tip" ? "bg-[#d1d1ff] dark:bg-[#2a2a4a]" : ""
      }`}
    >
      {icon && <span className="mr-[10px]">{icon}</span>}
      <p className="font-bold">{message}</p>
    </div>
  );
};

export default Tip;
