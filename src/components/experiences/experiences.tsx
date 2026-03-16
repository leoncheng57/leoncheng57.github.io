import classNames from "classnames";
import Activities from "./activities/activities";
import Education from "./education/education";
import styles from "./experiences.module.css";
// import Industry from "./industry/industry";
import Research from "./research/research";

const Experiences = () => {
  return (
    <div className={classNames(styles.container, "GLOBALS-section")}>
      <Education />
      {/* <Industry /> */}
      <Research />
      <hr />
      <Activities />
    </div>
  );
};

export default Experiences;
