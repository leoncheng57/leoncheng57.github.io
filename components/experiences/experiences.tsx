import classNames from "classnames";
import styles from "./experiences.module.css";

const Experiences = () => {
  return (
    <div className={styles.container}>
      <p className={classNames(styles.sectionTitle, "GLOBALS-section")}>
        Company
      </p>
    </div>
  );
};

export default Experiences;
