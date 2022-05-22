import sharedStyles from "../_shared/shared.module.css";
import Card from "../_shared/card/card";

const Activities = () => {
  return (
    <div className={sharedStyles.sectionContainer}>
      <p className={sharedStyles.sectionTitle}>Some Projects & Activities</p>

      <div className={sharedStyles.cardsWrapper}>
        <Card
          summaryText={`Upstyling Nonprofit Design & Website `}
          details={`blah blah blah blah blah blah blah blah blah`}
          image={
            <img
              alt="upstlying project image"
              src="/imagesActivities/upstyling.png"
            />
          }
        />

        <Card
          summaryText={`Solstice Fayemz Website Design `}
          details={`blah blah blah blah blah blah blah blah blah`}
        />

        <Card
          summaryText={`Maynooth Practice Mockup `}
          details={`blah blah blah blah blah blah blah blah blah`}
        />

        <Card
          summaryText={`Adapty Floaty Prototype Device`}
          details={`blah blah blah blah blah blah blah blah blah`}
        />

        <Card
          summaryText={`MIT CETI`}
          details={`blah blah blah blah blah blah blah blah blah`}
          image={
            <img alt="ceti project image" src="/imagesActivities/ceti.jpg" />
          }
        />

        <Card
          summaryText={`MIT-SUTD GLP`}
          details={`blah blah blah blah blah blah blah blah blah`}
        />

        <Card
          summaryText={`StuyHacks Hackathon`}
          details={`blah blah blah blah blah blah blah blah blah`}
        />
      </div>
    </div>
  );
};

export default Activities;
