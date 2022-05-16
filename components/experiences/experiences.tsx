import classNames from "classnames";
import styles from "./experiences.module.css";

const Experiences = () => {
  return (
    <div className={classNames(styles.container, "GLOBALS-section")}>
      <p className={styles.sectionTitle}>Company</p>

      <div className={styles.cardsWrapper}>
        <div className={styles.card}>
          <p>Fullstack Developer Intern @ Yext</p>
          <p>Jun 2020 - Aug 2020 @ New York, NY</p>
        </div>

        <div className={styles.card}>
          <p>Fullstack Developer Intern @ Uplift</p>
          <p>Jun 2019 - Aug 2019 @ Menlo Park, CA</p>
        </div>
      </div>
    </div>
  );
};

export default Experiences;
