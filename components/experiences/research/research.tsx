import sharedStyles from "../_shared/shared.module.css";
import Card from "../_shared/card/card";
import Image from "next/image";

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
          image={
            <Image
              alt="transformers project image"
              src="/imagesActivities/transformers-cubes.png"
              layout="fill"
              objectFit="cover"
            />
          }
        />
      </div>
    </div>
  );
};

export default Research;
