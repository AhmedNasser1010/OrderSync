"use client";

const Input = ({
  as: Comp = "input",
  error,
  ...props
}: {
  as?: React.ElementType;
  error?: boolean;
  name?: string;
  placeholder?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <Comp
      {...props}
      className={`w-[calc(100%-20px)] p-[10px] block rounded border text-base ${
        error ? "border-[#d32f2f]" : "border-[#979797]"
      } placeholder:text-xs focus:outline-none`}
    />
  );
};

export default Input;
