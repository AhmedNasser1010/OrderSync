import Page from "@/components/Page";
import OrdersTabs from "./OrdersTabs";
import OrdersView from "./OrdersView";
import PageTitle from "./PageTitle";
import OrdersTopBar from "./OrdersTopBar";
import OrdersTopBarBtns from "./OrdersTopBarBtns";
import UserStatusIndicator from "./UserStatusIndicator";

export default function OrdersPage() {
  return (
    <Page>
      <OrdersTopBar>
        <PageTitle>Orders</PageTitle>
        <OrdersTopBarBtns>
          <UserStatusIndicator />
          {/* Disabled buttons here */}
          {/* <SettingsMenu closeDay={closeDay} generateReport={generateReport} /> */}
          {/* <ThemeToggle /> */}
        </OrdersTopBarBtns>
      </OrdersTopBar>
      <OrdersTabs />
      <OrdersView />
    </Page>
  );
}
