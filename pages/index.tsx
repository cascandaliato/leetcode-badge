import { useEffect, useState, FC } from "react";
import { Subject } from "rxjs";
import {
  distinctUntilChanged,
  filter,
  debounceTime,
  switchMap,
} from "rxjs/operators";
import axios from "axios";
import { TextField, Grid, Box, Paper } from "@material-ui/core";

interface Badge {
  username: string;
  style: "flat" | "flat-square" | "plastic" | "for-the-badge" | "social";
  labelColor: string;
  color: string;
  label: string;
  value: "ranking" | "solved" | "solvedOverTotal" | "solvedPercentage";
  showLogo: boolean;
  logoColor: string;
}

const Home: FC = () => {
  const [username$] = useState(() => new Subject<string>());
  const [usernameInput, setUsernameInput] = useState("");
  const [error, setError] = useState("");
  const [badge, setBadge] = useState<Badge>({
    username: "cascandaliato",
    style: "for-the-badge",
    labelColor: "black",
    color: "#ffa116",
    label: "Solved",
    value: "solvedOverTotal",
    showLogo: true,
    logoColor: "yellow",
  });

  const getLeetCodeStats = (u: string) => {
    axios
      .get(`/api/users/${u}`)
      .then(({ data: { error: e } }) => e)
      .then((e) => {
        if (e) {
          setError(e);
        } else {
          setBadge((b) => ({ ...b, username: u }));
        }
      })
      .catch((e) => setError("Couldn't retrieve user"));
  };

  useEffect(() => {
    const subscription = username$
      .pipe(
        filter((value) => !!value),
        distinctUntilChanged(),
        debounceTime(500)
      )
      .subscribe(getLeetCodeStats);
    return () => subscription.unsubscribe();
  }, []);
  //   <Head>
  //         <title>LeetCode Badge</title>
  //         <link rel="icon" href="/favicon.ico" />
  //       </Head>
  return (
    <Grid
      container
      spacing={2}
      direction="column"
      alignItems="center"
      justify="center"
      style={{ minHeight: "100vh" }}
    >
      <Paper>
        <Box p={2}>
          <Grid item>
            <TextField
              id="username"
              label="Username"
              variant="outlined"
              error={!!error}
              helperText={error}
              size="small"
              // required={true}
              // placeholder="Your LeetCode username"
              value={usernameInput}
              onChange={({ target: { value } }) => {
                setUsernameInput(value);
                setError("");
                username$.next(value);
              }}
            />
          </Grid>
          <Grid item>
            <img
              src={`https://img.shields.io/badge/dynamic/json?style=${
                badge.style
              }&labelColor=${encodeURIComponent(
                badge.labelColor
              )}&color=${encodeURIComponent(
                badge.color
              )}&label=${encodeURIComponent(badge.label)}&query=${
                badge.value
              }&url=https%3A%2F%2Fleetcode-badge.vercel.app%2Fapi%2Fusers%2F${encodeURIComponent(
                badge.username
              )}${
                badge.showLogo
                  ? `&logo=leetcode&logoColor=${encodeURIComponent(
                      badge.logoColor
                    )}`
                  : ""
              }`}
            />
          </Grid>
          <Grid item>
            <pre>
              {JSON.stringify({ usernameInput, error, badge }, null, 2)}
            </pre>
          </Grid>
        </Box>
      </Paper>
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
    </Grid>
  );
};

export default Home;

// Observable.create((observer) => {
//   const controller = new AbortController();
//   const signal = controller.signal;

//   fetch(url, { signal })
//     .then((response) => {
//       if (response.ok) {
//         return response.json();
//       } else {
//         observer.error("Request failed with status code: " + response.status);
//       }
//     })
//     .then((body) => {
//       observer.next(body);

//       observer.complete();
//     })
//     .catch((err) => {
//       observer.error(err);
//     });

//   return () => controller.abort();
// });
//------------------------------------------------
// const CancelToken = axios.CancelToken;
// const source = CancelToken.source();

// axios
//   .get("/user/12345", {
//     cancelToken: source.token,
//   })
//   .catch(function (thrown) {
//     if (axios.isCancel(thrown)) {
//       console.log("Request canceled", thrown.message);
//     } else {
//       // handle error
//     }
//   });

// axios.post(
//   "/user/12345",
//   {
//     name: "new name",
//   },
//   {
//     cancelToken: source.token,
//   }
// );

// // cancel the request (the message parameter is optional)
// source.cancel("Operation canceled by the user.");
