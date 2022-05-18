import styles from "./industry.module.css";
import experiencesSharedStyles from "../experiencesShared.module.css";

const Industry = () => {
  return (
    <div>
      <p className={experiencesSharedStyles.sectionTitle}>Industry</p>

      <div className={experiencesSharedStyles.cardsWrapper}>
        <div className={experiencesSharedStyles.card}>
          <p className={experiencesSharedStyles.summaryText}>
            Fullstack Software Engineer II @ Zoom
          </p>
          <p>Aug 2021 - Present @ Remote </p>
        </div>

        <div className={experiencesSharedStyles.card}>
          <p className={experiencesSharedStyles.summaryText}>
            Primary Designer and Frontend Developer @ Stealth Startup in Cloud
            Analytics
          </p>
          <p> ??? - ??? @ Cambridge, MA</p>
        </div>

        <div className={experiencesSharedStyles.card}>
          <p className={experiencesSharedStyles.summaryText}>
            Fullstack Developer Intern @ Yext
          </p>
          <p>Jun 2020 - Aug 2020 @ New York, NY</p>
        </div>

        <div className={experiencesSharedStyles.card}>
          <p className={experiencesSharedStyles.summaryText}>
            Fullstack Developer Intern @ Uplift
          </p>
          <p>Jun 2019 - Aug 2019 @ Menlo Park, CA</p>
        </div>

        <div className={experiencesSharedStyles.card}>
          <p className={experiencesSharedStyles.summaryText}>
            Backend Developer Intern @ Hosta Labs
          </p>
          <p>Jun 2020 - Aug 2020 @ Cambridge, MA</p>
        </div>

        <div className={experiencesSharedStyles.card}>
          <p className={experiencesSharedStyles.summaryText}>
            Web Developer Intern @ New York Life
          </p>
          <p>Jun 2016 - Aug 2016 @ New York, NY</p>
        </div>

        <div className={experiencesSharedStyles.card}>
          <p className={experiencesSharedStyles.summaryText}>
            Civil Engineering Intern @ NYC Department of Design and Construction
          </p>
          <p>??? - ??? @ New York, NY</p>
        </div>
      </div>
    </div>
  );
};

export default Industry;
