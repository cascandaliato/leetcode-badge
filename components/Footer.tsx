import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Grid, Link, Typography } from "@material-ui/core";
import { FC } from "react";

const Footer: FC = () => (
  <footer>
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Typography variant="caption">
        Built on top of <Link href="https://leetcode.com/">LeetCode.com</Link>{" "}
        and <Link href="https://shields.io/">Shields.io</Link>
      </Typography>
      <Grid
        container
        spacing={2}
        justify="center"
        style={{ marginTop: "-6px" }}
      >
        <Grid item>
          <Link
            href="https://github.com/cascandaliato/"
            color="textPrimary"
            aria-label="Author's GitHub profile"
          >
            <FontAwesomeIcon icon={faGithub} size="lg" />
          </Link>
        </Grid>
        <Grid item>
          <Link
            href="https://twitter.com/cascandaliato"
            color="textPrimary"
            aria-label="Author's Twitter profile"
          >
            <FontAwesomeIcon icon={faTwitter} size="lg" />
          </Link>
        </Grid>
      </Grid>
    </Box>
  </footer>
);

export default Footer;
