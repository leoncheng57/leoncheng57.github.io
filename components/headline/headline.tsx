import type { NextPage } from "next";
import Image from "next/image";
import styles from "./headline.module.css";

const Headline: NextPage = () => {
  return (
    <div className={styles.container}>
      <Image alt="profile picture" src="/" width="100px" height="100px" />

      <p className={styles.hi}>Hi, I'm Leon</p>

      <p className={styles.summary}>
        I am a{" "}
        <span className={styles.summaryHighlight}>
          Fullstack Software Engineer
        </span>
        .
      </p>

      <p className={styles.extraText}>
        {" "}
        I also enjoy UX design and rapid prototyping.
      </p>
    </div>
  );
};

export default Headline;
