import type { NextPage } from "next";
import Image from "next/image";
import styles from "./social.module.css";

const Social: NextPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <p>hello hello, social here</p>
        <div className={styles.iconImageWrapper}>
          <Image
            alt="github icon"
            src="/icons/github-icon.svg"
            height="50rem"
            width="50rem"
          />
        </div>
      </div>
    </div>
  );
};

export default Social;
