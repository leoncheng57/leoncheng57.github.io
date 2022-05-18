import styles from "./card.module.css";

const Card = (props: { summaryText: string; details: string }) => {
  return (
    <div className={styles.card}>
      <p className={styles.summaryText}>{props.summaryText}</p>
      <p>{props.details}</p>
    </div>
  );
};

export default Card;
