"use client";

const PopupMsg = ({
  title,
  subject,
  button,
}: {
  title: string;
  subject: string;
  button: React.ReactNode;
}) => {
  return (
    <div className="bg-[#edf0ff] dark:bg-[#1e2230] border border-[#3F51B5] dark:border-[#5b6dce] p-[40px_20px_10px_20px] rounded-lg flex flex-col min-w-[400px] min-h-[200px] items-center justify-start relative">
      <h3 className="font-light text-[40px] tracking-[2px] mb-6">{title}</h3>
      <p className="w-4/5 text-center leading-[25px] text-[15px] tracking-[0.5px]">
        {subject}
      </p>
      <span className="absolute bottom-5 right-5 text-[#673AB7] dark:text-[#9a8fe0] text-sm cursor-pointer">
        {button}
      </span>
    </div>
  );
};

export default PopupMsg;
