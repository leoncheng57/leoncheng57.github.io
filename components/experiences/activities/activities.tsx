import sharedStyles from "../_shared/shared.module.css";
import Card from "../_shared/card/card";

const Activities = () => {
  return (
    <div className={sharedStyles.sectionContainer}>
      <p className={sharedStyles.sectionTitle}>Some Projects & Activities</p>

      <div className={sharedStyles.cardsWrapper}>
        <Card
          summaryText={`Stuyvesant Mentoring Program`}
          details={
            <>
              Remotely mentor high school students. Focus on advising for
              long-term career success and personal happiness.
            </>
          }
          image={
            <img
              alt="stuyvesant mentoring project image"
              src="./imagesActivities/stuyvesant.jpg"
            />
          }
        />

        <Card
          summaryText={`Upstyling Nonprofit Design & Website `}
          details={
            <>
              Collaborated with nonprofit to develop a brand website. See Adobe
              XD mockups for{" "}
              <a href="https://xd.adobe.com/view/ccdb2cc6-62bd-4255-9323-0965bdc5663a-9988/">
                Mobile
              </a>{" "}
              and{" "}
              <a href="https://xd.adobe.com/view/39493f1d-21c8-403f-a85d-62ea41079bb4-6c1a/">
                Desktop
              </a>
              , as well as public website at{" "}
              <a href="https://upstyling.github.io/">upstyling.github.io</a>.
            </>
          }
          image={
            <img
              alt="upstyling project image"
              src="./imagesActivities/upstyling.png"
            />
          }
        />

        <Card
          summaryText={`Solstice Fayemz Design Mockup`}
          details={
            <>
              Collaborated with the singer/songwriter to develop a website
              design that conveyed their taste and passion. You can view the
              Adobe XD mockup{" "}
              <a href="https://xd.adobe.com/view/7dc95ca3-6a53-40a6-b813-4c7250d6e2e9-289a/screen/52df4fba-9a19-47a6-bc26-5fb9a2f1a725/">
                here
              </a>
              .
            </>
          }
          image={
            <img
              alt="solstice project image"
              src="./imagesActivities/solstice.png"
            />
          }
        />

        <Card
          summaryText={`MIT Teaching Assistant`}
          details={
            <>
              TA for Interconnected Embedded Systems and Computation Structures
              courses.
            </>
          }
          image={
            <img
              alt="mit teaching assistant image"
              src="./imagesActivities/mit.png"
            />
          }
        />

        <Card
          summaryText={`StartLabs Club Website`}
          details={
            <>
              Led the website development department to build a new site using
              Flask, FastCGI, and JS. Designed by the design department. See
              current site at{" "}
              <a href="http://startup.mit.edu/">startup.mit.edu</a>.
            </>
          }
          image={
            <img
              alt="startlabs club image"
              src="./imagesActivities/startlabs.png"
            />
          }
        />

        <Card
          summaryText={`Adapty Floaty Prototype Assistive Floatation Device Project`}
          details={
            <>
              Worked in a team of 2 MIT students to build an interactive device
              that can intelligently adapt to the user's needs. Device will
              inflate as you sink deeper and deflate as you float higher, to be
              used for swim training. See more{" "}
              <a href="https://leoncheng.dev/Adapty-Floaty/">here</a>.
            </>
          }
          image={
            <img
              alt="adapty floaty project image"
              src="./imagesActivities/adaptyfloaty.png"
            />
          }
        />

        <Card
          summaryText={`CETI Teaching & Leadership Program`}
          details={
            <>
              Created and taught lessons on web development and python
              programming to local students in Asia. See some lessons{" "}
              <a href="https://leoncheng.dev/MYCamp-Web-Dev-Lessons/">here</a>.
            </>
          }
          image={
            <img alt="ceti project image" src="./imagesActivities/ceti.jpg" />
          }
        />

        <Card
          summaryText={`MIT-SUTD Global Leadership Program`}
          details={
            <>
              Learned how to build a full electric boat using power tools,
              computer aided design, and other fabrication materials in a team
              with students from Singapore. Short video{" "}
              <a href="https://www.youtube.com/watch?v=-eT_rZoE87s&ab_channel=JunWenLoo">
                here
              </a>
              .
            </>
          }
          image={
            <img alt="glp project image" src="./imagesActivities/glp.png" />
          }
        />

        <Card
          summaryText={`Organizer for StuyHacks Hackathon`}
          details={
            <>
              Recruited company sponsors and organized prizes to help make the
              fun high school hackathon possible.
            </>
          }
          image={
            <img alt="stuyhacks image" src="./imagesActivities/stuyhacks.jpg" />
          }
        />
      </div>
    </div>
  );
};

export default Activities;
