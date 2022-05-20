import styles from "./industry.module.css";
import sharedStyles from "../_shared/shared.module.css";
import Card from "../_shared/card/card";

const Industry = () => {
  return (
    <div className={sharedStyles.sectionContainer}>
      <p className={sharedStyles.sectionTitle}>Recent Industry</p>

      <div className={sharedStyles.cardsWrapper}>
        <Card
          summaryText={`Fullstack Software Engineer II @ Zoom`}
          details={`Aug 2021 - Present`}
        />

        <Card
          summaryText={`Primary Designer and Frontend Developer @ Stealth Startup in Cloud Analytics`}
          details={`??? - ???`}
        />

        <Card
          summaryText={`Fullstack Intern @ Yext`}
          details={`Jun 2020 - Aug 2020 `}
        />

        <Card
          summaryText={`Fullstack Intern @ Uplift`}
          details={`Jun 2019 - Aug 2019 `}
        />
      </div>
    </div>
  );
};

export default Industry;
