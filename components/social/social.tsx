import type { NextPage } from "next";
import Image from "next/image";
// import styles from "./social.module.css";

const Social: NextPage = () => {
  return (
    <div>
      <p>hello hello, social here</p>
      <Image
        alt="github icon"
        src="/icons/github-icon.svg"
        height="50rem"
        width="50rem"
      />
    </div>
  );
};

export default Social;
