import sharedStyles from "../_shared/shared.module.css";
import Card from "../_shared/card/card";

const Activities = () => {
  return (
    <div className={sharedStyles.sectionContainer}>
      <p className={sharedStyles.sectionTitle}>Some Activities</p>

      <div className={sharedStyles.cardsWrapper}>
        <Card summaryText={`Activitieser `} details={`blah blah blah`} />

        <Card summaryText={`Activitieser `} details={`blah blah blah`} />

        <Card summaryText={`Activitieser `} details={`blah blah blah`} />
      </div>
    </div>
  );
};

export default Activities;
