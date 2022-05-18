import styles from "./industry.module.css";
import sharedStyles from "../_shared/shared.module.css";
import Card from "../_shared/card/card";

const Industry = () => {
  return (
    <div className={sharedStyles.sectionContainer}>
      <p className={sharedStyles.sectionTitle}>Industry</p>

      <div className={sharedStyles.cardsWrapper}>
        <Card
          summaryText={`Fullstack Software Engineer II @ Zoom`}
          details={`Aug 2021 - Present @ Remote `}
        />

        <Card
          summaryText={`Primary Designer and Frontend Developer @ Stealth Startup in Cloud Analytics`}
          details={`??? - ??? @ Cambridge, MA`}
        />

        <Card
          summaryText={`Fullstack Developer Intern @ Yext`}
          details={`Jun 2020 - Aug 2020 @ New York, NY`}
        />

        <Card
          summaryText={`Fullstack Developer Intern @ Uplift`}
          details={`Jun 2019 - Aug 2019 @ Menlo Park, CA`}
        />

        <Card
          summaryText={`Backend Developer Intern @ Hosta Labs`}
          details={`Jun 2020 - Aug 2020 @ Cambridge, MA`}
        />

        <Card
          summaryText={`Web Developer Intern @ New York Life`}
          details={`Jun 2016 - Aug 2016 @ New York, NY`}
        />

        <Card
          summaryText={`Civil Engineering Intern @ NYC Department of Design and Construction`}
          details={`??? - ??? @ New York, NY`}
        />
      </div>
    </div>
  );
};

export default Industry;
