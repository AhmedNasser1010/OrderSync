const TextInput = ({
  className,
  variant = 'standard',
  value,
  name,
  placeholder = '',
  helperMessage,
  onChange,
  onClick,
  onBlur
}) => {
  return (
    <>
      <input
        className={`${className} w-full p-5 ring-1 ring-gray-300 ${
          variant === 'error' && '!ring-red-500 text-red-500 error-placeholder'
        } ${variant === 'warning' && '!ring-yellow-500 text-yellow-500 warning-placeholder'} `}
        type="text"
        value={value}
        name={name}
        placeholder={placeholder}
        onChange={onChange}
        onClick={onClick}
        onBlur={onBlur}
      />
      {helperMessage && <span className="block text-red-500 mt-2.5">{helperMessage}</span>}
    </>
  )
}

export default TextInput
