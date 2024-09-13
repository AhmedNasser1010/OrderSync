function PageTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center space-x-4">
      <h1 className="text-2xl font-bold">{children}</h1>
    </div>
  );
}

export default PageTitle;
