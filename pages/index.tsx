import { faCopy } from "@fortawesome/free-regular-svg-icons";
import {
  Box,
  Grid,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import Head from "next/head";
import { FC, useEffect, useRef, useState } from "react";
import { Subject } from "rxjs";
import BadgeContent from "../components/BadgeContent";
import BadgeStyle from "../components/BadgeStyle";
import CopyToClipboard from "../components/CopyToClipboard";
import Footer from "../components/Footer";
import { Badge, DEFAULT_BADGE, getMarkdown, getUrl } from "../utils/badge";
import toValidUsernameObservable from "../utils/observable";
import useKeepVisible from "../utils/use-keep-visible";

const Home: FC = () => {
  const [username$] = useState(() => new Subject<string>());
  const [usernameInput, setUsernameInput] = useState("");
  const [error, setError] = useState("");
  const [badge, setBadge] = useState<Badge>(DEFAULT_BADGE);
  const badgeRef = useRef<HTMLImageElement | null>(null);
  const screenBigEnough = useMediaQuery("(min-width:650px)");

  useEffect(() => {
    const subscription = toValidUsernameObservable(
      username$,
      setError
    ).subscribe((username) => setBadge((b) => ({ ...b, username })));

    return () => subscription.unsubscribe();
  }, []);

  useKeepVisible(badgeRef, 20, 16);

  return (
    <>
      <Head>
        <meta
          name="Description"
          content="Create a badge showing your ranking on LeetCode.com"
        />
        <title>LeetCode Badge Generator</title>
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
      </Head>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Paper
          elevation={3}
          style={{
            margin: "24px",
            padding: "24px 24px 8px 24px",
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            mt={1}
          >
            <Typography variant="h4" align="center">
              LeetCode Badge Generator
            </Typography>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <Box
              mt={4}
              width={256}
              minHeight={96}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="flex-start"
            >
              <TextField
                autoFocus
                id="username"
                label="Your LeetCode username"
                variant="outlined"
                error={!!error}
                helperText={error}
                size="medium"
                value={usernameInput}
                onChange={({ target: { value } }) => {
                  setUsernameInput(value);
                  setError("");
                  username$.next(value);
                }}
                fullWidth
              />
            </Box>
            <Box
              display="flex"
              flexDirection="row"
              alignItems="flex-start"
              justifyContent="space-around"
              flexWrap="wrap"
            >
              <Box
                minWidth={264}
                mt={screenBigEnough ? 1 : 2}
                ml={screenBigEnough ? 2 : 0}
              >
                <BadgeContent badge={badge} setBadge={setBadge} />
              </Box>
              <Box
                minWidth={264}
                mt={screenBigEnough ? 1 : 5}
                mr={screenBigEnough ? -2 : 0}
              >
                <BadgeStyle badge={badge} setBadge={setBadge} />
              </Box>
            </Box>
            <Box
              mt={4}
              minHeight={50}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <img
                ref={badgeRef}
                src={getUrl(badge)}
                alt={badge.username}
                style={{ position: "relative" }}
              />
            </Box>
            <Grid
              container
              spacing={2}
              justify="center"
              style={{ marginTop: "8px" }}
            >
              <Grid item>
                <CopyToClipboard
                  icon={faCopy}
                  label="Image URL"
                  textToCopy={getUrl(badge)}
                />
              </Grid>
              <Grid item>
                <CopyToClipboard
                  icon={faCopy}
                  label="Markdown"
                  textToCopy={getMarkdown(badge)}
                />
              </Grid>
            </Grid>
            <Box mt={4}>
              <Footer />
            </Box>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default Home;
