import type { NextPage } from "next";
import styles from "./social.module.css";

const Social: NextPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <a
          className={styles.handle}
          href="https://github.com/leoncheng57/"
          aria-label="Leon Cheng on GitHub"
          title="GitHub"
        >
          <img alt="" src="./icons/github-icon.svg" />
        </a>
        <a
          className={styles.handle}
          href="mailto:leonc@alum.mit.edu"
          aria-label="Email Leon Cheng"
          title="leonc@alum.mit.edu"
        >
          <img alt="" src="./icons/email-icon.svg" />
        </a>
      </div>
    </div>
  );
};

export default Social;
