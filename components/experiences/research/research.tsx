import sharedStyles from "../_shared/shared.module.css";
import Card from "../_shared/card/card";

const Research = () => {
  return (
    <div className={sharedStyles.sectionContainer}>
      <p className={sharedStyles.sectionTitle}>Research</p>

      <div className={sharedStyles.cardsWrapperSingleColumnOnly}>
        <Card
          summaryText={`Researcher @ MIT HCIE Group`}
          details={
            <>
              Jan 2019 - Aug 2021 @ Cambridge, MA. text text text text text text
              text text text text text text text text text text text text text
              text text text text text text text text text text text text text
              text
              <br />
              <br />
              <a href="https://hcie.csail.mit.edu/">Link to hcie lab</a>
            </>
          }
        />
      </div>
    </div>
  );
};

export default Research;
