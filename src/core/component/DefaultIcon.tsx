import styles from "./DefaultIcon.module.scss";

const DefaultIcon: React.FC = () => {
  return (
    <div>
      <a href="/" className={styles.link}>
        <h1
          style={{
            textAlign: "center",
            fontSize: "2rem",
            color: "black",
          }}
        >
          {"TRAVEL"}
        </h1>
      </a>
    </div>
  );
};

export default DefaultIcon;
