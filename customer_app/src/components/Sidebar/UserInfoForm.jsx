import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field } from 'formik';
import { object, string } from 'yup';
import styled from 'styled-components'
import DB_ADD_DOC from '../../utils/DB_ADD_DOC'
import { initUser } from '../../rtk/slices/userSlice'
import { toggleLoginSidebar } from '../../rtk/slices/toggleSlice'

const Container = styled.div``
const FormContainer = styled(Form)`
	& label {
		margin-bottom: 20px;
    display: block;
	}
`

const phoneNumberRegex = /01\w{8}/

function UserInfoForm({ setExpandUserInfo }) {
	const dispatch = useDispatch()
	const user = useSelector(state => state.user)

	const initialValues = {
		name: user?.userInfo?.name || '',
		phone: user?.userInfo?.secondPhone?.slice(2) || ''
	}

	const validationSchema = object({
		name: string().required('name is required').min(3).max(25).notOneOf([user?.userInfo?.name]),
		phone: string().required('phone is required').notOneOf([user?.userInfo?.phone.slice(2)]).matches(phoneNumberRegex),
	})

	const InputWrapperProps = (name, placeholder, errors, touched) => {
		return {
			name: name,
			placeholder: placeholder,
			error: errors && touched && errors[name] && touched[name] && true
		}
	}

	return (

		<Container>
			<Formik
				enableReinitialize
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={values => {
					const finalUserData = {
						...user,
						userInfo: {
							...user.userInfo,
							name: values.name,
							secondPhone: '+2' + values.phone
						}
					}
					DB_ADD_DOC('customers', user?.userInfo?.uid, finalUserData).then(res => {
						setExpandUserInfo(false)
						dispatch(initUser(finalUserData))
						dispatch(toggleLoginSidebar())
						document.body.classList.remove("overflow-hidden")
					})
				}}
			>
				{({ errors, touched }) => (
					<FormContainer>
						<Field className={`w-full p-5 border border-gray-300 ${errors.name && 'text-red-500'}`} {...InputWrapperProps('name', 'Name', errors, touched)} />
						<Field className={`w-full p-5 border border-gray-300 border-t-0 mb-5 ${errors.phone && 'text-red-500'}`} {...InputWrapperProps('phone', 'Second Phone Number', errors, touched)} />
						<button type='submit' className='w-full bg-color-2 py-4 uppercase text-base text-white font-ProximaNovaSemiBold cursor-pointer'>Save</button>
					</FormContainer>
				)}
			</Formik>
		</Container>

	)
}

export default UserInfoForm