import { Suspense } from "react";
import SignInForm from "./SignInForm";

export default function Page() {
  <Suspense fallback={<p>Loading...</p>}>
    <SignInForm />
  </Suspense>;
}
