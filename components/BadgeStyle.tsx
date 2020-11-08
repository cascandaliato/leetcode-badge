import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@material-ui/core";
import { Dispatch, FC, SetStateAction } from "react";
import { Badge, styles } from "../utils/badge";

const BadgeStyle: FC<{
  badge: Badge;
  setBadge: Dispatch<SetStateAction<Badge>>;
}> = ({ badge, setBadge }) => (
  <FormControl component="fieldset">
    <FormLabel component="legend">Style</FormLabel>
    <RadioGroup
      aria-label="style"
      name="style"
      value={badge.style}
      onChange={({ target: { value } }) => {
        setBadge((b) => ({
          ...b,
          style: value as Badge["style"],
        }));
      }}
      style={{ marginTop: "8px" }}
    >
      {Object.entries(styles).map(([name, { width, height }]) => (
        <FormControlLabel
          key={name}
          value={name}
          control={<Radio color="primary" />}
          label={
            <img
              src={`style-${name}.svg`}
              alt={`badge style "${name.replace("-", " ")}"`}
              width={width}
              height={height}
            />
          }
        />
      ))}
    </RadioGroup>
  </FormControl>
);

export default BadgeStyle;
