import { useState, useEffect } from "react";
import { object, string, array, boolean, number } from "yup";
import { Formik, Form, Field } from "formik";
import fromKebabToTitle from "../functions/fromKebabToTitle";
import { useDispatch, useSelector } from "react-redux";
import { addItem, updateItem } from "../rtk/slices/menuSlice";
import { setSaveToCloudBtnStatus } from "../rtk/slices/conditionalValuesSlice";
import MuiTextField from "./MuiTextField.jsx";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import PlaylistAddCircleIcon from "@mui/icons-material/PlaylistAddCircle";
import Stack from "@mui/material/Stack";
import IconedTitle from "./IconedTitle";
import MenuItem from "@mui/material/MenuItem";

const validationSchema = object({
  title: string().required("Title is required"),
  description: string(),
  category: string().required("Category is required"),
  price: number()
    .typeError("Price must be a number")
    .required("Price is required"),
  sizes: array().of(
    object({
      size: string(),
      price: number().typeError("Price must be a number"),
    })
  ),
  backgrounds: array().of(string()),
  visibility: boolean(),
});

const initialSizesValues = [
  { size: "S", price: "" },
  { size: "M", price: "" },
  { size: "L", price: "" },
];

const AddNewItemDialog = ({
  dialogVisibility,
  handleDialogClose,
  initialValues,
}) => {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.menu.categories);
  const [enabledSized, setEnabledSized] = useState(false);

  useEffect(() => {
    initialValues?.sizes?.length ? setEnabledSized(true) : setEnabledSized(false);
  }, [initialValues])

  const handleEnableSizes = () => {
    setEnabledSized((enabledSized) => !enabledSized);
  };

  const handleSubmit = (values) => {
    const { sizes, ...valuesWithoutSizes } = values;
    const valuesAfterSizes = enabledSized ? values : valuesWithoutSizes;

    // Update or new item
    initialValues.title
      ? dispatch(updateItem(valuesAfterSizes))
      : dispatch(addItem(valuesAfterSizes));

    // After save
    dispatch(setSaveToCloudBtnStatus("ON_CHANGES"));
    handleDialogClose();
  };

  return (
    <Dialog open={dialogVisibility}>
      <DialogTitle>
        <IconedTitle
          icon={
            <PlaylistAddCircleIcon
              sx={{ fontSize: "26px", marginRight: "8px" }}
            />
          }
          title={`Add New Item`}
          variant="h3"
          fontSize="24px"
        />
      </DialogTitle>

      <Formik
        initialValues={{
          ...initialValues,
          sizes: initialValues?.sizes?.length
            ? initialValues?.sizes
            : initialSizesValues,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, values }) => (
          <DialogContent className="md:w-[600px] w-fit">
            <Form>
              <Field
                error={errors.title && touched.title && true}
                helperText={errors.title && touched.title && errors.title}
                component={MuiTextField}
                name="title"
                label="Title"
                fullWidth
                sx={{ marginBottom: "10px", marginTop: "10px" }}
              />

              <Stack direction="row" spacing={1} sx={{ marginBottom: "10px" }}>
                <Field
                  error={errors.category && touched.category && true}
                  helperText={
                    errors.category && touched.category && errors.category
                  }
                  component={MuiTextField}
                  name="category"
                  label="Category"
                  fullWidth
                  select
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {fromKebabToTitle(category.title)}
                    </MenuItem>
                  ))}
                </Field>
                <Field
                  error={errors.price && touched.price && true}
                  helperText={errors.price && touched.price && errors.price}
                  component={MuiTextField}
                  name="price"
                  label="Price"
                  fullWidth
                  disabled={enabledSized}
                />
              </Stack>

              <Field
                sx={{ marginBottom: "10px" }}
                error={errors.description && touched.description && true}
                helperText={
                  errors.description &&
                  touched.description &&
                  errors.description
                }
                component={MuiTextField}
                name="description"
                label="Description"
                fullWidth
              />

              {enabledSized && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ marginBottom: "10px" }}
                >
                  <Field
                    error={
                      errors?.sizes &&
                      errors?.sizes[0]?.price &&
                      touched?.sizes &&
                      touched?.sizes[0]?.price &&
                      true
                    }
                    helperText={
                      errors?.sizes &&
                      errors?.sizes[0]?.price &&
                      touched?.sizes &&
                      touched?.sizes[0]?.price &&
                      errors?.sizes[0]?.price
                    }
                    component={MuiTextField}
                    name="sizes[0].price"
                    label="Small Price"
                  />
                  <Field
                    error={
                      errors?.sizes &&
                      errors?.sizes[1]?.price &&
                      touched?.sizes &&
                      touched?.sizes[1]?.price &&
                      true
                    }
                    helperText={
                      errors?.sizes &&
                      errors?.sizes[1]?.price &&
                      touched?.sizes &&
                      touched?.sizes[1]?.price &&
                      errors?.sizes[1]?.price
                    }
                    component={MuiTextField}
                    name="sizes[1].price"
                    label="Medium Price"
                  />
                  <Field
                    error={
                      errors?.sizes &&
                      errors?.sizes[2]?.price &&
                      touched?.sizes &&
                      touched?.sizes[2]?.price &&
                      true
                    }
                    helperText={
                      errors?.sizes &&
                      errors?.sizes[2]?.price &&
                      touched?.sizes &&
                      touched?.sizes[2]?.price &&
                      errors?.sizes[2]?.price
                    }
                    component={MuiTextField}
                    name="sizes[2].price"
                    label="Large Price"
                  />
                </Stack>
              )}

              <Button
                sx={{ marginBottom: "10px" }}
                onMouseUp={handleEnableSizes}
                startIcon={<PlaylistAddCircleIcon />}
              >
                Enable Sizes
              </Button>

              <DialogActions>
                <Button
                  onMouseUp={handleDialogClose}
                  color="error"
                  startIcon={<CancelIcon />}
                >
                  Cancel
                </Button>
                <Button type="submit" startIcon={<SaveIcon />}>
                  Save
                </Button>
              </DialogActions>
            </Form>
          </DialogContent>
        )}
      </Formik>
    </Dialog>
  );
};

export default AddNewItemDialog;
