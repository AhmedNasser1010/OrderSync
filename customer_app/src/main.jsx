import ReactDOM from 'react-dom/client'
import App from './App'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Error } from './pages'
import Home from './pages/home/Home'
import RestaurantMenu from './pages/restaurant-menu/RestaurantMenu'
import Cart from './pages/cart/Cart'
import Checkout from './pages/checkout/Checkout'
import { Suspense } from 'react'
import ShimmerHome from './components/Shimmer/ShimmerHome'
import ShimmerMenu from './components/Shimmer/ShimmerMenu'
import { Provider } from 'react-redux'
import { store } from './rtk/store'
import './css/index.css'

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Suspense fallback={<ShimmerHome />}><Home /></Suspense>
      },
      {
        path: "/cart",
        element: <Cart />
      },
      {
        path: "/checkout",
        element: <Checkout />
      },
      {
        path: "/restaurants/:resId",
        element: <Suspense fallback={<ShimmerMenu />}><RestaurantMenu /></Suspense>
      }
    ],
    errorElement: <Error />
  },
])

ReactDOM.createRoot(document.getElementById('root'))
  .render(
    <Provider store={store}>
      <RouterProvider router={appRouter} />
    </Provider>)


// Register the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
    .then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    })
    .catch(error => {
      console.log('ServiceWorker registration failed: ', error);
    });
  });
}

window.read = 0
window.write = 0