import type { NextPage } from "next";
import Image from "next/image";
import styles from "./headline.module.css";

const Headline: NextPage = () => {
  return (
    <div className={styles.container}>
      <Image alt="profile picture" src="/" width="100px" height="100px" />

      <p>Hi, I'm Leon</p>

      <p>I am a Fullstack Software Engineer.</p>

      <p> I also enjoy UX design and rapid prototyping.</p>
    </div>
  );
};

export default Headline;
