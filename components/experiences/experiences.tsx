import classNames from "classnames";
import styles from "./experiences.module.css";

const Experiences = () => {
  return (
    <div className={classNames(styles.container, "GLOBALS-section")}>
      <p className={styles.sectionTitle}>Company</p>

      <div className={styles.cardsWrapper}>
        <div className={styles.card}>
          <p>Summary Phrase</p>
          <p>
            text text text text text text text text text text text text text
            text text text{" "}
          </p>
        </div>

        <div className={styles.card}>
          <p>Summary Phrase</p>
          <p>
            text text text text text text text text text text text text text
            text text text{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Experiences;
