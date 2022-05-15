import type { NextPage } from "next";
import Image from "next/image";
import styles from "./headline.module.css";

const Headline: NextPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.imageWrapper}>
        <Image
          alt="profile picture"
          src="/profile-image.png"
          layout="fill"
          objectFit="contain"
        />
      </div>

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
