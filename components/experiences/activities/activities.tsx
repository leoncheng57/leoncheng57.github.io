import sharedStyles from "../_shared/shared.module.css";
import Card from "../_shared/card/card";

const Activities = () => {
  return (
    <div className={sharedStyles.sectionContainer}>
      <p className={sharedStyles.sectionTitle}>Some Projects & Activities</p>

      <div className={sharedStyles.cardsWrapper}>
        <Card
          summaryText={`Stuyvesant Mentoring Program`}
          details={`blah blah blah blah blah blah blah blah blah`}
        />

        <Card
          summaryText={`Upstyling Nonprofit Design & Website `}
          details={`blah blah blah blah blah blah blah blah blah`}
          image={
            <img
              alt="upstlying project image"
              src="./imagesActivities/upstyling.png"
            />
          }
        />

        <Card
          summaryText={`Solstice Fayemz Design Mockup`}
          details={`blah blah blah blah blah blah blah blah blah`}
          image={
            <img
              alt="upstlying project image"
              src="https://leoncheng.dev/images/solstice.png"
            />
          }
        />

        <Card
          summaryText={`MIT Teaching Assistant`}
          details={`blah blah blah blah blah blah blah blah blah`}
        />

        <Card
          summaryText={`StartLabs Club Website`}
          details={`blah blah blah blah blah blah blah blah blah`}
        />

        <Card
          summaryText={`Adapty Floaty Prototype Assistive Floatation Device Project`}
          details={`blah blah blah blah blah blah blah blah blah`}
        />

        <Card
          summaryText={`CETI Teaching & Leadership Program`}
          details={`blah blah blah blah blah blah blah blah blah`}
          image={
            <img alt="ceti project image" src="./imagesActivities/ceti.jpg" />
          }
        />

        <Card
          summaryText={`Organizer for StuyHacks Hackathon`}
          details={`blah blah blah blah blah blah blah blah blah`}
        />
      </div>
    </div>
  );
};

export default Activities;
