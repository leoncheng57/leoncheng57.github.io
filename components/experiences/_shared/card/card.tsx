import { ReactNode } from "react";
import styles from "./card.module.css";

const Card = (props: {
  summaryText: string;
  details: ReactNode;
  image?: JSX.Element;
}) => {
  return (
    <div className={styles.card}>
      <p className={styles.summaryText}>
        {/*lintspacer*/}
        {props.summaryText}
        {/*lintspacer*/}
      </p>

      {props.image && (
        <div className={styles.completeImageContainer}>
          <div className={styles.imageWrapperBlurryBackground}>
            {props.image}
          </div>
          <div className={styles.imageWrapper}>{props.image}</div>
        </div>
      )}

      <p>{props.details}</p>
    </div>
  );
};

export default Card;
