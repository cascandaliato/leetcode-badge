import CssBaseline from "@material-ui/core/CssBaseline";
import { AppProps } from "next/app";

const MyApp = ({ Component, pageProps }: AppProps) => (
  <>
    <CssBaseline />
    <Component {...pageProps} />
  </>
);

export default MyApp;
