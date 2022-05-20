import sharedStyles from "../_shared/shared.module.css";
import Card from "../_shared/card/card";

const Education = () => {
  return (
    <div className={sharedStyles.sectionContainer}>
      <p className={sharedStyles.sectionTitle}>Education</p>

      <div className={sharedStyles.cardsWrapper}>
        <Card
          summaryText={`Master's in Computer Science @ MIT`}
          details={`2021 - 2021 (Concentration in Human Computer Interaction)`}
        />
        <Card
          summaryText={`Bachelor's in Computer Science @ MIT`}
          details={`2016 - 2020`}
        />
        <Card summaryText={`Stuyvesant High School`} details={`2012 - 2016`} />
      </div>
    </div>
  );
};

export default Education;
