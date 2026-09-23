import { redirect } from "next/navigation";

// Orders already have a real tab inside /account (see AccountView's
// tab === 'orders' branch). ponytail: redirect instead of a second orders UI.
export default function OrdersRedirect() {
  redirect("/account?tab=orders");
}
