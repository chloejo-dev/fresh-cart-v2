"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Search.module.css";

export default function Search() {
  const [searchWord, setSearchWord] = useState("");
  const router = useRouter();

  return (
    <>
      <form
        className={styles.searchContainer}
        onSubmit={(e) => {
          e.preventDefault();
          if (!searchWord.trim()) return;
          console.log(searchWord);
          router.push(`/search?searchWord=${encodeURIComponent(searchWord)}`);
        }}
      >
        <input
          type='text'
          placeholder='Search fresh produce, dairy...'
          className={styles.searchBar}
          value={searchWord}
          onChange={(e) => {
            setSearchWord(e.target.value);
          }}
        />
        <button type='submit' className={styles.searchButton}>
          🔍
        </button>
      </form>
    </>
  );
}
