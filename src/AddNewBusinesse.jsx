import React from "react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { object, string, date } from 'yup';
import _addBuisness from "./function/_addBuisness.js";

let businessSchema = object({
  businessName: string().required().min(4, "Too Short").max(20, "Too Long"),
  industry: string().required().min(4, "Too Short").max(20, "Too Long"),
  createdOn: date().default(() => new Date()),
});

// Components
import PageTitle from "./Component/PageTitle.jsx";

const AddNewBusinesse = () => {

	return (

		<section className="add-new-businesse theme1">
			<PageTitle title="Add New Businesse +" />
			<Formik
				initialValues={{ businessName: '', industry: '', createdOn: new Date() }}
				validationSchema={businessSchema}
				onSubmit={values => {
					console.log(values);
					// _addBuisness("newCollec", values);
				}}
			>
				{({ isSubmitting, values }) => (
					<Form className="">
						<label>
							Business Name
							<Field type="text" name="businessName" />
		  				<ErrorMessage name="businessName" render={msg => <span style={{color: "red", fontSize: "14px"}}>{ msg }</span>} />
		  			</label>
		  			<label>
		  				Select:
							<Field as="select" name="industry">
								<option value="" label="Select an option" />
								<option value="food">food</option>
								<option value="drink">drink</option>
							</Field>
		  			</label>
		  			<button type="submit" disabled={isSubmitting}>Add +</button>
					</Form>
				)}
			</Formik>
		</section>

	)
}

export default AddNewBusinesse;