import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Fab from "@material-ui/core/Fab";
import MenuIcon from "@material-ui/icons/Menu";
import { CirclePicker } from "react-color";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(3)
  }
}));

const DrawingSettingsDialog = ({ handleDrawingSettings }) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [color, setColor] = React.useState("#e91e63");
  const [operation, setOperation] = React.useState("1");

  const handleOperationChange = event => {
    setOperation(event.target.value);
  };

  const handleColorChangeComplete = color => {
    setColor(color.hex);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    handleDrawingSettings(
      parseInt(operation, 10),
      parseInt(Number(color.replace("#", "0x")), 10)
    );
    setOpen(false);
  };

  return (
    <div>
      <Fab
        color="default"
        aria-label="menu"
        size="small"
        onClick={() => handleClickOpen()}
      >
        <MenuIcon />
      </Fab>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogContent>
          <FormControl component="fieldset" className={classes.formControl}>
            <RadioGroup
              aria-label="operation"
              name="operation"
              value={operation}
              onChange={handleOperationChange}
            >
              <FormControlLabel value="1" control={<Radio />} label="Insert" />
              <FormControlLabel value="2" control={<Radio />} label="Update" />
              <FormControlLabel value="3" control={<Radio />} label="Delete" />
            </RadioGroup>
          </FormControl>
          <CirclePicker
            color={color}
            onChangeComplete={handleColorChangeComplete}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DrawingSettingsDialog;
