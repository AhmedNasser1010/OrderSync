"use client";

const ShimmerMenu = () => {
  return (
    <div className="-mt-20 min-h-screen pb-10">
      <div className="relative overflow-hidden bg-[#282c3f]">
        <div className="mx-auto w-full max-w-5xl px-4 pt-24 sm:px-7">
          <div className="h-3 w-56 animate-pulse rounded bg-white/20" />
          <div className="flex flex-col gap-6 py-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="size-16 shrink-0 animate-pulse rounded-2xl bg-white/20 sm:size-20" />
              <div className="space-y-2.5">
                <div className="h-7 w-48 animate-pulse rounded bg-white/25 sm:h-9" />
                <div className="h-3.5 w-64 animate-pulse rounded bg-white/15" />
                <div className="h-3.5 w-40 animate-pulse rounded bg-white/15" />
              </div>
            </div>
            <div className="h-16 w-32 animate-pulse rounded-2xl bg-white/15" />
          </div>
        </div>
      </div>

      <div className="sticky top-14 z-30 border-b border-color-7 bg-background/95 py-2.5">
        <div className="mx-auto flex w-full items-center gap-3 px-4 2xl:max-w-5xl">
          <div className="flex flex-1 gap-2 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-20 shrink-0 animate-pulse rounded-full bg-color-7"
              />
            ))}
          </div>
          <div className="h-10 w-40 shrink-0 animate-pulse rounded-full bg-color-7" />
        </div>
      </div>

      <div className="mx-auto mt-6 w-full px-4 sm:px-7 md:w-4/5 2xl:max-w-5xl">
        {[...Array(3)].map((_, s) => (
          <div key={s} className="py-5">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1.5 animate-pulse rounded-full bg-color-2/50" />
              <div className="h-6 w-44 animate-pulse rounded bg-color-7" />
            </div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start justify-between gap-4 py-6">
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-color-7" />
                  <div className="h-4 w-24 animate-pulse rounded bg-color-7" />
                  <div className="h-3.5 w-full animate-pulse rounded bg-color-7/60" />
                  <div className="h-3.5 w-5/6 animate-pulse rounded bg-color-7/60" />
                </div>
                <div className="h-28 w-32 shrink-0 animate-pulse rounded-2xl bg-color-7 sm:h-36 sm:w-44" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShimmerMenu;
