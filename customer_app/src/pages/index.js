import { lazy } from "react";

const Home = lazy(() => import("./home/Home"))
import Cart from "./cart/Cart"
import Checkout from "./checkout/Checkout"
import Error from "./Error"

export {Home, Cart, Checkout, Error}