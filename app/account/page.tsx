"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  username: string;
  email: string;
  joined_date: string;
};

export default function Page() {
  const [currentUser, setCurrentUser] = useState<User>();
  const [signInErr, setSignInErr] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    // Make a GET request to fetch current user info
    const fetchUser = async () => {
      // User sign in?
      const res = await fetch("/api/me");
      // N:
      if (!res.ok) {
        console.log("Please sign in");
        router.push("/sign-in");
        return;
      }
      // Y:
      const data = await res.json();
      setCurrentUser(data);
      console.log(data);
    };

    fetchUser();
  }, []);

  if (!currentUser) {
    return <p>Please sign in...</p>;
  }

  return (
    <div>
      <p>{currentUser.username}</p>
      <p>{currentUser.email}</p>
      <p>{currentUser.joined_date}</p>
    </div>
  );
}
