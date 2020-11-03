import Head from "next/head";
import { useEffect, useState, FC } from "react";
import { Subject, asyncScheduler } from "rxjs";
import { throttleTime } from "rxjs/operators";
import axios from "axios";

interface LeetCodeStats {
  error: null | string;
  ranking: number | string;
  solved: number | string;
  solvedOverTotal: string;
  solvedPercentage: string;
}

const defaultStats: LeetCodeStats = {
  error: null,
  ranking: 0,
  solved: 0,
  solvedOverTotal: "0/0",
  solvedPercentage: "0.0%",
};

const Home: FC = () => {
  const [subject] = useState(() => new Subject<string>());
  const [stats, setStats] = useState(defaultStats);
  const [username, setUsername] = useState("");

  const getLeetCodeStats = (u: string) => {
    axios
      .get(`/api/users/${u}`)
      .then(({ data }) => data)
      .then(setStats)
      .catch(() => setStats(defaultStats));
  };

  useEffect(() => {
    const subscription = subject
      .pipe(
        throttleTime(400, asyncScheduler, { leading: true, trailing: true })
      )
      .subscribe(getLeetCodeStats);
    return () => subscription.unsubscribe();
  }, []);

  return (
    <main
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <pre>{JSON.stringify(stats, null, 2)}</pre>
      <input
        value={username}
        onChange={({ target: { value } }) => {
          setUsername(value);
          subject.next(value);
        }}
      />
      <object
        data="https://img.shields.io/badge/label-message-blue"
        type="image/svg+xml"
      />
      <img src="https://img.shields.io/badge/label-message-red" />
      {/* <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer> */}
    </main>
  );
};

export default Home;
