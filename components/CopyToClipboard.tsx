import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Tooltip, Zoom } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import copy from "copy-to-clipboard";
import { FC, useEffect, useState } from "react";
import styles from "./CopyToClipboard.module.css";

const COPY_TO_CLIPBOARD = "Copy to clipboard";

const useDarkStyle = makeStyles((theme) => ({
  arrow: {
    color: "#212121",
  },
  tooltip: {
    backgroundColor: "#212121",
  },
}));

const CopyToClipboard: FC<{
  icon: IconDefinition;
  label: string;
  textToCopy: string;
}> = ({ icon, label, textToCopy }) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipText, setTooltipText] = useState(COPY_TO_CLIPBOARD);
  const [mouseDown, setMouseDown] = useState(true);
  const classes = useDarkStyle();

  useEffect(() => {
    const tId = setTimeout(() => {
      if (!tooltipOpen) setTooltipText(COPY_TO_CLIPBOARD);
    }, 500);
    return () => clearTimeout(tId);
  }, [tooltipOpen]);

  useEffect(() => {
    const mousedownListener = () => setMouseDown(true);
    document.addEventListener("mousedown", mousedownListener);

    const keydownListener = () => setMouseDown(false);
    document.addEventListener("keydown", keydownListener);

    return () => {
      document.removeEventListener("mousedown", mousedownListener);
      document.removeEventListener("keydown", keydownListener);
    };
  }, []);

  return (
    <Tooltip
      TransitionComponent={Zoom}
      open={tooltipOpen}
      onOpen={() => setTooltipOpen(true)}
      onClose={() => setTooltipOpen(false)}
      title={tooltipText}
      placement="bottom"
      classes={classes}
      arrow
      enterTouchDelay={0}
      leaveTouchDelay={1000}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        className={`${styles.main} ${mouseDown ? styles.mouse : ""}`}
        onClick={() => {
          copy(textToCopy);
          setTooltipText("Copied!");
        }}
        tabIndex={0}
        style={{ cursor: "pointer" }}
      >
        <FontAwesomeIcon icon={icon} size="1x" />
        <span style={{ fontWeight: 400 }}>{label}</span>
      </Box>
    </Tooltip>
  );
};

export default CopyToClipboard;
