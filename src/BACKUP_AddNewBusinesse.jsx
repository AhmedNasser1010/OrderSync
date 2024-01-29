import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { object, string, date, array, boolean } from 'yup';
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { addBusiness } from "./rtk/slices/businessesSlice.js";
import { pushAccesTokenToTheUser } from "./rtk/slices/userSlice.js";
import { useDispatch } from "react-redux";

// Firebase
import { auth } from "./firebase.js";

// Functions
import _addDoc from "./function/_addDoc.js";
import getCurrentDate from "./function/getCurrentDate.js";
import getCurrentTime24H from "./function/getCurrentTime24H.js";

// Components
import PageTitle from "./Component/PageTitle.jsx";
import H3 from "./Component/H3.jsx";

// RegEx
const phoneNumberRegex = /^\+(\d{12})$/;
const locationCodeRegex = /^(\d{1,2})°(\d{1,2})'(\d{1,2}\.\d{1})"([NS])\s+(\d{1,3})°(\d{1,2})'(\d{1,2}\.\d{1})"([EW])$/;
// 26°50'49.1"N 29°44'20.4"E
const timeRegex = /^\d{2}:\d{2}$/;

// Validation Schema
let businessSchema = object({
  accessToken: string().required(),
  owner: object({
  	name: string().required().min(3, "Too Short").max(20, "Too Long"),
  	email: string().email().required(),
  	phone: string().matches(phoneNumberRegex, 'Phone number is not valid'),
  }),
  business: object({
  	name: string().required().min(3, "Too Short").max(20, "Too Long"),
  	industry: string().required(),
  	address: string().required(),
  	location: string().matches(locationCodeRegex, "Location code are not valid"),
  }),
  services: object({
  	openingHourse: object({
  		sunday: array().of(string()),
  		monday: array().of(string()),
  		tuesday: array().of(string()),
  		wednesday: array().of(string()),
  		thursday: array().of(string()),
  		friday: array().of(string()),
  		saturday: array().of(string()),
  	}),
  	paymentMethods: object({
  		cash: boolean(),
			vodafoneCash: boolean(),
			etisalatCash: boolean(),
  	})
  }),
  createdOn: object({
  	date: string().required(),
  	time: string().required(),
  }),
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
					accessToken: accessToken,
					owner: {
						name: '',
						email: '',
						phone: '',
					},
					business: {
						name: '',
						industry: '',
						address: '',
						location: '',
					},
					services: {
						openingHourse: {
  						sunday: ['', ''],
							monday: ['', ''],
  						tuesday: ['', ''],
  						wednesday: ['', ''],
  						thursday: ['', ''],
  						friday: ['', ''],
  						saturday: ['', ''],
						},
						paymentMethods: {
							cash: false,
							vodafoneCash: false,
							etisalatCash: false,
						},
					},
					createdOn: {
						date: getCurrentDate(),
						time: getCurrentTime24H(),
					},
				}}
				validationSchema={businessSchema}
				onSubmit={values => {
					dispatch(addBusiness(values));
					dispatch(pushAccesTokenToTheUser(values.accessToken));
					navigate("/businesses?tab=management");
				}}
			>
				{({ isSubmitting, values }) => (
					<Form className="">
						<div className="form-widget owner-info">
							<H3 text="Owner Info:" />
							<label>
								Name
								<Field type="text" name="owner.name" />
		  					<ErrorMessage name="owner.name" render={msg => <span style={{color: "red", fontSize: "14px"}}>{ msg }</span>} />
		  				</label>
		  				<label>
								Email
								<Field type="text" name="owner.email" />
		  					<ErrorMessage name="owner.email" render={msg => <span style={{color: "red", fontSize: "14px"}}>{ msg }</span>} />
		  				</label>
		  				<label>
								Phone
								<Field type="text" name="owner.phone" />
		  					<ErrorMessage name="owner.phone" render={msg => <span style={{color: "red", fontSize: "14px"}}>{ msg }</span>} />
		  				</label>
		  			</div>
		  			<div className="form-widget business-info">
							<H3 text="Business Info:" />
		  				<label>
								Name
								<Field type="text" name="business.name" />
		  					<ErrorMessage name="business.name" render={msg => <span style={{color: "red", fontSize: "14px"}}>{ msg }</span>} />
		  				</label>
		  				<label>
								<Field as="select" name="business.industry">
									<option value="" label="Indystry Type" />
									<option value="coffe-shop">Coffee Shop</option>
									<option value="restaurant">Restaurant</option>
									<option value="online-shopping">Online Shopping</option>
									<option value="gym-programs">Gym Programs</option>
								</Field>
		  				</label>
		  				<label>
								Address
								<Field type="text" name="business.address" />
		  					<ErrorMessage name="business.address" render={msg => <span style={{color: "red", fontSize: "14px"}}>{ msg }</span>} />
		  				</label>
		  				<label>
								Location
								<Field type="text" name="business.location" />
		  					<ErrorMessage name="business.location" render={msg => <span style={{color: "red", fontSize: "14px"}}>{ msg }</span>} />
		  				</label>
		  			</div>
		  			<div className="form-widget services">
		  				<H3 text="Services:" />
		  				<label>
		  					Opening Hours<br />
								Sunday:----From <Field type="text" name="services.openingHourse.sunday[0]" style={{width: "7%", display: "inline-block"}} /> To <Field type="text" name="services.openingHourse.sunday[1]" style={{width: "7%", display: "inline-block"}} /><br />
								Monday:----From <Field type="text" name="services.openingHourse.monday[0]" style={{width: "7%", display: "inline-block"}} /> To <Field type="text" name="services.openingHourse.monday[1]" style={{width: "7%", display: "inline-block"}} /><br />
								Tuesday:---From <Field type="text" name="services.openingHourse.tuesday[0]" style={{width: "7%", display: "inline-block"}} /> To <Field type="text" name="services.openingHourse.tuesday[1]" style={{width: "7%", display: "inline-block"}} /><br />
								Wednesday:-From <Field type="text" name="services.openingHourse.wednesday[0]" style={{width: "7%", display: "inline-block"}} /> To <Field type="text" name="services.openingHourse.wednesday[1]" style={{width: "7%", display: "inline-block"}} /><br />
								Thursday:--From <Field type="text" name="services.openingHourse.thursday[0]" style={{width: "7%", display: "inline-block"}} /> To <Field type="text" name="services.openingHourse.thursday[1]" style={{width: "7%", display: "inline-block"}} /><br />
								Friday:----From <Field type="text" name="services.openingHourse.friday[0]" style={{width: "7%", display: "inline-block"}} /> To <Field type="text" name="services.openingHourse.friday[1]" style={{width: "7%", display: "inline-block"}} /><br />
								Saturday:--From <Field type="text" name="services.openingHourse.saturday[0]" style={{width: "7%", display: "inline-block"}} /> To <Field type="text" name="services.openingHourse.saturday[1]" style={{width: "7%", display: "inline-block"}} /><br />
		  				</label>
		  				<label>Payment Methods</label>
		  				<label>
								<Field type="checkbox" name="services.paymentMethods.cash" />
		  					Cash
		  				</label>
		  				<label>
								<Field type="checkbox" name="services.paymentMethods.vodafoneCash" disabled={true} />
		  					Vodafone Cash
		  				</label>
		  				<label>
								<Field type="checkbox" name="services.paymentMethods.etisalatCash" disabled={true} />
		  					Etisalat Cash
		  				</label>
		  			</div>
		  			<button className="btnTheme" type="submit" disabled={isSubmitting}>Add +</button>
					</Form>
				)}
			</Formik>
		</section>

	)
}

// <ErrorMessage name="owner.name" render={msg => <span style={{color: "red", fontSize: "14px"}}>{ msg }</span>} />

export default AddNewBusinesse;