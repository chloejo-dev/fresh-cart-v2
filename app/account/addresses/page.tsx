import { Suspense } from "react";
import AddressForm from "./AddressForm";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AddressForm />
    </Suspense>
  );
}
