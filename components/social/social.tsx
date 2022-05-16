import classNames from "classnames";
import type { NextPage } from "next";
import Image from "next/image";
import styles from "./social.module.css";

const Social: NextPage = () => {
  return (
    <div className={classNames(styles.container, "GLOBALS-section")}>
      <div className={styles.innerContainer}>
        <div className={styles.handle}>
          <div className={styles.iconImageWrapper}>
            <Image
              alt="github icon"
              src="/icons/github-icon.svg"
              layout="fill"
              objectFit="contain"
            />
          </div>
          <p>
            <a href="https://github.com/leoncheng57/">leoncheng57 </a>
          </p>
        </div>

        <div className={styles.handle}>
          <div className={styles.iconImageWrapper}>
            <Image
              alt="linkedin icon"
              src="/icons/linkedin-icon.svg"
              layout="fill"
              objectFit="contain"
            />
          </div>
          <p>
            <a href="https://www.linkedin.com/in/leoncheng57/">leoncheng57 </a>
          </p>
        </div>

        <div className={styles.handle}>
          <div className={styles.iconImageWrapper}>
            <Image
              alt="email icon"
              src="/icons/email-icon.svg"
              layout="fill"
              objectFit="contain"
            />
          </div>
          <p>
            <a href="#">leonc@mit.edu</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Social;
