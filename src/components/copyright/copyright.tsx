import type { NextPage } from "next";
import styles from "./copyright.module.css";

const Copyright: NextPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <img alt="upstyling project image" src="./lc-logo.png" />
      </div>
      <p>© Copyright 2022 Leon Cheng</p>
      <p>
        Designed with Figma. Built with TypeScript, React, NextJS. No design
        template used.
      </p>
    </div>
  );
};

export default Copyright;
