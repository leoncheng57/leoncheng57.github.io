import type { NextPage } from "next";
import styles from "./copyright.module.css";

const Copyright: NextPage = () => {
  return (
    <div className={styles.container}>
      <p>© Copyright 2022 Leon Cheng</p>
      <p>
        Designed with Figma. Built with TypeScript, React, NextJS. No template
        used.
      </p>
    </div>
  );
};

export default Copyright;
