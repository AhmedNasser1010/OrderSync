import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { object, string, date } from 'yup';
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { addBusiness } from "./rtk/slices/businessesSlice.js"
import { useDispatch } from "react-redux";

// Firebase
import { auth } from "./firebase.js";

// Functions
import _addDoc from "./function/_addDoc.js";
import getCurrentDate from "./function/getCurrentDate.js";
import getCurrentTime24H from "./function/getCurrentTime24H.js";

// Components
import PageTitle from "./Component/PageTitle.jsx";

// Validation Schema
let businessSchema = object({
  businessName: string().required().min(3, "Too Short").max(20, "Too Long"),
  industry: string().required().min(3, "Too Short").max(20, "Too Long"),
  createdOn: object().required(),
  accessToken: string().required(),
  businessOwnerEmail: string().email().required(),
});

const AddNewBusinesse = () => {
	const navigate = useNavigate();
	const [accessToken, setAccessToken] = useState(`${uuidv4()}_${auth.currentUser.uid}`);
	const dispatch = useDispatch();

	return (

		<section className="add-new-businesse theme1">
			<PageTitle title="Add New Businesse +" />
			<Formik
				initialValues={{
					businessName: '',
					businessOwnerEmail: '',
					industry: '',
					createdOn: {
						date: getCurrentDate(),
						time: getCurrentTime24H()
					},
					accessToken: accessToken,
				}}
				validationSchema={businessSchema}
				onSubmit={values => {
					dispatch(addBusiness(values))
					navigate("/businesses?tab=management");
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
							Business Owner Email
							<Field type="email" name="businessOwnerEmail" />
		  				<ErrorMessage name="businessOwnerEmail" render={msg => <span style={{color: "red", fontSize: "14px"}}>{ msg }</span>} />
		  			</label>
		  			<label>
							<Field as="select" name="industry">
								<option value="" label="Indystry Type" />
								<option value="coffe-shop">Coffee Shop</option>
								<option value="restaurant">Restaurant</option>
								<option value="online-shopping">Online Shopping</option>
								<option value="gym-programs">Gym Programs</option>
							</Field>
		  			</label>
		  			<button className="btnTheme" type="submit" disabled={isSubmitting}>Add +</button>
					</Form>
				)}
			</Formik>
		</section>

	)
}

export default AddNewBusinesse;