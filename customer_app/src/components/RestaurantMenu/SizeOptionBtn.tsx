"use client";

const SizeOptionBtn = ({
  children,
  onMouseUp,
  isSelected,
}: {
  children: React.ReactNode;
  onMouseUp?: () => void;
  isSelected?: boolean;
}) => {
  return (
    <button
      onMouseUp={onMouseUp}
      className={`hover:bg-gray-200 ${isSelected && "bg-gray-200"} px-4 py-1 dark:hover:bg-gray-800 ${isSelected && "dark:bg-gray-800"}`}
    >
      {children}
    </button>
  );
};

export default SizeOptionBtn;
