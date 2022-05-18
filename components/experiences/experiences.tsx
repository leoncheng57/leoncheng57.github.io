import classNames from "classnames";
import Activities from "./activities/activities";
import styles from "./experiences.module.css";
import Industry from "./industry/industry";
import Research from "./research/research";

const Experiences = () => {
  return (
    <div className={classNames(styles.container, "GLOBALS-section")}>
      <Industry />
      <Research />
      <Activities />
    </div>
  );
};

export default Experiences;
