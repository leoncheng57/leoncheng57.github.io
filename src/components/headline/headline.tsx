import classNames from "classnames";
import type { NextPage } from "next";
import { getGreeting } from "./greeting";
import styles from "./headline.module.css";

const Headline: NextPage = () => {
  const greeting = getGreeting(new Date().getHours());

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

      <div className={styles.welcomeTab}>
        {greeting.label} <span aria-hidden="true">{greeting.emoji}</span>
      </div>
    </div>
  );
};

export default Headline;
