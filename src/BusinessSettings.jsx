import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

const BusinessSettings = () => {
	const { businessName } = useParams();
	
	return (
		<section className="business-settings">
			{ businessName }
		</section>
	)
}

export default BusinessSettings;