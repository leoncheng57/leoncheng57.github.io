import sharedStyles from "../_shared/shared.module.css";
import Card from "../_shared/card/card";

const Research = () => {
  return (
    <div className={sharedStyles.sectionContainer}>
      <p className={sharedStyles.sectionTitle}>Research</p>

      <div className={sharedStyles.cardsWrapperSingleColumnOnly}>
        <Card
          summaryText={
            <>
              Researcher @{" "}
              <a href="https://hcie.csail.mit.edu/">
                MIT Human Computer Interaction Engineering Group
              </a>
            </>
          }
          image={
            <img
              alt="electrovoxel project image"
              src="./imagesActivities/electrovoxel.png"
            />
          }
          details={
            <>
              Jan 2019 - Aug 2021
              <br />
              <br />
              Honed skills for rapid prototyping and UX. Technologies used
              include React, TypeScript, Netlify, ThreeJS, Arduino, Rhino,
              Grasshopper, Python. .
              <br />
              <br />
              <a href="https://hcie.csail.mit.edu/research/Electrovoxel/electrovoxel.html">
                ElectroVoxel paper
              </a>
              : Designed and developed 3D interactive{" "}
              <a href="https://transformers-visualizations.netlify.app/">
                simulation
              </a>{" "}
              for complex magnetic cube block configurations. Secondary writer
              to the conference paper.
              <br />
              <br />
              <a href="https://hcie.csail.mit.edu/research/slicehub/slicehub.html">
                SliceHub paper
              </a>
              : Designed and developed{" "}
              <a href="https://slicehub-sandbox.herokuapp.com/">website </a> for
              3D model printing time interpolation ML algorithms.
              <br />
              <br />
              <a href="https://hcie.csail.mit.edu/research/morphsensor/morphsensor.html">
                MorphSensor paper
              </a>
              : Designed algorithms to automatically lay out electonic sensors
              on variable shapes.
              <br />
              <br />
              <a href="https://hcie.csail.mit.edu/research/gid/gid.html">
                G-ID paper
              </a>
              : Built a refitted prototype coffeemaker for a novel 3D pattern ID
              protocol.
              <br />
              <br />
            </>
          }
        />
      </div>
    </div>
  );
};

export default Research;
