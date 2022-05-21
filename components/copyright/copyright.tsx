import type { NextPage } from "next";
import styles from "./copyright.module.css";

const Copyright: NextPage = () => {
  return (
    <div className={styles.container}>
      <p>© Copyright 2022 Leon Cheng</p>
      <p>Designed and Built using Figma, React, NextJS</p>
    </div>
  );
};

export default Copyright;
