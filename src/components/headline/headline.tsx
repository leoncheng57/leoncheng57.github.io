import classNames from "classnames";
import type { NextPage } from "next";
import styles from "./headline.module.css";

const Headline: NextPage = () => {
  return (
    <div className={classNames(styles.container, "GLOBALS-section")}>
      <div className={styles.imageWrapper}>
        <img alt="profile picture" src="./profile-image.png" />
      </div>

      <p className={styles.hi}>Hi, I&#39;m Leon</p>

      <p className={styles.summary}>
        I am a{" "}
        <span className={styles.summaryHighlight}>
          Software Engineer / Learner at Heart
        </span>
        .
      </p>
    </div>
  );
};

export default Headline;
