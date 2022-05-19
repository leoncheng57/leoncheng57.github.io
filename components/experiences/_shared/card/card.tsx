import { ReactNode } from "react";
import styles from "./card.module.css";

const Card = (props: { summaryText: string; details: ReactNode }) => {
  return (
    <div className={styles.card}>
      <p className={styles.summaryText}>
        {/*lintspacer*/}
        {props.summaryText}
        {/*lintspacer*/}
      </p>
      <p>{props.details}</p>
    </div>
  );
};

export default Card;
