import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import _deleteDoc from "./function/_deleteDoc.js";
import { deleteBusiness } from "./rtk/slices/businessesSlice.js";
import { useDispatch } from 'react-redux';

const BusinessSettings = () => {
	const { accessToken } = useParams();
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const handleDelete = () => {
		navigate("/businesses?tab=management");
		_deleteDoc("businesses", accessToken);
		dispatch(deleteBusiness(accessToken));
	}
	
	return (
		<section className="business-settings">
			{ accessToken }
			<span className="deleteBtn" onClick={handleDelete} style={{backgroundColor: 'red', display: 'block', width: 'fit-content'}}>Delete -</span>
		</section>
	)
}

export default BusinessSettings;