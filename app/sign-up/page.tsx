import { Suspense } from "react";
import SignUpForm from "./SignUpForm";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SignUpForm />
    </Suspense>
  );
}
