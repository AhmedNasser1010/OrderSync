"use client";

import Input from "@/components/Checkout/Input";

const InputWrapper = ({
  style,
  as,
  label,
  name,
  placeholder,
  error,
  helperMsg,
  onChange,
  type,
}: {
  style?: React.CSSProperties;
  as?: React.ElementType;
  label: string;
  name?: string;
  placeholder?: string;
  error?: boolean;
  helperMsg?: string | false;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  type?: string;
}) => {
  return (
    <label
      style={style}
      className={`relative block ${error ? "text-[#d32f2f]" : ""}`}
    >
      <span
        className={`absolute -top-[7px] left-[15px] bg-background text-[13px] px-[10px] h-[8px] ${
          error ? "text-[#d32f2f]" : ""
        }`}
      >
        {label}
      </span>
      <Input
        as={as}
        name={name}
        placeholder={placeholder}
        error={error}
        type={type}
        onChange={onChange}
      />
      {error && (
        <span className="block text-[#d32f2f] max-w-full ml-5 mt-[5px] text-[13px]">
          {helperMsg}
        </span>
      )}
    </label>
  );
};

export default InputWrapper;
