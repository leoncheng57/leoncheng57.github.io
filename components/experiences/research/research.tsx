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
              Jan 2019 - Aug 2021
              <br />
              <br />
              Honed skills for rapid prototyping and UX. Technologies used:
              React, TypeScript, Netlify, ThreeJS, Arduino, Rhino, Grasshopper,
              Python. <a href="https://hcie.csail.mit.edu/">Link to hcie lab</a>
              .
              <br />
              <br />
              Designed and developed 3D interactive{" "}
              <a href="https://transformers-visualizations.netlify.app/">
                simulation
              </a>{" "}
              for complex magnetic cube block configurations. Secondary writer
              to the conference paper{" "}
              <a href="https://hcie.csail.mit.edu/research/Electrovoxel/electrovoxel.html">
                ElectroVoxel: Electromagnetically Actuated Pivoting for Scalable
                Modular Self-Reconfigurable Robots
              </a>
              .
              <br />
              <br />
              Designed and developed showcase{" "}
              <a href="https://slicehub-sandbox.herokuapp.com/">website </a> for
              3D printing time interpolation ML algorithms for{" "}
              <a href="https://hcie.csail.mit.edu/research/slicehub/slicehub.html">
                SliceHub
              </a>
              .
              <br />
              <br />
              Designed algorithms to automatically lay out electonic sensors on
              variable shapes for{" "}
              <a href="https://hcie.csail.mit.edu/research/morphsensor/morphsensor.html">
                MorphSensor
              </a>
              .
              <br />
              <br />
              Built a refitted prototype coffeemaker for a novel 3D pattern ID
              protocol{" "}
              <a href="https://hcie.csail.mit.edu/research/gid/gid.html">
                G-ID
              </a>
              . <br />
              <br />
            </>
          }
        />
      </div>
    </div>
  );
};

export default Research;
