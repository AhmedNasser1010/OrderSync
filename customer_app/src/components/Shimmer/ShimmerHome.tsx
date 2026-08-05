"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const ShimmerHome = () => {
  return (
    <div className="mt-20">
      <div className="carousel-loading h-80 flex justify-center flex-col gap-7">
        <div className="flex items-center justify-center relative">
          <div className="spinner" />
          <Image
            className="absolute w-10 h-10 top-2/4 left-2/4 -translate-x-1/2 -translate-y-1/2"
            src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/icecream_wwomsa"
            alt="carousel"
            width={40}
            height={40}
          />
        </div>
        <h2 className="sm:text-2xl text-xl font-ProximaNovaThin">
          Looking for great food near you ...
        </h2>
      </div>

      <div className="flex items-center justify-center md:flex-row flex-col md:justify-between mb-5 pl-10 pr-10 pt-10 container mx-auto gap-6">
        <div className="flex items-center gap-3">
          <button className="w-[100px] bg-gray-400 h-[50px] rounded-3xl animate-pulse" />
          <button className="w-[100px] bg-gray-400 h-[50px] rounded-3xl animate-pulse" />
          <button className="w-[100px] bg-gray-400 h-[50px] rounded-3xl animate-pulse" />
        </div>
        <div className="flex items-center">
          <div className="w-[250px] bg-gray-400 h-[50px] rounded-3xl animate-pulse" />
        </div>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-10 mt-10 container mx-auto">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={cn("w-[330px] h-[250px] rounded-xl bg-gray-400 animate-pulse")}
          />
        ))}
      </div>
    </div>
  );
};

export default ShimmerHome;
