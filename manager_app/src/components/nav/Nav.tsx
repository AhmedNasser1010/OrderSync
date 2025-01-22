import PageTitle from "./PageTitle";
import Range from "./Range";

export default function Nav() {
  return (
    <div className="flex items-center justify-between">
      <PageTitle title="Restaurant Analytics" />
      <Range />
    </div>
  );
}
