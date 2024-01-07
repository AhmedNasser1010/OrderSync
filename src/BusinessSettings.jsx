import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { deleteBusiness, updateBusiness } from "./rtk/slices/businessesSlice.js";
import { useDispatch, useSelector } from 'react-redux';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { object, string, date } from 'yup';
import { v4 as uuidv4 } from 'uuid';

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

const BusinessSettings = () => {
	const [currentBusiness, setCurrentBusiness] = useState({});
	const businesses = useSelector((state) => state.businesses);
	const { accessToken } = useParams();
	const navigate = useNavigate();
	const dispatch = useDispatch();

	useEffect(() => {
		setCurrentBusiness(businesses.filter((business) => business.accessToken === accessToken));
	}, [businesses])

	const handleDelete = () => {
		navigate("/businesses?tab=management");
		dispatch(deleteBusiness(accessToken));
	}
	
	return (
		<section className="business-settings theme1">
			<PageTitle title={currentBusiness[0]?.businessName} />
			<Formik
				enableReinitialize={true}
				initialValues={ currentBusiness[0] }
				validationSchema={businessSchema}
				onSubmit={values => {
					dispatch(updateBusiness(values));
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
		  			<button className="btnTheme" type="submit" disabled={isSubmitting}>Update .^.</button>
					</Form>
				)}
			</Formik>
			<button className="btnTheme red" onClick={handleDelete}>Delete -</button>
		</section>
	)
}

export default BusinessSettings;