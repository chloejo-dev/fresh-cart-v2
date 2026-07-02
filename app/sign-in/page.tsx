import { Suspense } from "react";
import SignInForm from "./SignInForm";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SignInForm />
    </Suspense>
  );
}
