import Page from "@/components/Page";
import OrdersTabs from "./OrdersTabs";
import OrdersView from "./OrdersView";
import PageTitle from "./PageTitle";
import OrdersTopBar from "./OrdersTopBar";
import OrdersTopBarBtns from "./OrdersTopBarBtns";
import ResStatusBtn from "./ResStatusBtn";
import ResStatus from "./ResStatus";
import SettingsMenu from "@/components/more-menu/SettingsMenu";

export default function OrdersPage() {
  return (
    <Page>
      <OrdersTopBar>
        <div className="flex items-center space-x-4">
          <PageTitle>Orders</PageTitle>
          <ResStatus />
        </div>
        <OrdersTopBarBtns>
          <ResStatusBtn />
          <SettingsMenu />
          {/* <ThemeToggle /> */}
        </OrdersTopBarBtns>
      </OrdersTopBar>
      <OrdersTabs />
      <OrdersView />
    </Page>
  );
}
